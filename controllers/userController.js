const User = require("../model/userModel")
const bcrypt = require("bcrypt")
const nodemailer = require("nodemailer")
const Product = require("../model/productModel")
const Offer = require('../model/offerModel')

const home = async (req, res) => {
    const activeProd = await Product.find({ is_listed: true })
    res.render("user/homepage", { haveuser: req.session.user, product: activeProd })
}

//for registration form
const registrationForm = async (req, res) => {
    try {
        const msg = req.flash('err')
        res.render("user/register", { msg })
    } catch (error) {
        console.log(error.message);
    }
}


const otpPage = async (req, res) => {
    const msg = req.flash('err')
    res.render('user/otp_page', { msg })
}




const firstNameRegex = /^[a-zA-Z]+(?: [a-zA-Z]+)*$/;
const lastNameRegex = /^[a-zA-Z]+(?: [a-zA-Z]+)*$/;
const emailRegex = /^[A-Za-z0-9.%+-]+@gmail\.com$/;
const mobileRegex = /^\d{10}$/;



//to get datails from form
const insertUser = async (req, res) => {
    try {
        const { firstName, lastName, email, mobile, password, confirmPassword } = req.body
        if (password !== confirmPassword) {

            req.flash("err", "Passwords do not match");
            return res.redirect('/register')
        }

        if (!firstNameRegex.test(firstName)) {
            const errormsg = "Invalid Details";
            req.flash("err", errormsg);
            return res.redirect('/register');
        }
        if (!lastNameRegex.test(lastName)) {
            return res.redirect('/register');
        }
        if (!emailRegex.test(email)) {
            return res.redirect('/register');
        }
        if (!mobileRegex.test(mobile)) {
            return res.redirect('/register');
        }


        const passwordHash = await bcrypt.hash(password, 10);
        const FullName = firstName + " " + lastName
        const userData = { FullName, email, mobile, password: passwordHash }
        req.session.userData = userData
        req.session.otp = generateOTP();
        console.log(req.session.otp);
        await OtpMailSending(req.session.userData, req.session.otp);
        res.redirect("/otp")
    } catch (error) {
        console.log(error.message);
    }
}


const generateOTP = () => {
    return Math.floor(1000 + Math.random() * 9000);
}

function combineOTP(parts) {
    return parts.join("")
}



const OtpMailSending = async (userData, otp) => {
    try {
        // Configure Nodemailer transporter
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'sahlathasnim2002@gmail.com',
                pass: 'itiv ckgx dwce vxgg',
            },
        })




        const mailOptions = {
            from: 'sahlathasnim2002@gmail.com',
            to: userData.email,
            subject: 'Your OTP for registration',
            text: `Your OTP is:${otp}`
        }

        // Send email and handle the response
        const info = await transporter.sendMail(mailOptions)
        console.log(`Email sent:${info}`);
    } catch (error) {
        console.log(error.message);
    }
}


const EnteredOTP = async (req, res) => {
    try {
        const otpParts = [
            req.body.digit1,
            req.body.digit2,
            req.body.digit3,
            req.body.digit4
        ]
        console.log(otpParts);

        // Combine the entered OTP parts into a single OTP
        const enteredOTP = combineOTP(otpParts)
        console.log('enteredOTP:', enteredOTP);


        if (req.session.otp) {
            // Retrieve the stored OTP from the session
            const storedOTP = req.session.otp
            console.log('storedOTP:', storedOTP)

            // Check if the entered OTP is valid
            if (enteredOTP == storedOTP) {
                const user = new User(req.session.userData)
                await user.save();
                req.session.user = user._id
                console.log(user);

                res.redirect('/')
            } else {
                req.flash('err', 'OTP is incorrect');
                res.redirect('/otp')
            }

        } else {
            const stored = req.session.otpforget
            console.log('stored:', stored)
            console.log(enteredOTP, 'aaaaaaaaaaaaa');
            if (enteredOTP == stored) {
                res.render('user/forgotReset')
            } else {
                req.flash('err', 'OTP is incorrect');
                res.redirect('/otp')
            }
        }


    } catch (error) {
        console.log(error.message);
    }
}


const resendOtp = async (req, res) => {
    try {
        req.session.otp = undefined
        if (req.session.otp === undefined) {
            req.session.otp = generateOTP()
            console.log(req.session.otp);
            await OtpMailSending(req.session.userData, req.session.otp);
            res.redirect('/otp')
        }
    } catch (error) {
        console.log(error.message);
    }
}


const loginload = async (req, res) => {
    try {
        const msg = req.flash('err')
        res.render('user/login', { msg })
    } catch (error) {
        console.log(error.message);
    }
}


const loginUser = async (req, res) => {
    try {
        const checkUser = await User.findOne({ email: req.body.email })
        if (checkUser) {
            if (checkUser.is_blocked === false) {
                const passwordcheck = await bcrypt.compare(req.body.password, checkUser.password)
                if (passwordcheck) {
                    req.session.user = checkUser._id
                    res.redirect('/')
                } else {
                    const errormsg = "Password is incorrect";
                    req.flash("err", errormsg);
                    res.redirect('/login')
                }
            } else {
                const errormsg = "You cannot purchase more";
                req.flash("err", errormsg);
                res.redirect('/login')
            }
        } else {
            const errormsg = "Email is not found";
            console.log(errormsg, 'mmmmm');
            req.flash("err", errormsg);
            res.redirect('/login')
        }

    } catch (error) {
        console.log(error.message);
    }
}


const forgetpw = (req, res) => {
    const msg = req.flash('err')
    res.render('user/email', { msg })
}


