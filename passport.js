const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User=require("./model/userModel")
require('dotenv').config();


passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.CLIENTID,
            clientSecret: process.env.CLIENT_SECRET,
            callbackURL: "https://betterbuys.cloud/auth/google/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
            
            console.log(profile);

            try {
         
                const { id: googleId, email, displayName: FullName } = profile;

                let user = await User.findOne({ email: profile._json.email });
                if (!user) {
                  
                    user = await User.create({
                        googleId,
                        email: profile._json.email,
                        FullName,
                        password:googleId,
               
                        mobile:'08958093553'
                    });
                }

               
                return done(null, user);
            } catch (error) {
                console.error("Error during Google authentication:", error);
                return done(error, null);
            }
        }
    )
);

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

module.exports = {
    googleAuth: passport.authenticate("google", { scope: ["profile", "email"] }),

    googleCallback: passport.authenticate("google", {
        failureRedirect: "/login",
      
    }),

    setupSession: (req, res, next) => {
 
        if (req.isAuthenticated()) {
         
            req.session.user = req.user._id;
        } 
        console.log(req.session.user);
        res.redirect("/");
    },
};