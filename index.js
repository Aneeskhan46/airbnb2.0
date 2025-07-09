// from .envfile
if(process.env.NODE_ENV!="production"){
    require('dotenv').config()
}
// console.log(process.env.SECRET)  // remove this after you've confirmed it is working

const express= require("express");
const app = express();

const mongoose = require("mongoose");
const listing=require("./models/listing.js")
const path=require("path");
let methodoverride=require("method-override")
const ejsMate=require("ejs-mate");
const asyncwrap=require("./utils/wrapasync.js")
const expresserror = require("./utils/expresserror.js");
const review = require("./models/review.js");
//requiring session
const session = require("express-session");
//flash
const flash=require("connect-flash")
//passport
const user = require("./models/user.js")
const passport = require("passport")
const localstrategy= require("passport-local")
const {loggin,isowner,isreviewowner} = require("./middleware.js")
const multer  = require('multer')
const {storage}=require("./cloudconfig.js")
const upload = multer({ storage })
//mongo store 
const mongostore = require("connect-mongo")
///it connects atlas in env file 
const dburl = process.env.ATLASDB_URL

async function main() {
    // await mongoose.connect("mongodb://127.0.0.1:27017/airbnb"); //it is connection for local mongodb
    
    await mongoose.connect(dburl)   //it connects with mongodb atlas
}


main().then(()=>{
    console.log("connected base anees bhai")
})
.catch((err)=>{
    console.log(err);
})



app.listen(8080,()=>{
    console.log("listnening anees bhai");
})

//home route
// app.get("/",async(req,res)=>{
//     try{
//         const allListing= await listing.find({});
//         res.render("./listing/index.ejs",{allListing});
//     }catch(err) {
       
//        res.send(err)
      
//     }
   
// })

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"/views"))

app.use(express.urlencoded({extended:true}))
app.use(express.json());
app.use(methodoverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"public")));

//mongo store 
  const store = mongostore.create({
    mongoUrl:dburl,
    crypto:{
        secret:process.env.SECRET
    },
    touchAfter:24*3600
  })

//if error occurs in mongostore
store.on("error",(err)=>{
    console.log("error in mongo", err)
})


//session
const sessionoption={
    store:store,  //<<<mongo store
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie :{
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxage : 7 * 24 * 60 * 60 * 1000,
    httpOnly:true,

  }
}
app.use(session(sessionoption));
//flash
app.use(flash());


//passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localstrategy(user.authenticate()));

passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());


//flash middleware
app.use((req,res,next)=>{
    res.locals.successbhai=req.flash("success") //key
    res.locals.errorbhai=req.flash("error")
    // <!-- //signup login logout   passing to navbar.ejs, show.ejs -->   req.user() it indicates current user login //we dont want to pass in ejs file explicitly ,its defaultly pass
    res.locals.curruser= req.user;
    next();
})

//cookies
app.get("/setcookies",(req,res)=>{
    res.cookie("greet","namaste");
    res.cookie("origin","india");
    res.send("we sent a cookies");
})

///creating a fake demo user 
// app.get("/demouser", async(req,res)=>{
//     let fakeuser = new user({
//         email:"anee@gamil,com",
//         username:"anees",
//     })
//    let result= await user.register(fakeuser,"helloboy")
//     res.send(result)
// })


//^^^SIGN UP^^^//
app.get("/signup", (req,res)=>{
      res.render("./user/signup.ejs")
})

app.post('/signup',asyncwrap(async(req,res)=>{
    try{
        let {username,email,password}= req.body;
    let userinfo= new user({username,email});
    let info= await user.register(userinfo,password)
    console.log(info);
    //Automatically login after signup (req.login(username, function)) it is a method of passport
    req.login(info,(err)=>{
        if (err){
           next(err)
        }
        req.flash("success", "welcome to Airbnb")
        res.redirect("/listings")
    })
   
    } catch(e)  {
        req.flash("error",e.message)
        res.redirect("/signup")

    }
   
}))

///^^^LOG IN^^^///
app.get("/login",(req,res)=>{
    res.render("./user/login.ejs")
})

app.post("/login", passport.authenticate('local', { failureRedirect: '/login',failureFlash:true }),async(req,res)=>{
     req.flash("success","welcome back to airbnb")
     res.redirect("/listings")
})

///^^^LOG OUT^^^///
app.get("/logout",(req,res)=>{
    req.logOut((err)=>{
        if(err){
            next(err)
        }
        req.flash("success","you logout")
        res.redirect("/listings")
    })
})