const getEmail = async (req, res) => {
    try {
        const email = await User.findOne({ email: req.body.email })
        if (email) {
            req.session.emailforget = req.body.email
            if (email) {
                req.session.otpforget = generateOTP()
                console.log(req.session.otpforget);
                OtpMailSending(email, req.session.otpforget)
                res.redirect('/otp')
            }
        } else {
            const errormsg = "Email not registered";
            console.log(errormsg, 'mmmmm');
            req.flash("err", errormsg);
            res.redirect('/forgetpw')
        }
    }
    catch (error) {
        console.log(error.message);
    }
}


const fpReset = async (req, res) => {
    try {
        const newPw = await bcrypt.hash(req.body.password, 10)
        const id = await User.findOneAndUpdate({ email: req.session.emailforget }, { $set: { password: newPw } })
        res.redirect('/login')
    } catch (error) {
        console.log(error.message);
    }

}


//shop page

        const shoplist = async (req, res) => {
            try {
              const limit = 12;
              const page = Number(req.query.page) || 1;
              const skip = (page - 1) * limit;
          
              const count = await Product.countDocuments({ is_listed: true });
              const pages = Math.ceil(count / limit);
          
              let productAdmin = await Product.find({ is_listed: true })
                                             .populate('Category')
                                             .skip(skip)
                                             .limit(limit);
          
              productAdmin = productAdmin.filter(
                product => product.Category && !product.Category.is_blocked
              );
          
              if (req.query.search) {
                const content = new RegExp(`.*${req.query.search.trim()}.*`, 'i');
                productAdmin = await Product.find({
                  $and: [
                    { $or: [{ Name: content }, { Description: content }] },
                    { is_listed: true },
                  ],
                }).populate('Category').exec();
              }
          
              const noMatchingItems = productAdmin.length === 0;
              const offersFound = await Offer.find();
          
              res.render('user/shop', {
                productAdmin,
                pages,
                currentPage: page,
                noMatchingItems,
                offersFound,
              });

    } catch (error) {
        console.log(error.message);
    }
}



const singleProduct = async (req, res) => {
    try {
        const product = req.params.id
        if (product.length === 24) {
            const selected = await Product.findOne({ _id: product }).populate('Category')
            if (selected) {
                const offersFound = await Offer.find()
                res.render('user/productDesc', { data: selected,
                                                    offersFound})
            } else {
                res.redirect('/error')
            }
        } else {
            res.redirect('/error')
        }

    } catch (error) {
        console.log(error.message);
    }

}



//sort
const lowTohigh = async (req, res) => {
    try {
      const { id } = req.params;
      const { search } = req.query;
  
      const sortOptions = {
        lowtoHigh: { Price: 1 },
        highTolow: { Price: -1 },
        alphabetic: { Name: 1 },
        reverseAplphabet: { Name: -1 },
      };
  
      const sort = sortOptions[id] || { Name: -1 };
      let arrange = await Product.find({ is_listed: true }).sort(sort);
  
      if (search) {
        const content = new RegExp(`.*${search.trim()}.*`, 'i');
        arrange = await Product.find({
          $and: [
            { $or: [{ Name: content }, { Description: content }, { date: content }] },
            { is_listed: true },
          ],
        }).populate('Category').exec();
      }
  
      const noMatchingItems = arrange.length === 0;
      const offersFound = await Offer.find();
  
      res.render('user/shop', { productAdmin: arrange, noMatchingItems, offersFound });
    } catch (error) {
        console.log(error.message);
    }
}



        const categoryWise = async (req, res) => {
            try {
              const { id } = req.params;
              const { search } = req.query;
          
              const sortOptions = {
                lowtoHigh: { Price: 1 },
                highTolow: { Price: -1 },
                alphabetic: { Name: 1 },
                reverseAplphabet: { Name: -1 },
              };
          
              const sort = sortOptions[req.query.sort] || { Name: -1 };
          
              let productData = await Product.aggregate([
                {
                  $lookup: {
                    from: 'categories',
                    localField: 'Category',
                    foreignField: '_id',
                    as: 'category',
                  },
                },
                { $unwind: '$category' },
                {
                  $match: {
                    'category.CategoryName': id,
                    is_listed: true,
                  },
                },
              ]);
          
              productData = await Product.find({
                _id: { $in: productData.map((p) => p._id) },
              })
                .populate('Category')
                .sort(sort);
          
              if (search) {
                const content = new RegExp(`.*${search.trim()}.*`, 'i');
                productData = await Product.find({
                  $and: [
                    { _id: { $in: productData.map((p) => p._id) } },
                    { $or: [{ Name: content }, { Description: content }] },
                    { is_listed: true },
                  ],
                })
                  .populate('Category')
                  .sort(sort);
              }
          
              const noMatchingItems = productData.length === 0;
              const offersFound = await Offer.find();
          
              res.render('user/shop', {
                productAdmin: productData,
                noMatchingItems,
                offersFound,
              });
    } catch (error) {
        console.log(error.message);
    }
}





const Logout = async (req, res) => {
    req.session.user = null
    res.redirect('/')
}


const thanks = async (req, res) => {
    res.render("user/thanks")
}

const page404 = async (req, res) => {
    res.render("user/404")
}

// const home=async(req,res)=>{
//     res.render("user/shop")
// }



//for user side offers on products
// const applyOffer=async(req,res)=>{
//  try {
//     const 
//  } catch (error) {
//     console.log(error.message);
//  }
// }





module.exports = {
    home,
    registrationForm,
    insertUser,
    otpPage,
    EnteredOTP,
    OtpMailSending,
    resendOtp,
    loginload,
    loginUser,
    Logout,
    forgetpw,
    getEmail,
    fpReset,

    shoplist,
    singleProduct,
    lowTohigh,
    categoryWise,

    page404,


    thanks

}