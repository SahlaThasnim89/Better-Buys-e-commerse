const Order = require('../model/orderModel')
const Address = require('../model/addressModel')
const Cart = require('../model/cartModel')
require('dotenv').config()
const instance = require('../config/razorPay')
const User = require('../model/userModel')
const Product = require('../model/productModel')
const Coupen = require('../model/coupenModel')
const Offer = require('../model/offerModel')
const Wallet = require('../model/walletModel')



//for order
const orderProduct = async (req, res) => {
  try {
    const { total } = req.body
    const { user } = req.session;
    const {status}=req.body
    console.log(status);
    const cart = await Cart.findOne({ clientId: user }).populate('products.productId');
    if (!cart || cart.products.length === 0) {
      req.flash('msg', 'Your cart is empty');
      return res.redirect('/cart');
    }

    const addressDoc = await Address.findOne({ UserId: user, 'address.status': true }, { 'address.$': 1 });
    if (!addressDoc) {
      req.flash('msg', 'Please add a valid delivery address');
      return res.redirect('/checkOut');
    }

    const { name, mobile, pincode, email, locality, addressData, city, state } = addressDoc.address[0];

    let cartAmount = cart.products.reduce((acc, item) => {
      return acc + item.productId.Price * item.quantity;
    }, 0);

    let orderAmount = total;
    let CoupenOffer = 0;

    if (req.session.coupondata) {
      CoupenOffer = req.session.coupondata.coupen[0].coupenId.offer;
      let offerPeice = orderAmount * CoupenOffer / 100
      let amount = orderAmount - offerPeice
      orderAmount = amount

      const used = await User.findOneAndUpdate(
        { _id: req.session.user, 'coupen.coupenCode': req.session.coupondata.coupen[0].coupenCode },
        { $set: { 'coupen.$.isClaimed': true } },
        { new: true }
      );
    }

    const wallet = await Wallet.findOne({ userId: req.session.user })


    const paymentMethod = req.body.payment || 'Cash on Delivery';
    const paymentStatus = paymentMethod === 'Cash on Delivery' ? 'Pending' : (paymentMethod === 'UPI' ? status : 'Paid');


    function generateCustomOrderId() {
      const date = new Date();
      const year = date.getFullYear();
      const month = (`0${date.getMonth() + 1}`).slice(-2);
      const day = (`0${date.getDate()}`).slice(-2);
      const random = Math.floor(Math.random() * 10000);
      return `Ord-${year}${month}${day}-${random}`;
    }

    const order = new Order({
      UserId: user,
      orderId: generateCustomOrderId(),
      products: cart.products.map((item) => ({
        productId: item.productId._id,
        productPrice: item.productId.OfferPrice,
        quantity: item.quantity,
      })),
      deliverAddress: {
        name,
        mobile,
        pincode,
        email,
        locality,
        addressData,
        city,
        state,
      },
      orderAmount,
      paymentMethod,
      paymentStatus,
      CoupenOffer
    });

    const orderSave = await order.save();

    if (!orderSave) {
      throw new Error('Order creation failed');
    }


    //function to check eligibility to get coupen
    const coupon = await Coupen.find({
      minPurchase: { $lte: orderAmount },
      maxPurchase: { $gte: orderAmount },
    });


    let alreadyGot = false
    let newCoupen
    if (coupon && coupon.length > 0) {
      for (const newOne of coupon) {
        const { user } = req.session
        const alreadyGot = await User.findOne({ _id: user, coupen: { $elemMatch: { coupenId: newOne._id } } })


        if (!alreadyGot) {
          newCoupen = newOne
          break
        }
      }


      if (newCoupen) {
        const currentDate = new Date();
        const expiryDate = new Date(currentDate);
        expiryDate.setDate(currentDate.getDate() + 15);
        const giveCoupen = await User.findOneAndUpdate(
          { _id: user },
          {
            $addToSet: {
              coupen: {
                coupenId: newCoupen._id,
                isClaimed: false,
                validity: expiryDate,
                coupenCode: newCoupen.coupenCode
              },
            },
          },
          { new: true }
        );
      }

    }

    if (paymentMethod === 'wallet') {
      const debit = await Wallet.findOneAndUpdate({ userId: req.session.user },
        {
          $inc: { balance: -(orderAmount) },
          $push: {
            transaction: {
              amount: orderAmount,
              type: 'debit',
              description: 'Product Order'
            }
          }
        },
        { new: true, upsert: true }
      );
    }



    for (const item of cart.products) {
      const product = await Product.findOne({ _id: item.productId });
      if (product) {
        const updatedQty = product.Quantity - item.quantity;
        await Product.findOneAndUpdate({ _id: item.productId }, { Quantity: updatedQty });
      }
    }



    await Cart.findOneAndDelete({ clientId: user });
    req.session.coupondata = null;
    res.redirect('/thanks');

  } catch (error) {
    console.error('Error during order placement:', error.message);
    req.flash('msg', 'An error occurred while placing your order');
    res.redirect('/checkOut');
  }
}




//razorPay
const razorPay=async(req,res)=>{
  try {
    const address = await Address.findOne({ UserId: req.session.user })
    if (address.address.length > 0) {
      const user = await User.findOne({ _id: req.body.userId })
      const amount = req.body.amount * 100
      const options = {
        amount,
        currency: "INR",
        receipt: 'sahlathasnim2002@gmail.com'
      }
      instance.orders.create(options, async (err, order) => {
        if (!err) {


          res.send({
            succes: true,
            msg: 'ORDER created',
            order_id: order.id,
            amount,
            key_id: process.env.RAZORPAY_IDKEY,
            name: user.FullName,
            email: user.email
          })
        } else {
          console.error("Error creating order:", err);
          res.status(500).send({ success: false, msg: "Failed to create order" });
        }
      })
    } else {
      res.send({ fail: true })
    }
  } catch (err) {
    console.log(err.message + ' razor')
  }
}


