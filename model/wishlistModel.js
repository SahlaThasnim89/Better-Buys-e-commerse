const mongoose=require('mongoose')
const WishlistSchema= new mongoose.Schema({
    UserId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User'
    },
    products:[{
        ProductId:{
            type:mongoose.Schema.Types.ObjectId,
            required:true,
            ref:'Product'
        }
    }]
    // CreatedAt:{
    //     type:String,
    //     required:true
    // }
})

module.exports= mongoose.model('Wishlist',WishlistSchema)