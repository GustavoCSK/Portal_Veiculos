const fs = require('node:fs');
const path = require('node:path');
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const execFileAsync = promisify(execFile);
const serviceName = process.env.MONGODB_SERVICE_NAME || (process.platform === 'win32' ? 'MongoDB' : 'mongod');

function getSecuritySection(lines) {
    const sectionIndices = lines
        .map((line, index) => ({ line, index }))
        .filter(({ line }) => /^\uFEFF?security\s*:/i.test(line))
        .map(({ index }) => index);

    if (sectionIndices.length > 1) {
        throw new Error('MongoDB config contains multiple security sections; resolve them manually.');
    }

    if (!sectionIndices.length) {
        return null;
    }

    const start = sectionIndices[0];
    if (!/^\uFEFF?security\s*:\s*(?:#.*)?$/i.test(lines[start])) {
        throw new Error('MongoDB config uses an inline security value; update it manually before enabling auth.');
    }

    let end = lines.length;
    for (let index = start + 1; index < lines.length; index += 1) {
        if (/^[^\s#][^:]*:\s*/.test(lines[index])) {
            end = index;
            break;
        }
    }

    return { start, end };
}

function getAuthorizationSetting(lines, section) {
    if (!section) return null;

    const settings = lines
        .slice(section.start + 1, section.end)
        .map((line, offset) => ({ line, index: section.start + 1 + offset }))
        .filter(({ line }) => /^\s+authorization\s*:/i.test(line));

    if (settings.length > 1) {
        throw new Error('MongoDB config contains multiple security.authorization settings.');
    }

    return settings[0] || null;
}

function isAuthorizationEnabled(content) {
    const lines = content.split(/\r?\n/);
    const section = getSecuritySection(lines);
    const setting = getAuthorizationSetting(lines, section);
    if (!setting) return false;

    const match = setting.line.match(/^\s+authorization\s*:\s*(.*?)\s*(?:#.*)?$/i);
    if (!match) {
        throw new Error('Could not read security.authorization from MongoDB config.');
    }

    const value = match[1].replace(/^(['"])(.*)\1$/, '$2').toLowerCase();
    return value === 'enabled' || value === 'true';
}

function enableAuthorization(content) {
    const lineEnding = content.includes('\r\n') ? '\r\n' : '\n';
    const hasTrailingNewline = /(?:\r\n|\n)$/.test(content);
    const lines = content.split(/\r?\n/);
    if (hasTrailingNewline) lines.pop();

    const section = getSecuritySection(lines);
    const setting = getAuthorizationSetting(lines, section);

    if (setting) {
        const match = setting.line.match(/^(\s+authorization\s*:\s*)(.*?)(\s+#.*)?$/i);
        if (!match) {
            throw new Error('Could not safely update security.authorization in MongoDB config.');
        }
        lines[setting.index] = `${match[1]}enabled${match[3] || ''}`;
    } else if (section) {
        lines.splice(section.start + 1, 0, '  authorization: enabled');
    } else {
        if (lines.length && lines[lines.length - 1] !== '') lines.push('');
        lines.push('security:', '  authorization: enabled');
    }

    return lines.join(lineEnding) + (hasTrailingNewline ? lineEnding : '');
}

function runFile(command, args, options = {}) {
    return execFileAsync(command, args, { windowsHide: true, ...options });
}

function getWindowsServiceConfigPath() {
    if (process.env.MONGODB_CONFIG_FILE) {
        return path.resolve(process.env.MONGODB_CONFIG_FILE);
    }

    const escapedServiceName = serviceName.replace(/'/g, "''");
    const command = `$service = Get-CimInstance Win32_Service -Filter "Name='${escapedServiceName}'"; if (-not $service) { throw 'MongoDB service not found' }; $service.PathName`;
    return runFile('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', command])
        .then(({ stdout }) => {
            const binaryPath = stdout.trim();
            const config = binaryPath.match(/(?:--config|-f)\s+(?:"([^"]+)"|'([^']+)'|([^\s"]+))/i);
            if (!config) {
                throw new Error(`Could not find the MongoDB config path in service "${serviceName}". Set MONGODB_CONFIG_FILE in .env.`);
            }
            return path.resolve(config[1] || config[2] || config[3]);
        });
}

async function getConfigPath() {
    if (process.env.MONGODB_CONFIG_FILE) {
        return path.resolve(process.env.MONGODB_CONFIG_FILE);
    }
    if (process.platform === 'win32') {
        return getWindowsServiceConfigPath();
    }
    return '/etc/mongod.conf';
}

async function checkPlatformPermissions() {
    if (process.platform === 'linux') {
        if (typeof process.getuid === 'function' && process.getuid() !== 0) {
            throw new Error('Run this command as root (for example, with sudo) to edit the MongoDB config and restart its service.');
        }

        const { stdout } = await runFile('systemctl', ['show', '--property=LoadState', '--value', serviceName]);
        if (stdout.trim() !== 'loaded') {
            throw new Error(`MongoDB systemd service "${serviceName}" is not installed.`);
        }
        return;
    }

    if (process.platform === 'win32') {
        const command = "if (-not ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) { throw 'Administrator privileges are required' }";
        await runFile('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', command]);
        return;
    }

    throw new Error(`Native MongoDB auth setup is not supported on ${process.platform}.`);
}

async function restartMongoDB() {
    if (process.platform === 'linux') {
        await runFile('systemctl', ['restart', serviceName]);
        return;
    }

    await runFile('powershell.exe', [
        '-NoProfile',
        '-NonInteractive',
        '-Command',
        '$service = Get-Service -Name $env:MONGODB_SERVICE_NAME -ErrorAction Stop; if ($service.Status -eq "Running") { Restart-Service -InputObject $service -Force -ErrorAction Stop } else { Start-Service -InputObject $service -ErrorAction Stop }',
    ], {
        env: { ...process.env, MONGODB_SERVICE_NAME: serviceName },
    });
}

function validateEnvironment() {
    const required = ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD', 'DB_ADMIN_USER', 'DB_ADMIN_PASSWORD'];
    const missing = required.filter((key) => !process.env[key]);
    if (missing.length) {
        throw new Error(`Missing MongoDB configuration in .env: ${missing.join(', ')}`);
    }

    if (!['localhost', '127.0.0.1'].includes(process.env.DB_HOST)) {
        throw new Error('For initial user creation, DB_HOST must point to this machine (localhost or 127.0.0.1).');
    }
}

async function verifyApplicationConnection() {
    const { connectDBUser } = require('./db');
    const connection = await connectDBUser();
    try {
        await connection.db.command({ ping: 1 });
    } finally {
        await connection.close();
    }
}

async function main() {
    validateEnvironment();
    await checkPlatformPermissions();

    const configPath = await getConfigPath();
    fs.accessSync(configPath, fs.constants.R_OK | fs.constants.W_OK);
    const originalConfig = fs.readFileSync(configPath, 'utf8');

    if (isAuthorizationEnabled(originalConfig)) {
        console.log('MongoDB authorization is already enabled; verifying the application database connection.');
        await verifyApplicationConnection();
        console.log('Application database connection verified.');
        return;
    }

    console.log('Creating the configured MongoDB users using the existing user setup script.');
    try {
        const { stdout, stderr } = await runFile(process.execPath, [path.join(__dirname, 'db_create_users.js')], {
            cwd: path.resolve(__dirname, '../../..'),
        });
        if (stdout) process.stdout.write(stdout);
        if (stderr) process.stderr.write(stderr);
    } catch (error) {
        const details = error.stderr?.trim() || error.message;
        throw new Error(`Could not create MongoDB users: ${details}`);
    }

    const updatedConfig = enableAuthorization(originalConfig);
    const backupPath = `${configPath}.bak.${new Date().toISOString().replace(/[:.]/g, '-')}`;
    fs.copyFileSync(configPath, backupPath, fs.constants.COPYFILE_EXCL);
    fs.writeFileSync(configPath, updatedConfig, { mode: fs.statSync(configPath).mode });
    console.log(`MongoDB config backed up to ${backupPath}.`);

    try {
        await restartMongoDB();
    } catch (error) {
        throw new Error(`MongoDB config now enables authorization, but service restart failed. Config backup: ${backupPath}. ${error.message}`);
    }

    await verifyApplicationConnection();
    console.log('MongoDB restarted with authorization enabled; application database connection verified.');
}

if (require.main === module) {
    main().catch((error) => {
        console.error('MongoDB auth setup failed:', error.message);
        process.exitCode = 1;
    });
}

module.exports = { enableAuthorization, isAuthorizationEnabled };
