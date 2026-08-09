const Joi = require('joi');

// Signup validation. Runs before we touch the database, so bad input is rejected early
// with a clear message (email format, password length, username rules).
const signupSchema = Joi.object({
    username: Joi.string().trim().min(3).max(30).pattern(/^[a-zA-Z0-9_]+$/).required()
        .messages({
            'string.min': 'Username must be at least 3 characters',
            'string.max': 'Username must be at most 30 characters',
            'string.pattern.base': 'Username may only contain letters, numbers and underscores',
            'any.required': 'Username is required',
            'string.empty': 'Username is required',
        }),
    // email({ tlds: { allow: false } }) validates the shape (a@b.c) without requiring a
    // known top-level domain, so "not-an-email" is rejected but test domains still work.
    email: Joi.string().trim().lowercase().email({ tlds: { allow: false } }).required()
        .messages({
            'string.email': 'Please enter a valid email address',
            'any.required': 'Email is required',
            'string.empty': 'Email is required',
        }),
    password: Joi.string().min(6).max(128).required()
        .messages({
            'string.min': 'Password must be at least 6 characters',
            'string.max': 'Password is too long',
            'any.required': 'Password is required',
            'string.empty': 'Password is required',
        }),
});

const loginSchema = Joi.object({
    username: Joi.string().trim().required().messages({
        'any.required': 'Username is required',
        'string.empty': 'Username is required',
    }),
    password: Joi.string().required().messages({
        'any.required': 'Password is required',
        'string.empty': 'Password is required',
    }),
});

module.exports = { signupSchema, loginSchema };
