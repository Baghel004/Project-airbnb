const User = require('../models/user');
const { signToken } = require('../utils/jwt');
const { signupSchema, loginSchema } = require('../schema');

// POST /auth/signup -> validate, create user, return a signed JWT
module.exports.signup = async (req, res) => {
    // Validate input before touching the database (email format, password length, etc.).
    const { error, value } = signupSchema.validate(req.body, { abortEarly: true });
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    const { username, email, password } = value; // normalized (trimmed, email lowercased)
    try {
        // Friendly duplicate checks (clearer than the raw driver errors).
        if (await User.findOne({ email })) {
            return res.status(400).json({ error: 'An account with that email already exists' });
        }
        if (await User.findOne({ username })) {
            return res.status(400).json({ error: 'That username is taken' });
        }
        const user = new User({ username, email });
        // passport-local-mongoose handles hashing/salting.
        const registered = await User.register(user, password);
        const token = signToken(registered);
        res.status(201).json({
            token,
            user: { id: registered._id, username: registered.username },
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// POST /auth/login -> validate, verify credentials, return a signed JWT
module.exports.login = (req, res, next) => {
    const { error, value } = loginSchema.validate(req.body, { abortEarly: true });
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    const { username, password } = value;
    User.authenticate()(username, password, (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(401).json({ error: (info && info.message) || 'Invalid username or password' });
        }
        const token = signToken(user);
        res.json({ token, user: { id: user._id, username: user.username } });
    });
};

// POST /users/batch -> resolve [id] to [{id, username}] (denorm fallback)
module.exports.batch = async (req, res, next) => {
    try {
        const ids = Array.isArray(req.body.ids) ? req.body.ids : [];
        const users = await User.find({ _id: { $in: ids } }, 'username');
        res.json(users.map((u) => ({ id: u._id, username: u.username })));
    } catch (err) {
        next(err);
    }
};