// app.get("/testlisting",async (req,res)=>{
//     const samplelisting= new listing({
//         title:"my new villa",
//         description:"by the beach",
//         price:1200,
//         location:"calangute,goa",
//         country:"india",
//      })
//      await samplelisting.save();
//      console.log("sample was saved");
//      res.send("successfull bhai");
     
// });


app.get("/",(req,res)=>{
    res.render("./listing/root.ejs")
})

//index route



app.get("/listings", ( async (req,res,next)=>{
    try{
        const allListing= await listing.find({});
        res.render("./listing/index.ejs",{allListing});
    }catch(err) {
       
       res.send(err)
      
    }
     
    }));




// app.get("/listing/:id",async (req,res)=>{
//     let {id}=req.params;
//     await listing.findById(id).then((res)=>{
//         console.log(res)
//     })

// })      ///it is to check whether it is working or not  

//create new route  //loggin middlware
app.get("/listing/new",loggin,(req,res)=>{

    res.render("./listing/create.ejs") /// (./listing make sure to indicate which folder)
})

//show route
app.get("/listing/:id", asyncwrap(async (req,res)=>{
        let {id}=req.params;
        ///populate it sends all the information of reviews
       let list= await  listing.findById(id).populate({
                             path:"review",
                             populate:{
                                path:"owner"
                                      }
                             })
                             .populate("owner");
       
       //flass error
       if(!list){
        req.flash("error","listing requested does not exist")
        res.redirect("/listings")
       }
        
       res.render("./listing/show.ejs",{list})
       
        }))
    
// app.get("/listing/new",(req,res)=>{
//     res.render("./listing/create.ejs") /// (./listing make sure to indicate which folder)
// })  
//  ^^^DONT PUT IN THIS ORDER  ^^^^^^


//create [upload.single('listing[image.url]')>>>it is a middleware of upload image]
app.post("/listing/create",upload.single('listing[image.url]'),(async (req,res)=>{        //listing extract from form
    //   extracting url and file from req.file
      let url = req.file.path
      let filename=req.file.filename

      let newlisting = new listing(req.body.listing); 
   //storing user(owner)id when we creating a listing
   newlisting.owner=req.user._id;
   //storing image url and filename 
   newlisting.image={url,filename}

    await newlisting.save();
    //flash  ==> req.flash(key,message) and it goes to middleware
    req.flash("success","anees bhai listing created")
                                                          /// {in one line}await listing(req.body.listing).save();
    res.redirect("/listings")
}))

//update or edit route
app.get("/listing/:id/edit",loggin,isowner, (async (req,res)=>{
    let {id}=req.params;
    let list = await listing.findById(id);
    res.render("./listing/edit.ejs",{list})
}));

app.put("/listing/:id",upload.single('listing[image][url]'),async (req,res)=>{
    let {id}= req.params;
     let list= await listing.findByIdAndUpdate(id,{...req.body.listing})
     
     if(typeof req.file!=="undefined"){
     let url=req.file.path
     let filename=req.file.filename
     list.image={url,filename}
     await list.save();
     }

     req.flash("success","anees bhai listing edited")
        res.redirect(`/listing/${id}`);
     })


//reviews
app.post("/listing/:id/review",loggin, async (req,res)=>{
    let {id}= req.params;
    let list= await  listing.findById(id);
    let allreview = new review(req.body.review);
    allreview.owner=req.user._id;

    list.review.push(allreview);

    await list.save();
    await allreview.save();
    req.flash("success","anees bhai review added")

    console.log("review saved")
    res.redirect(`/listing/${id}`)

});

//review delete
app.delete("/listing/:id/review/:reviewid",isreviewowner, async(req,res)=>{
   let {id , reviewid}=req.params;

   await listing.findByIdAndUpdate(id, {$pull: {review:reviewid}});
   await review.findByIdAndDelete(reviewid)
   req.flash("success","anees bhai review deleted")
 
 res.redirect(`/listing/${id}`)
})


    
//delete  ///also see the deletion middleware in listing.js 
app.delete("/listing/:id",isowner,async (req,res)=>{
    let {id}= req.params
     await listing.findByIdAndDelete(id)
     req.flash("success","anees bhai listing Deleted")
    res.redirect("/listings")
})


// error page // if you pass invalid route it execute
app.all("*",(req,res,next)=>{
    // res.send("page not found")
    next(new expresserror(404,"PAGE NOT FOUND")) 
    ///this next^^ will go to app.use(err,eq,res,next)=>{......
})

// wherever the error presents it comes here
app.use((err,req,res,next)=>{
    let {status, message } =err;
   res.render("./listing/error.ejs", {message})
})




