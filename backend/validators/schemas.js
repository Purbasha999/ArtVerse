const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');
const { MEDIUMS } = require('../utils/constants');

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {}
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value });
                return clean;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension);

module.exports.artworkSchema = Joi.object({
    title: Joi.string().required().escapeHTML(),
    location: Joi.string().required().escapeHTML(),
    price: Joi.number().required().min(0),
    description: Joi.string().allow('').escapeHTML(),
    medium: Joi.string().valid(...MEDIUMS).optional(),
    tags: Joi.string().allow('').optional(),
    deleteImages: Joi.array().items(Joi.string())
});

module.exports.reviewSchema = Joi.object({
    body: Joi.string().allow('').optional().escapeHTML(),
    rating: Joi.number().min(1).max(5).optional()
});
