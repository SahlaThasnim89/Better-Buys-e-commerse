const User=require('../model/userModel')
const Coupen=require('../model/coupenModel')
const moment = require('moment');
const { name } = require('ejs');
const expiryDate=moment()


//admin side
const coupen=async(req,res)=>{
    try {
        const coupen=await Coupen.find()
        res.render('admin/coupenPage',{coupen}) 
    } catch (error) {
       console.log(error.message); 
    }
}

const addCoupen=async(req,res)=>{
    try {
        res.render('admin/addCoupen')
    } catch (error) {
       console.log(error.message); 
    }
}


const generatecode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '#';
    for (let i = 0; i < 11; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        code+= characters.charAt(randomIndex);
    }
    return code;
};


const coupenAdding=async(req,res)=>{
    try {
        const images=req.file.filename
        const {name,valid,minimum,maximum,offer,description}=req.body
        const ExpiredOn = expiryDate.add(valid,'days')
        const user = req.session.user;
        const Add=new Coupen({           
            name:name,
            validity:valid,
            offer:offer,
            minLimit:minimum,
            maxLimit:maximum,
            description:description,
            Image:images,
            coupenCode:generatecode(),
            expiryDate:ExpiredOn.format('DD-MM-YYYY')

        })
        const newCoupen= await Add.save()
        res.redirect('/admin/Coupen')
    } catch (error) {
        console.log(error.message);
    }
}

const editPage=async(req,res)=>{
    try {
        const id=req.params.id
        const toEdit=await Coupen.findOne({_id:id})
        res.render('admin/editCoupen',{edit:toEdit})
    } catch (error) {
        console.log(error.message);
    }
}

const CoupenEditing=async(req,res)=>{
    try {
        const {name,valid,offer,minimum,maximum,description,id}=req.body
        const edit=await Coupen.findOneAndUpdate({_id:id},{$set:{
        name:name,
        validity:valid,
        offer:offer,
        minLimit:minimum,
        maxLimit:maximum,
        description:description,
       }})
       res.redirect('/admin/Coupen')
    } catch (error) {
       console.log(error.message); 
    }
}


 

module.exports={
    coupen,
    addCoupen,
    coupenAdding,
    editPage,
    CoupenEditing


}