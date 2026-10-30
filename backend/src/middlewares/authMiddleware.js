const jwt = require('jsonwebtoken');
const path = require('node:path');
const dotenv = require('dotenv');

dotenv.config({
    path: path.resolve(__dirname, '../../../.env'),
});

/**
 * @param { Request } req
 * @param { Response } res
 * @param { Function } next
 */

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
        if (error) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        req.user = decoded;
        next();
    });
};
module.exports = authMiddleware;