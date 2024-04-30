const User=require('../model/userModel')

const isLogged=(req,res,next)=>{
    try {
        if(!req.session.user){
            res.redirect('/login')
        }else{
            next()
        } 
    } catch (error) {
        console.log(error.message);
    }
   
}



const isLogout=(req,res,next)=>{
    try {
        if(req.session.user){
            res.redirect('/admin/home')
        }else{
            next()
        }
    } catch (error) {
        console.log(error.message);
    }
    
}



const entryRestrict=async(req,res,next)=>{
    try {
        const check=await User.findOne({UserId:req.session.user})
        if(!check.is_blocked===true){
            next()
        }else{
            res.session.Distroy()
            res.redirect('/login')
        }
    } catch (error) {
        console.log(error.message);
    }
}

module.exports={
    isLogged,
    isLogout,
    entryRestrict

}