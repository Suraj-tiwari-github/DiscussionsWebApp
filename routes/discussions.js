const express=require('express');
const router=express.Router(); 
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");
const { discussionSchema, replySchema } = require("../schemas.js");
//* Our model
const Discussion=require('../models/discussion');

//!isLoggedIn middleware.
const {isLoggedIn}=require('../middleware');

//* our middleware for the models schema
const validateDiscussion=(req,res,next)=>{
    const {error}=discussionSchema.validate(req.body);
    if(error){
        const msg=error.details.map(el=>el.message).join(',')
        throw new ExpressError(msg,400);
    }
    else{
        next();
    }
}

router.get(
  "/",
  catchAsync(async (req, res) => {
    const discussion = await Discussion.find({});
    //    res.send(discussion)
    res.render("pages/discussionList", { discussion });
  })
);


//! show route.
router.get(
  "/:id",
  catchAsync(async (req, res) => {
    const discussion = await Discussion.findById(req.params.id).populate({
      path:"replies",
      populate:{
          path:'author'
      }
    }).populate('author');
    // console.log(discussion);
    // res.send(discussion);
    if(!discussion){
        req.flash('error', "Cannot find that Discussion Page");
        return res.redirect('/discussionPage');
    }
    res.render("pages/show", { discussion });
  })
);

//! edit route.
router.get(
  "/:id/edit", isLoggedIn,
  catchAsync(async (req, res) => {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) {
      req.flash("error", "Cannot find that Discussion Page");
      return res.redirect("/discussionPage");
    }
    res.render("pages/edit", { discussion });
  })
);

router.put(
  "/:id", isLoggedIn,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const discussion = await Discussion.findByIdAndUpdate(id, {
      ...req.body.discussion,
    });
    req.flash('success', 'Successfully Updated Your Title/Discription.')
    res.redirect(`/discussionList/${discussion._id}`);
  })
);

//! delete route.
router.delete(
  "/:id", isLoggedIn,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    await Discussion.findByIdAndDelete(id);
    req.flash("success", "Your Discussion Page has been Deleted successfully");
    res.redirect("/discussionPage");
  })
);

module.exports=router;