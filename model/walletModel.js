const mongoose = require('mongoose')
const walletSchema = new mongoose.Schema({
    userId:{
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User"
},
balance:{
    type:Number,
    required:true,
    default:0
},
transaction: [{
   amount:{
        type:Number
    },
    returnDate: {
        type: Date,
        default: Date.now
    },
    type:{
        type:String,
        enum:['debit','credit']
    },
    description:{
        type:String,
        enum:['Return Refund','Cancel Refund','Refferal Bonus','Welcome Bonus','Product Order']
    }
}]
})

module.exports = mongoose.model('Wallet', walletSchema)
