const mongoose=require('mongoose')
const coupenSchema=new mongoose.Schema({
    
    name:{
        type:String,
        required:true
    },
    validity:{
        type:String,
        required:true
    },
    expiryDate:{
        type:String,
        required:true   
    },
    offer:{
        type:Number,
        required:true
    },
    Image:{
        type:String,
        required:true
    },
    minLimit:{
        type:Number,
        required:true
    },
    maxLimit:{
        type:Number,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    coupenCode:{
        type:String,
        required:true
    }

})
module.exports=mongoose.model('Coupen',coupenSchema)