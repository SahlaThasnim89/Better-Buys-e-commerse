const mongoose = require('mongoose')
const cartSchema = new mongoose.Schema({
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    products: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "Product"
        },
        quantity: {
            type: String,
            required: true,
            default: 1
        }
    }]
})

module.exports = mongoose.model('Cart', cartSchema)