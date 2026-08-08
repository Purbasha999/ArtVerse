const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review');
const { MEDIUMS } = require('../utils/constants');

const opts = { toJSON: { virtuals: true }, timestamps: true };

const ImageSchema = new Schema({
    url: String,
    filename: String
}, { _id: false });

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_300');
});

const ArtworkSchema = new Schema({
    title: { type: String, required: true },
    images: [ImageSchema],
    price: { type: Number, required: true, min: 0 },
    description: String,
    medium: {
        type: String,
        enum: MEDIUMS,
        default: 'Other'
    },
    tags: [{ type: String, trim: true, lowercase: true }],
    location: { type: String, required: true },
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: 'Review'
    }],
    artist: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, opts);

ArtworkSchema.index({ geometry: '2dsphere' });

ArtworkSchema.virtual('properties.popUpMarkup').get(function () {
    return `
    <strong><a href="/artworks/${this._id}">${this.title}</a></strong>
    <p>${this.description ? this.description.substring(0, 20) : ''}...</p>`;
});

ArtworkSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: { $in: doc.reviews }
        });
    }
});

module.exports = mongoose.model('Artwork', ArtworkSchema);
