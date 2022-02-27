const express=require('express');
//!router gets separate, we need to merge them, to use on many relationships.
const router=express.Router({mergeParams:true}); 
const catchAsync=require('../utils/catchAsync');
const ExpressError = require("../utils/ExpressError");
const {validateReply, isLoggedIn}=require('../middleware');

//* Our model
const Discussion=require('../models/discussion');
const Reply=require('../models/reply');


const { replySchema } = require("../schemas.js");



//***********
//!reply route for discussion:id/reply.
// *********

router.post('/',isLoggedIn, validateReply, catchAsync(async(req,res)=>{
    const discussion=await Discussion.findById(req.params.id);
    const reply=new Reply(req.body.reply);
    reply.author=req.user._id;
    discussion.replies.push(reply);
    await reply.save();
    await discussion.save();
    req.flash('success','Successfully Added your Reply.')
    res.redirect(`/discussionList/${discussion._id}`);
    // res.send("You Made it");
}))

//! To delete a reply.
router.delete('/:replyId',isLoggedIn, catchAsync(async(req,res)=>{
    const {id,replyId}=req.params;
    //! $pull is a operator which pulls only the record which matches with the condition.
    await Discussion.findByIdAndUpdate(id, {$pull:{replies:replyId}})
    await Reply.findByIdAndDelete(replyId);
    req.flash('success', 'Reply Deleted Successfully')
    res.redirect(`/discussionList/${id}`)

    // res.send("You delete it.");
}))

module.exports=router;