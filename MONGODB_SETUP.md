# MongoDB Setup Without Docker

These instructions cover MongoDB installed natively on Ubuntu or Windows. They do not change the Docker container used by the current workspace.

## Ubuntu

## Prerequisites

Install MongoDB Server and `mongosh` by following the [official Ubuntu installation guide](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-ubuntu/). Confirm that the service is available:

```bash
mongod --version
mongosh --version
sudo systemctl status mongod
```

## Create the Maintenance Account

If authorization is currently disabled and no users exist, connect locally and create a maintenance account in the `admin` database:

```bash
mongosh
```

```javascript
use admin

db.createUser({
  user: "portal_root",
  pwd: passwordPrompt(),
  roles: [{ role: "root", db: "admin" }]
})
```

Keep this account for database maintenance only. Do not use it in the application. If authorization is already enabled and the server has no users, MongoDB's localhost exception allows creating the first administrative user from a local connection.

## Enable Authorization

Edit `/etc/mongod.conf`. Add the following at the YAML root, or add `authorization` under the existing `security` section if one is already present:

```yaml
security:
  authorization: enabled
```

Restart and check the service:

```bash
sudo systemctl enable mongod
sudo systemctl restart mongod
sudo systemctl status mongod
```

Authenticate as the maintenance account:

```bash
mongosh --host 127.0.0.1 --port 27017 \
  --username portal_root \
  --authenticationDatabase admin \
  --password
```

`--password` prompts for the password instead of placing it in shell history.

## Create Project Users

The project currently uses `AUTH_SOURCE=portal_veiculos`, so create both project users in that authentication database. In the authenticated `mongosh` session:

```javascript
use portal_veiculos

db.createUser({
  user: "<DB_ADMIN_USER>",
  pwd: passwordPrompt(),
  roles: [
    { role: "dbAdmin", db: "portal_veiculos" },
    { role: "userAdmin", db: "portal_veiculos" }
  ]
})

db.createUser({
  user: "<DB_USER>",
  pwd: passwordPrompt(),
  roles: [
    { role: "readWrite", db: "portal_veiculos" }
  ]
})
```

Replace the username placeholders with the values configured in `.env`. `dbAdmin` allows the setup script to create collections and indexes. `userAdmin` lets the setup account manage users within this database; omit it if that account should only manage database structure. Add `readWrite` to the setup account only if the setup script also inserts seed data.

The application account has only `readWrite` on `portal_veiculos`. Since both project accounts are created in that database, use `AUTH_SOURCE=portal_veiculos` for both connections.

## Project Configuration

Set these keys in the root `.env`; replace the password placeholders with your real values and keep them private:

```dotenv
DB_HOST=127.0.0.1
DB_PORT=27017
DB_NAME=portal_veiculos
AUTH_SOURCE=portal_veiculos
DB_USER=your_application_user
DB_PASSWORD=your_application_password
DB_ADMIN_USER=your_setup_user
DB_ADMIN_PASSWORD=your_setup_password
```

The application and seed process use the `DB_USER` account. `DB_ADMIN_USER` is only for setup and user management in this database; it is not a MongoDB-wide root account. If `AUTH_SOURCE` is omitted, the application now defaults it to `DB_NAME`.

## Enable Authentication Automatically

The setup command reuses `backend/src/db/db_create_users.js` to create the configured database users, enables MongoDB authorization in the native server config, makes a timestamped backup of that config, restarts the MongoDB service, and verifies the application account can connect. It does not erase database data. `DB_HOST` must be a loopback address for initial user creation.
Stop the running API while the database restarts; it can then be started again with the authenticated connection settings.

On Ubuntu, run from the repository root with administrator privileges:

```bash
sudo node backend/src/db/enable_auth.js
```

On Windows, open PowerShell as Administrator in the repository root and run:

```powershell
npm --prefix backend run db:enable-auth
```

Ubuntu defaults to `/etc/mongod.conf` and the `mongod` systemd service. Windows reads the config path from the registered `MongoDB` service. If a custom path or service name is used, override the defaults in the root `.env`. For example:

```dotenv
# Ubuntu example:
MONGODB_CONFIG_FILE=/etc/mongod.conf
MONGODB_SERVICE_NAME=mongod

# Windows example (use the actual installed version/path):
# MONGODB_CONFIG_FILE=C:\Program Files\MongoDB\Server\8.0\bin\mongod.cfg
# MONGODB_SERVICE_NAME=MongoDB
```

## Windows (Native Service)

These steps assume MongoDB Server was installed as a Windows service using the [official Windows installation guide](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-windows/). The MSI installation normally starts the service. Install `mongosh` separately if it is not available in PowerShell.

Open PowerShell as Administrator and check the service:

```powershell
Get-Service -Name MongoDB
```

The default service name is `MongoDB`. To find the active service command and configuration path:

```powershell
(Get-CimInstance Win32_Service -Filter "Name='MongoDB'").PathName
```

The default configuration file is under the MongoDB installation directory, usually `C:\Program Files\MongoDB\Server\<version>\bin\mongod.cfg`. Replace `<version>` with the installed version. You can list installed version folders with:

```powershell
Get-ChildItem "$env:ProgramFiles\MongoDB\Server"
```

If authorization is disabled and no users exist, create the maintenance account before enabling authorization. In a regular PowerShell window, connect locally:

```powershell
mongosh "mongodb://127.0.0.1:27017/admin"
```

Then in `mongosh`:

```javascript
use admin

db.createUser({
  user: "portal_root",
  pwd: passwordPrompt(),
  roles: [{ role: "root", db: "admin" }]
})
```

Keep this account for maintenance only. If authorization is already enabled and no users exist, MongoDB's localhost exception allows creating the first administrative user locally.

Edit `mongod.cfg` as Administrator and add the following YAML at the root, or add `authorization` under its existing `security` section:

```yaml
security:
  authorization: enabled
```

Restart the service from elevated PowerShell:

```powershell
Restart-Service -Name MongoDB
Get-Service -Name MongoDB
```

Authenticate as the maintenance account:

```powershell
mongosh --host 127.0.0.1 --port 27017 --username portal_root --authenticationDatabase admin --password
```

After logging in, follow [Create Project Users](#create-project-users) above. Keep the root account out of `.env`; use the project-specific setup and application users there. If MongoDB was installed without a Windows service, start `mongod.exe` manually with its configuration file and restart that process after editing the configuration.
