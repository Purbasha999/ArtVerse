const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReviewSchema = new Schema({
    body: String,
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    artwork: {
        type: Schema.Types.ObjectId,
        ref: 'Artwork'
    }
}, { timestamps: true });

module.exports = mongoose.model('Review', ReviewSchema);
