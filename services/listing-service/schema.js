const Joi = require('joi');

// The categories used by the home-page filter icons.
const CATEGORIES = [
    'Trending', 'Rooms', 'Iconic Cities', 'Mountains', 'Castles',
    'Amazing Pools', 'Camping', 'Farms', 'Arctic', 'Domes', 'Boats',
];

// Validation is owned by the service that owns the data. `image` is not validated here —
// it arrives as a multipart file (req.file), not a body field.
const listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        price: Joi.number().required().min(0),
        location: Joi.string().required(),
        country: Joi.string().required(),
        category: Joi.string().valid(...CATEGORIES).optional().allow('', null),
    }).required(),
});

module.exports = { listingSchema, CATEGORIES };
