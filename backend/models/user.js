const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    avatar: {
        url: String,
        filename: String
    },
    followers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

userSchema.plugin(passportLocalMongoose.default);

module.exports = mongoose.model('User', userSchema);
