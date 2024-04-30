const passport=require('passport')


const googleSignup=passport.authenticate('google',{
    scope:['profile','email']
})


const googleSignupCallback=passport.authenticate('google',{
    failureRedirect:'/'
},(req,res)=>{
    res.redirect('/dashboard')
})


const logout=(req,res)=>{
    req.logout()
    res.redirect('/')
}

module.exports={
    googleSignup,
    googleSignupCallback,
    logout
}
