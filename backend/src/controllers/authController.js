const user = require('../config/userSchema');
const bcrypt = require('bcrypt');
const path = require('node:path');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

dotenv.config({
    path: path.resolve(__dirname, '../../../.env'),
});

/**
 * @param { Request } req
 * @param { Response } res
 */

exports.Login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const existingUser = await user.findOne({ username });
        if (!existingUser) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const isPasswordValid = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const token = jwt.sign({ id: existingUser._id, username: existingUser.username }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(200).json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Error during login', error: error.message });
    }
};
