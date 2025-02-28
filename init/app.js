const mongoose = require("mongoose");
const initData= require("./data.js")
const listing = require("../models/listing.js");



main().then(()=>{
    console.log("bhai done")
}).catch(err=>{
    console.log(err);
})

async function main() {
   await mongoose.connect("mongodb://127.0.0.1:27017/airbnb")
}

const initDB = async () => {
    await listing.deleteMany({});
    initData.data = initData.data.map((obj)=>({...obj , owner:"67b34e8dd4b3509e02c273c1",}));
    await listing.insertMany(initData.data);  ///inserting all the data to mongodb
    console.log("data was initialized");
  };
  

  initDB();