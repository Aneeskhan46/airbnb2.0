const listing=require("./models/listing.js");
const review = require("./models/review.js");
const user = require("./models/user");



///loggin middleware

module.exports.loggin = async(req,res,next)=>{
    console.log(req.user)
    if(!req.isAuthenticated()){
        req.flash("error","you need to log in");
         return res.redirect("/login")   // Fix: Added return to stop execution
    }
    next()
}
//this next() goes to log in 



module.exports.isowner = async(req,res,next)=>{
   let {id}= req.params;
   let list = await listing.findById(id)
   if(!list.owner.equals(req.user._id)){
      req.flash("error","you are not the owner " )
      return res.redirect(`/listing/${id}`)   // Fix: Added return to stop execution
   }
   next();
}

module.exports.isreviewowner = async(req,res,next)=>{
    let {id,reviewid}= req.params;
    let reviewres = await review.findById(reviewid)
    if(!reviewres.owner.equals(req.user._id)){
       req.flash("error","you are not the review owner " )
       return res.redirect(`/listing/${id}`)   // Fix: Added return to stop execution
    }
    next();
 }