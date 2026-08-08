if (process.env.NODE_ENV !== 'production') { require('dotenv').config({ quiet: true }); }

const mongoose = require('mongoose');
const Artwork = require('../models/artwork');
const User = require('../models/user');
const cities = require('./india-cities');
const { adjectives, subjects, mediums, tagPool } = require('./seedHelpers');
const dbUrl = process.env.DB_URL;

const { LoremIpsum } = require('lorem-ipsum');
const lorem = new LoremIpsum({
    wordsPerSentence: { min: 4, max: 8 },
    sentencesPerParagraph: { min: 3, max: 6 }
});

mongoose.connect(dbUrl)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log('Mongo connection error:', err));

const sample = array => array[Math.floor(Math.random() * array.length)];

// Placeholder images (Picsum) so the app has something to display out of the
// box - replace with real uploads through the app once you're seeded a demo
// account. Swap for your own Cloudinary account once you've generated keys.
const placeholderImage = (seed) => ({
    url: `https://picsum.photos/seed/${seed}/800/600`,
    filename: `seed/${seed}`
});

const seedArtworks = async () => {
    await Artwork.deleteMany({});
    const userIds = (await User.find({}, '_id')).map(u => u._id);
    if (!userIds.length) {
        console.log('No users found - register at least one account before seeding artworks.');
        return mongoose.connection.close();
    }

    for (let i = 0; i < 30; i++) {
        const city = sample(cities);
        const author = sample(userIds);
        const numTags = 2 + Math.floor(Math.random() * 3);
        const tags = Array.from(new Set(Array.from({ length: numTags }, () => sample(tagPool))));

        const artwork = new Artwork({
            artist: author,
            title: `${sample(adjectives)} ${sample(subjects)}`,
            location: `${city.city}, ${city.state}`,
            description: lorem.generateParagraphs(1),
            price: Math.floor(Math.random() * 45000) + 500,
            medium: sample(mediums),
            tags,
            geometry: {
                type: 'Point',
                coordinates: [city.longitude, city.latitude]
            },
            images: [placeholderImage(`artverse-${i}-a`), placeholderImage(`artverse-${i}-b`)]
        });
        await artwork.save();
    }
};

seedArtworks().then(() => {
    console.log('Seeding complete');
    mongoose.connection.close();
});
