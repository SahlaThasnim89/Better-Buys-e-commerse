
const isLogged=(req,res,next)=>{
    try {
        if(!req.session.admin){
            res.redirect('/admin/login')
        }else{
            next()
        } 
    } catch (error) {
        console.log(error.message);
    }
}

const isLogout=(req,res,next)=>{
    try {
        if(req.session.admin){
            res.redirect('/admin')
        }else{
            next()
        }
    } catch (error) {
        console.log(error.message);
    }
}

module.exports={
    isLogged,
    isLogout
}