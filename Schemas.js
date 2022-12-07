const joi = require('joi') 

module.exports.campSchema = joi.object({
    title: joi.string().required(),
    price: joi.number().required().min(0),
    location: joi.string().required(),
    description: joi.string().required(),
    deleteImages: joi.array()
   // image: joi.string().required()
})

module.exports.reviewSchema = joi.object({
    rating: joi.number().required(),
    body: joi.string().required()
})