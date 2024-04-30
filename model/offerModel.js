const mongoose=require('mongoose')
const offerSchema=new mongoose.Schema({
    offerName:{
        type:String,
        required:true
    },
    discount:{
        type:Number,
        required:true
    },
    expiry:{
        type:Number,
        required:true
    },
    Type:{
        type:String,
        required:true
    },
    productId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Product'
    },
    categoryId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    }
})
module.exports=mongoose.model('Offer', offerSchema)