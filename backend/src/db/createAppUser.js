mongoose = require('mongoose');
user = require('../config/userSchema');
const bcrypt = require('bcrypt');
const path = require('node:path');
const dotenv = require('dotenv');

user = mongoose.models.User || mongoose.model('User', user);

dotenv.config({
    path: path.resolve(__dirname, '../../../.env'),
});

const password = process.env.APP_USER_PASSWORD;
const appUser = process.env.APP_USER_LOGIN;

async function createAppUser() {
    try {
        const existingUser = await user.find({ username: appUser });
        if (!existingUser) {
            const newUser = new user({
                username: appUser,
                password: await bcrypt.hash(password, 10),
            });
            await newUser.save();
        }
    } catch (error) {
        console.error('Error creating app user:', error);
    }
}

createAppUser();