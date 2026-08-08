const Artwork = require('../models/artwork');
const { cloudinary } = require('../config/cloudinary');
const maptilerClient = require('@maptiler/client');
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;

const parseTags = (tags) => {
    if (!tags) return [];
    return tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
};

module.exports.index = async (req, res) => {
    const artworks = await Artwork.find({})
        .populate('artist', 'username')
        .populate('reviews', 'rating');
    res.json({ artworks });
};

module.exports.create = async (req, res) => {
    const geoData = await maptilerClient.geocoding.forward(req.body.location, { limit: 1 });
    if (!geoData.features?.length) {
        return res.status(400).json({ message: 'Could not geocode that location. Please enter a valid location.' });
    }
    const artwork = new Artwork(req.body);
    artwork.tags = parseTags(req.body.tags);
    artwork.geometry = geoData.features[0].geometry;
    artwork.location = geoData.features[0].place_name;
    artwork.images = (req.files || []).map(f => ({ url: f.path, filename: f.filename }));
    artwork.artist = req.user._id;
    await artwork.save();
    res.status(201).json({ artwork, message: 'Successfully listed your artwork!' });
};

module.exports.show = async (req, res) => {
    const { id } = req.params;
    const artwork = await Artwork.findById(id)
        .populate('artist', 'username')
        .populate({ path: 'reviews', populate: { path: 'author', select: 'username' } });
    if (!artwork) {
        return res.status(404).json({ message: 'Cannot find that artwork!' });
    }
    res.json({ artwork });
};

module.exports.update = async (req, res) => {
    const { id } = req.params;
    const artwork = await Artwork.findById(id);
    if (!artwork) return res.status(404).json({ message: 'Cannot find that artwork!' });

    artwork.title = req.body.title;
    artwork.description = req.body.description;
    artwork.price = req.body.price;
    if (req.body.medium) artwork.medium = req.body.medium;
    artwork.tags = parseTags(req.body.tags);

    if (req.body.location && req.body.location !== artwork.location) {
        const geoData = await maptilerClient.geocoding.forward(req.body.location, { limit: 1 });
        if (!geoData.features?.length) {
            return res.status(400).json({ message: 'Could not geocode that location. Please enter a valid location.' });
        }
        artwork.geometry = geoData.features[0].geometry;
        artwork.location = geoData.features[0].place_name;
    }

    if (req.body.deleteImages) {
        const toDelete = Array.isArray(req.body.deleteImages) ? req.body.deleteImages : [req.body.deleteImages];
        for (let filename of toDelete) {
            await cloudinary.uploader.destroy(filename);
        }
        artwork.images = artwork.images.filter(img => !toDelete.includes(img.filename));
    }

    const newImages = (req.files || []).map(f => ({ url: f.path, filename: f.filename }));
    artwork.images.push(...newImages);

    await artwork.save();
    res.json({ artwork, message: 'Successfully updated your artwork!' });
};

module.exports.destroy = async (req, res) => {
    const { id } = req.params;
    await Artwork.findByIdAndDelete(id);
    res.json({ message: 'Successfully deleted artwork!' });
};
