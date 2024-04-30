const mongoose=require('mongoose')
const CategorySchema=new mongoose.Schema({
    CategoryName:{
        type:String,
        required:true
    },
    Description:{
        type:String,
        required:true
    },
    is_blocked:{
        type:Boolean,
        required:true,
        default:false
    },
    Offer:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Offer"
      }
})
module.exports=mongoose.model("Category",CategorySchema)
