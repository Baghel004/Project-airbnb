// Seeds the listings database with a set of demo listings so the home page isn't empty.
// Idempotent: removes any previous seed listings (owned by the "wanderlust" seed user)
// before inserting, so it can be re-run safely.
//
// Run locally:      LISTINGS_DB_URL=... node seed.js
// Run in-cluster:   kubectl -n wanderlust exec deploy/listing-service -- node seed.js

if (process.env.NODE_ENV != "production") {
    require("dotenv").config();
}

const mongoose = require('mongoose');
const Listing = require('./models/listing');

const SEED_OWNER_ID = new mongoose.Types.ObjectId('000000000000000000000001');
const SEED_OWNER_NAME = 'wanderlust';

const img = (url) => ({ url, filename: 'seed' });
const point = (lng, lat) => ({ type: 'Point', coordinates: [lng, lat] });

const listings = [
    {
        title: 'Oceanfront Villa in Malibu',
        description: 'Wake up to the sound of waves in this bright beachfront villa with a private deck.',
        image: img('https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=60'),
        price: 42000, location: 'Malibu', country: 'United States', geometry: point(-118.7798, 34.0259), category: 'Amazing Pools',
    },
    {
        title: 'Cozy Wooden Cabin in Manali',
        description: 'A snug Himalayan cabin surrounded by pine forests and mountain views.',
        image: img('https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=800&q=60'),
        price: 3500, location: 'Manali', country: 'India', geometry: point(77.1892, 32.2396), category: 'Mountains',
    },
    {
        title: 'Beach Shack by the Sea in Goa',
        description: 'Chill steps from the sand with hammocks, sunsets and fresh seafood nearby.',
        image: img('https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=60'),
        price: 2800, location: 'Goa', country: 'India', geometry: point(73.8278, 15.2993), category: 'Boats',
    },
    {
        title: 'Chic Apartment near the Eiffel Tower',
        description: 'A stylish Parisian flat a short stroll from cafés, museums and the Seine.',
        image: img('https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=60'),
        price: 15000, location: 'Paris', country: 'France', geometry: point(2.3522, 48.8566), category: 'Iconic Cities',
    },
    {
        title: 'Traditional Machiya in Kyoto',
        description: 'A restored wooden townhouse with a tranquil garden in historic Kyoto.',
        image: img('https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=60'),
        price: 9800, location: 'Kyoto', country: 'Japan', geometry: point(135.7681, 35.0116), category: 'Rooms',
    },
    {
        title: 'Cliffside Cave House in Santorini',
        description: 'Whitewashed cave suite with a plunge pool and unforgettable caldera sunsets.',
        image: img('https://images.unsplash.com/photo-1469796466635-455ede028aca?auto=format&fit=crop&w=800&q=60'),
        price: 22000, location: 'Santorini', country: 'Greece', geometry: point(25.4615, 36.3932), category: 'Domes',
    },
    {
        title: 'Luxury Ski Chalet in Aspen',
        description: 'Ski-in ski-out chalet with a hot tub, fireplace and panoramic slope views.',
        image: img('https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=800&q=60'),
        price: 55000, location: 'Aspen', country: 'United States', geometry: point(-106.8175, 39.1911), category: 'Arctic',
    },
    {
        title: 'Jungle Villa with Pool in Bali',
        description: 'A serene villa wrapped in rice terraces with an infinity pool and open-air living.',
        image: img('https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?auto=format&fit=crop&w=800&q=60'),
        price: 12000, location: 'Ubud, Bali', country: 'Indonesia', geometry: point(115.2624, -8.5069), category: 'Camping',
    },
    {
        title: 'Alpine Retreat in Zermatt',
        description: 'A warm timber chalet with front-row views of the Matterhorn.',
        image: img('https://images.unsplash.com/photo-1502786129293-79981df4e689?auto=format&fit=crop&w=800&q=60'),
        price: 38000, location: 'Zermatt', country: 'Switzerland', geometry: point(7.7491, 46.0207), category: 'Mountains',
    },
    {
        title: 'Modern Loft with Table Mountain Views',
        description: 'A design-led loft in the heart of Cape Town, close to the V&A Waterfront.',
        image: img('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=60'),
        price: 8600, location: 'Cape Town', country: 'South Africa', geometry: point(18.4241, -33.9249), category: 'Iconic Cities',
    },
].map((l) => ({ ...l, ownerId: SEED_OWNER_ID, ownerUsername: SEED_OWNER_NAME }));

(async () => {
    const dbUrl = process.env.LISTINGS_DB_URL;
    if (!dbUrl) {
        console.error('LISTINGS_DB_URL is not set');
        process.exit(1);
    }
    await mongoose.connect(dbUrl);
    const removed = await Listing.deleteMany({ ownerUsername: SEED_OWNER_NAME });
    const inserted = await Listing.insertMany(listings);
    console.log(`Seed complete: removed ${removed.deletedCount} old, inserted ${inserted.length} listings.`);
    await mongoose.disconnect();
})().catch((err) => {
    console.error('Seed failed:', err.message);
    process.exit(1);
});
