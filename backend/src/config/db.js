const path = require('node:path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({
    path: path.resolve(__dirname, '../../../credentials.env'),
});

const {
    DB_HOST,
    DB_PORT,
    DB_NAME,
    DB_USER,
    DB_PASSWORD,
    DB_ADMIN_USER,
    DB_ADMIN_PASSWORD,
    AUTH_SOURCE = 'admin',
} = process.env;

async function DBconnectWithCredentials(username, password) {
    const missing = Object.entries({ DB_HOST, DB_PORT, DB_NAME, username, password })
        .filter(([, value]) => !value)
        .map(([name]) => name);

    if (missing.length) {
        throw new Error("Missing MongoDB configuration: " + missing.join(", "));
    }

    const uri = "mongodb://" + encodeURIComponent(username) + ":" +
        encodeURIComponent(password) + "@" + DB_HOST + ":" + DB_PORT + "/" +
        DB_NAME + "?authSource=" + encodeURIComponent(AUTH_SOURCE);

    await mongoose.connect(uri);
    return mongoose.connection;
}

const connectDBAdmin = () => DBconnectWithCredentials(DB_ADMIN_USER, DB_ADMIN_PASSWORD);
const connectDBUser = () => DBconnectWithCredentials(DB_USER, DB_PASSWORD);

module.exports = { connectDBAdmin, connectDBUser };