

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/appError');

const protect = async (req, res, next) => {

    let token;

    // Check cookie first
    if (req.cookies && req.cookies.accessToken) {
        token = req.cookies.accessToken;
    }

    // Optional: support Bearer token too
    if (
        !token &&
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(
            new AppError('Not authorized, no token', 401)
        );
    }

    try {

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.user = await User.findById(decoded.id)
            .select('-password');

        if (!req.user) {
            return next(
                new AppError('User not found', 401)
            );
        }

        next();

    } catch (error) {

        if (error.name === 'TokenExpiredError') {
            return next(
                new AppError('Token expired', 401)
            );
        }

        return next(
            new AppError('Not authorized, token failed', 401)
        );
    }
};


module.exports = { protect };