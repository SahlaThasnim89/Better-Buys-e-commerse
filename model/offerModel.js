const mongoose=require('mongoose')
const offerSchema=new mongoose.Schema({
    offerName:{
        type:String,
        required:true
    },
    discount:{
        type:Number,
        required:true
    }
})
module.exports=mongoose.model('Offer', offerSchema)