const asyncwrap=function asyncwrap(fn){
    return function(req,res,next){
        fn(req,res,next).catch((err)=>next(err));
    }
}
///next(err))  this is will go to that function [app.use((err,req,res,next).......)]


module.exports = asyncwrap;