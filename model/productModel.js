const mongoose = require('mongoose')
const ProductSchema = new mongoose.Schema({
  Name: {
    type: String,
    required: true
  },
  Description: {
    type: String,
    required: true
  },
  Category: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Category"
  },
  Price: {
    type: Number,
    required: true
  },
  is_listed: {
    type: Boolean,
    required: true,
    default: true
  },
  Quantity: {
    type: Number,
    required: true,
    default: 1
  },
  date: {
    type: String,
    required: true
  },
  image: {
    type: Array,
    required: true
  }
  // hasOffer:{
  //   type:Boolean,
  //   required:true,
  //   default:false
  // },
  // Offer:{
  //   type:mongoose.Schema.Types.ObjectId,
  //   ref:"Offer"
  // }

})

module.exports = mongoose.model("Product", ProductSchema)