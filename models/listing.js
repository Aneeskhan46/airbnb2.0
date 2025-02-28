const mongoose = require("mongoose");
const review=require("./review.js")



const listingSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  image: {
    url: String,
    filename: String
   
  },
  location:String,
  country:String,

  review : [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref :"review"
    }
  ],

  ///owner(user id ) both same owner and user 
  owner:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"User"
  }

});


//deletion middleware .. whenever we delete listing this middleware triggers and delete all reviews belong to that listing
listingSchema.post("findOneAndDelete", async(listing)=>{
  if(listing){
    await review.deleteMany({_id:{$in:listing.review}})
  }
})

const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;
