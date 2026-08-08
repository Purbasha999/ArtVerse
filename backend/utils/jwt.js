const jwt = require('jsonwebtoken');

// Auth is stateless: no session document in MongoDB, no server-side session
// store. Login/register mint a signed JWT and hand it back in an httpOnly
// cookie; every later request is authenticated by verifying that cookie.
const COOKIE_NAME = 'artverse.token';
const TOKEN_TTL = '7d';
const COOKIE_MAX_AGE = 1000 * 60 * 60 * 24 * 7; // 7 days, mirrors TOKEN_TTL
const isProduction = process.env.NODE_ENV === 'production';

const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax'
};

module.exports.COOKIE_NAME = COOKIE_NAME;

module.exports.signToken = (user) =>
    jwt.sign({ id: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: TOKEN_TTL });

module.exports.verifyToken = (token) => jwt.verify(token, process.env.JWT_SECRET);

module.exports.setTokenCookie = (res, token) => {
    res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: COOKIE_MAX_AGE });
};

module.exports.clearTokenCookie = (res) => {
    res.clearCookie(COOKIE_NAME, cookieOptions);
};
