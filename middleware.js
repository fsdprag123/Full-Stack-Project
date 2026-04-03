module.exports.isLoggedIn=(req,res,next)=>{
    console.log(req.user);
     if(!req.isAuthenticated()){
        req.flash("error","you must  logged in ");
        return res.redirect("/user/login");
    }
    next();
}