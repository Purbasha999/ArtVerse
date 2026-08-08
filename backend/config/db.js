const mongoose = require('mongoose');

module.exports = function connectDB() {
    const dbUrl = process.env.DB_URL;
    mongoose.connect(dbUrl)
        .then(() => console.log('MongoDB connected'))
        .catch(err => console.log('Mongo connection error:', err));
    return mongoose.connection;
};
