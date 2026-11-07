const mongoose = require('mongoose');
const userSchema = require('../config/userSchema');
const bcrypt = require('bcrypt');
const path = require('node:path');
const dotenv = require('dotenv');
const { connectDBUser } = require('./db');

const User = mongoose.models.User || mongoose.model('User', userSchema);

dotenv.config({
    path: path.resolve(__dirname, '../../../.env'),
});

const password = process.env.APP_USER_PASSWORD;
const appUser = process.env.APP_USER_LOGIN;

async function createAppUser() {
    if (!appUser || !password) {
        throw new Error('Missing APP_USER_LOGIN or APP_USER_PASSWORD configuration');
    }

    const connection = await connectDBUser();
    try {
        const existingUser = await User.findOne({ username: appUser });
        if (existingUser) {
            console.log('Application user already exists.');
            return;
        }

        const newUser = new User({
                username: appUser,
                password: await bcrypt.hash(password, 10),
        });
        await newUser.save();
        console.log('Application user created.');
    } catch (error) {
        throw new Error('Error creating app user: ' + error.message);
    } finally {
        await connection.close();
    }
}

createAppUser().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
});