const mongoose=require("mongoose")
mongoose.connect("mongodb+srv://Sahla:123sahala@ecomarese.ee0tfwe.mongodb.net/?retryWrites=true&w=majority&appName=Ecomarese")
const morgan=require('morgan')
const express=require("express")
const session=require("express-session")
const nocache=require("nocache")
const path = require('path')
const flash = require('express-flash');
const Swal = require('sweetalert2')
require ('dotenv').config()


const app=express()


const port=process.env.PORT||3000

app.set("view engine","ejs")
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(nocache())
// app.use(morgan('dev'))
app.use(session({ secret: 'secretKey', resave: true, saveUninitialized: true }));
app.use(flash())

Swal.fire({
  title: 'Error!',
  text: 'Do you want to continue',
  icon: 'error',
  confirmButtonText: 'Cool'
})


//load static assets
app.use("/static",express.static(path.join(__dirname,"public")))
app.use("/asset",express.static(path.join(__dirname,"public/user/asset")))
app.use("/asset",express.static(path.join(__dirname,"public/admin/asset/")))




//for user
const userRoute=require("./routes/userRoute")
app.use("/",userRoute)

//for admin
const adminRoute=require('./routes/adminRoute')
app.use('/admin',adminRoute)

app.get('*',(req,res)=>{
  res.redirect('/error')
})



app.listen(port, () => {
    console.log(
      `Server is successfully running. Click here for more info: \x1b[34mhttps://betterbuys.cloud`
    );
  });