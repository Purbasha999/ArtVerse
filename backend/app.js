if (process.env.NODE_ENV !== 'production') { require('dotenv').config({ quiet: true }); }

const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const cors = require('cors');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const helmet = require('helmet');
const expressMongoSanitize = require('@exortek/express-mongo-sanitize');

const ExpressError = require('./utils/ExpressError');
const connectDB = require('./config/db');
const User = require('./models/user');
const { attachUser } = require('./middleware');

const authRoutes = require('./routes/auth');
const artworkRoutes = require('./routes/artworks');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');

const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
const isProduction = process.env.NODE_ENV === 'production';

connectDB();

// Behind a proxy (Render/Vercel/etc.) so secure cookies are detected correctly.
if (isProduction) app.set('trust proxy', 1);

app.use(cors({
    origin: clientUrl,
    credentials: true
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(expressMongoSanitize());
app.use(helmet({
    contentSecurityPolicy: false // this server only serves JSON; the React app owns its own CSP concerns
}));

// Stateless auth: no session store. passport-local-mongoose still checks
// username/password on login; attachUser reads the JWT cookie on every
// request afterwards and loads req.user from it (see utils/jwt.js).
app.use(passport.initialize());
passport.use(new LocalStrategy(User.authenticate()));
app.use(attachUser);

app.use('/api/auth', authRoutes);
app.use('/api/artworks', artworkRoutes);
app.use('/api/artworks/:id/reviews', reviewRoutes);
app.use('/api/users', userRoutes);

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'ArtVerse API' });
});

app.all(/(.*)/, (req, res, next) => {
    next(new ExpressError('Not Found', 404));
});

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Something went wrong';
    res.status(statusCode).json({ message: err.message });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`ArtVerse API serving on port ${port}`);
});
