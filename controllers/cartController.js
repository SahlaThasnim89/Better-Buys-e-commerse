const Cart = require('../model/cartModel')
const Product = require('../model/productModel')
const Address = require('../model/addressModel')
const Coupen=require('../model/coupenModel')



const cartPage = async (req, res) => {
    try {
        const { user } = req.session;
        const cart = await Cart.findOne({ clientId: user }).populate('products.productId');
         res.render('user/cart', { data: cart, user });
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
};


const addtoCart = async (req, res) => {
    try {
        const id = req.body.id
        const prodData = await Product.findOne({ _id: id })
        const added = await Cart.findOne({
            clientId: req.session.user,
            products: {
                $elemMatch: {
                    productId: id
                }
            }

        })
        if (!added) {
            const add = await Cart.findOneAndUpdate(
                { clientId: req.session.user },
                { $addToSet: { products: { productId: id, quantity: req.body.quantity } } },
                { new: true, upsert: true }
            );
 
        } else {
            res.send({ set: 'already there' })
        }

    } catch (error) {
        console.log(error.message);
    }
}



const qtyControll = async (req, res) => {
    try {
        const { change, current } = req.body
        const update = await Cart.findOneAndUpdate({ clientId: req.session.user, 'products.productId': change }, { $set: { 'products.$.quantity': current } }, { new: true })
        res.status(200).send('success')

    } catch (error) {
        console.log(error.message);
    }
}



const deleteItem = async (req, res) => {
    try {
         const { delet,qty } = req.body
         const find = await Cart.findOneAndUpdate({ clientId: req.session.user }, { $pull: { products: { productId: delet } } })
         res.redirect('/cart')
    } catch (error) {
        console.log(error.message);
    }
}



//checkout page

const checkout = async (req, res) => {

    try {
        const { user } = req.session
        const msg=req.flash('msg')
        const coupen=req.body.couponId
        const id = await Address.findOne({ UserId: user })
        const check = await Cart.findOne({ clientId: user }).populate('products.productId')
        
        if (!check || check.products.length === 0) {
            return res.render('user/cart', { data: check, id });
        }
        res.render('user/checkout', { id, check ,msg, coupen})

    } catch (error) {
        console.log(error.message);
    }

}

const billingAddress = async (req, res) => {
    try {
        const { name, mobile, email, pincode, locality, address, city, state } = req.body
        const check = await Address.findOne({
            UserId: req.session.user,
            address: {
                $elemMatch: {
                    locality: locality
                }
            }
        })
        if (!check) {
            const add = await Address.findOneAndUpdate({ UserId: req.session.user },
                {
                    $addToSet:
                    {
                        address:
                        {
                            name: name,
                            mobile: mobile,
                            email: email,
                            pincode: pincode,
                            locality: locality,
                            addressData: address,
                            city: city,
                            state: state,
                            status: true
                        }
                    }
                },
                { new: true, upsert: true })

            res.redirect('/checkOut')
        } else {
            req.flash('msg', 'address already exist')
            res.redirect('/checkOut')
        }
    } catch (error) {
        console.log(error.message);
    }
}





const selectAddress = async (req, res) => {
    try {
        const select = await Address.bulkWrite([
            {
                updateOne: {
                    filter: { UserId: req.session.user, 'address.status': true },
                    update: { $set: { 'address.$.status': false } }
                }
            },
            {
                updateOne: {
                    filter: { UserId: req.session.user, 'address._id': req.body.select },
                    update: { $set: { 'address.$.status': true } }
                }
            }
        ]);

        const selected = await Address.findOne({ UserId: req.session.user, 'address._id': req.body.select }, { 'address.$': 1 })
        res.send({ selected })

    } catch (error) {
        console.log(error.message);
    }
}



const editCheckAddress=async(req,res)=>{
    try {
        const{id}=req.body
            const edit=await Address.findOne({'address._id':id},{'address.$':1})
            console.log(edit);
            res.json({edit})
    } catch (error) {
        console.log(error.message);
    }
}


const edited=async(req,res)=>{
        try {
            const {user}=req.session
            const{name,mobile,email,pincode,locality,address,city,state,id}=req.body
            const update=await Address.findOneAndUpdate({UserId:user, 'address._id':id},
            {
                $set: {
                    'address.$.name': name,
                    'address.$.mobile': mobile,
                    'address.$.pincode': pincode,
                    'address.$.email': email,
                    'address.$.locality': locality,
                    'address.$.addressData': address,
                    'address.$.city': city,
                    'address.$.state': state
                }
            })
            res.redirect('/checkOut')
     
    } catch (error) {
        console.log(error.message);
    }
}


const applyCoupen=async(req,res)=>{
    try {
       const {coupen,data}=req.body
       req.session.coupenCode=coupen
       const coupondata=await Coupen.findOne({coupenCode:req.session.coupenCode})

         let discountAmount = 0;
         let subTotal = data

         if (coupondata) {
             discountAmount = Math.ceil(subTotal * coupondata.offer / 100);
             Total = Math.ceil(subTotal - discountAmount);
             
         }else{
            discountAmount = 0;
            Total = Math.ceil(subTotal - discountAmount);
         }

       res.send({coupondata, discountAmount, Total})
    } catch (error) {
        console.log(error.message);
    }
}






module.exports = {
    cartPage,
    addtoCart,
    qtyControll,
    deleteItem,


    //checkout,
    checkout,
    billingAddress,
    selectAddress,
    editCheckAddress,
    edited,

    //coupens
    applyCoupen
}