//admin Order List
const orderList = async (req, res) => {
  try {
    const limit=6
    const page=Number(req.query.page)||1;
    const skip=(page-1)*limit;
    const count=await Order.countDocuments()
    const pages=Math.ceil(count/limit)
    const order = await Order.find().populate('products.productId').sort({ orderDate: -1 }).skip(skip).limit(limit);
    res.render('admin/orderList', { order,pages,
      currentPage:page })
  } catch (error) {
    console.log(error.message);
  }
}

//admin side order Brief
const orderBrief = async (req, res) => {
  try {
    const orderid = req.params.id
    const details = await Order.findOne({ _id: orderid }).populate('products.productId UserId')
    res.render('admin/OrderBrief', { details })
    console.log(details, 'details');
  } catch (error) {
    console.log(error.message);
  }
}



//adminside

const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, newStatus } = req.body
    const update = await Order.findOneAndUpdate({ 'products._id': orderId }, { $set: { 'products.$.status': newStatus } }, { new: true })
    res.json(update);
  } catch (error) {
    console.log(error.massage);
  }
}




//user side
const OrderDetails = async (req, res) => {
  try {
    const item = req.params.id
    const orderItem = await Order.findOne({ 'products._id': item }, { 'products.$': 1, deliverAddress: 1 }).populate('products.productId')
    const orderData = await Order.findOne({ _id: orderItem._id })
    res.render('user/orderDetails', { item: orderItem, orderData })

  } catch (error) {
    console.log(error.message);
  }

}


// user order cancel
const orderCancel = async (req, res) => {
  try {
    const user = req.session.user
    const { cancel } = req.body
    const cancell = await Order.findOneAndUpdate({ UserId: user, 'products._id': cancel }, { $set: { 'products.$.status': 'cancelled' } });
    if (cancell) {
      const credit = await Wallet.findOneAndUpdate({ userId: req.session.user },
        {
          $inc: { balance: cancell.products[0].productPrice },
          $push: {
            transaction: {
              amount: cancell.products[0].productPrice,
              type: 'credit',
              description: 'Cancel Refund'
            }
          }
        },
        { new: true, upsert: true }
      );
    }
  } catch (error) {
    console.log(error.message);
  }
}


//Retry Payment

const retryPayment = async (req, res) => {
  try {
console.log('lklklklklklklkklklkllklklk');
      const user = await User.findOne({ _id: req.session.user })
      const amount = req.body.amount * 100
      const options = {
        amount,
        currency: "INR",
        receipt: 'sahlathasnim2002@gmail.com'
      }
      instance.orders.create(options, async (err, order) => {
        if (!err) {


          res.send({
            succes: true,
            msg: 'ORDER created',
            order_id: order.id,
            amount,
            key_id: process.env.RAZORPAY_IDKEY,
            name: user.FullName,
            email: user.email
          })
        } else {
          console.error("Error creating order:", err);
          res.status(500).send({ success: false, msg: "Failed to create order" });
        }
      })
  } catch (err) {
    console.log(err.message)
  }

}







//user side return request

const returnItem = async (req, res) => {
  try {
    const { reason, item } = req.body
    const find = await Order.findOne({ 'products._id': item, 'products.status': 'delivered' })
    if (find) {
      req.session.reason = reason
      req.session.item = item

      const returnRequest = await Order.findOneAndUpdate(
        { 'products._id': item },
        {
          $set: {
            'products.$.returnReason': reason,
          }
        }
      )
    }
  } catch (error) {
    console.log(error.message);
  }
}



//adminside return 
const approveReturnRequest = async (req, res) => {
  try {
    const { returnedItem } = req.body
    const item = await Order.findOneAndUpdate({ 'products._id': returnedItem }, { $set: { 'products.$.status': 'returned' } })
    const credit = await Wallet.findOneAndUpdate({ userId: req.session.user },
      {
        $inc: { balance: item.products[0].productPrice },
        $push: {
          transaction: {
            amount: item.products[0].productPrice,
            type: 'credit',
            description: 'Return Refund'
          }
        }
      },
      { new: true, upsert: true }
    );
    console.log(item,'item');
    res.send({ item })
  } catch (error) {
    console.log(error.message);
  }
}


//invoice
const invoice = async (req, res) => {
  try {
    const { id } = req.params
    const { order } = req.query
    const product = await Order.findOne({ _id: order, 'products._id': id }, { 'products.$': 1 }).populate('products.productId')
    const oorder = await Order.findOne({ _id: product })
    res.render('user/invoice', { product, oorder })
  } catch (error) {
    console.log(error.message);
  }
}


//retry success order
const  retryUpdate= async (req, res) => {
  try {
    const { status, orderId } = req.body
    const { user } = req.session;
    const update=await Order.findOneAndUpdate({UserId:user,_id:orderId},{$set:{paymentStatus:status}},{new:true})
  } catch {
    console.log(error.message);
  }
}




module.exports = {
  orderProduct,
  orderList,
  OrderDetails,
  orderBrief,
  updateOrderStatus,
  orderCancel,

  //return
  returnItem,
  approveReturnRequest,

  razorPay,

  invoice,
  // SuccessPayment,
  retryPayment,
  retryUpdate
}