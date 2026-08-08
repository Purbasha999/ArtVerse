const passport = require('passport');
const User = require('../models/user');
const { signToken, setTokenCookie, clearTokenCookie } = require('../utils/jwt');

const publicUser = (user) => ({ _id: user._id, username: user.username, email: user.email, phone: user.phone, avatar: user.avatar });

module.exports.register = async (req, res) => {
    try {
        const { username, email, phone, password, confirmPassword } = req.body;
        if (!username || !email || !phone || !password) {
            return res.status(400).json({ message: 'Name, email, phone and password are required.' });
        }
        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match!' });
        }
        const user = new User({ username, email, phone });
        const registeredUser = await User.register(user, password);
        setTokenCookie(res, signToken(registeredUser));
        res.status(201).json({
            user: publicUser(registeredUser),
            message: `Welcome ${registeredUser.username}, to ArtVerse!`
        });
    } catch (e) {
        res.status(400).json({ message: e.message });
    }
};

module.exports.login = (req, res, next) => {
    // session: false - passport-local still verifies the username/password
    // via passport-local-mongoose, it just doesn't establish a session.
    passport.authenticate('local', { session: false }, (err, user, info) => {
        if (err) return next(err);
        if (!user) {
            return res.status(401).json({ message: info?.message || 'Invalid username or password.' });
        }
        setTokenCookie(res, signToken(user));
        res.json({ user: publicUser(user), message: `Welcome back ${user.username}!` });
    })(req, res, next);
};

module.exports.logout = (req, res) => {
    clearTokenCookie(res);
    res.json({ message: 'Successfully logged out!' });
};

module.exports.me = (req, res) => {
    if (!req.user) return res.json({ user: null });
    res.json({ user: publicUser(req.user) });
};
