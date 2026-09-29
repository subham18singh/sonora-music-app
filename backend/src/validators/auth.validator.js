const { body } = require('express-validator');

const registerValidator = [
    body('userName')
        .isString().withMessage('userName must be a string')
        .trim()
        .isLength({ min: 3, max: 30 }).withMessage('userName must be 3-30 characters')
        .matches(/^[a-zA-Z0-9_.]+$/).withMessage('userName can only contain letters, numbers, _ and .'),

    body('email')
        .isString().withMessage('email must be a string')
        .trim()
        .isEmail().withMessage('Enter a valid email')
        .normalizeEmail(),

    body('password')
        .isString().withMessage('password must be a string')
        .isLength({ min: 8, max: 72 }).withMessage('password must be 8-72 characters')
        .matches(/[a-z]/).withMessage('password needs a lowercase letter')
        .matches(/[A-Z]/).withMessage('password needs an uppercase letter')
        .matches(/[0-9]/).withMessage('password needs a number'),

    body('role')
        .optional()
        .isIn(['user', 'artist']).withMessage('role must be either "user" or "artist"'),
];

const loginValidator = [
    body('userName')
        .optional()
        .isString().withMessage('userName must be a string')
        .trim()
        .notEmpty().withMessage('userName cannot be empty'),

    body('email')
        .optional()
        .isString().withMessage('email must be a string')
        .trim()
        .isEmail().withMessage('Enter a valid email')
        .normalizeEmail(),

    body()
        .custom((value) => value && (value.userName || value.email))
        .withMessage('Provide either userName or email'),

    body('password')
        .isString().withMessage('password must be a string')
        .notEmpty().withMessage('password is required'),
];

module.exports = { registerValidator, loginValidator };