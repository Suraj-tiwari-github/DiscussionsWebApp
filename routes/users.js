const express=require('express');
const router=express.Router();
const passport=require('passport')
const catchAsync=require('../utils/catchAsync');
const User=require('../models/user');

router.get('/register', (req,res)=>{
    res.render('users/register')
});
router.post('/register',catchAsync(async(req,res,next)=>{
    try{
    //!password has to be hashed before saving it to the db. 
    const {email, username, password}=req.body;
    const user=new User({email, username});
    const registeredUser=await User.register(user,password);
    //! when a new user register, we need to added it as a login in user.
    req.login(registeredUser, err=>{
        if(err) return next(err);
    })
    // console.log(registeredUser);
    req.flash("success","Welcome To the Discussion World");
    res.redirect('/discussionPage');
    // res.send(req.body);
    }catch(e){

        req.flash('error',e.message);
        res.redirect('register');
    }
}));


//!login routes.
router.get('/login', (req,res)=>{
    res.render('users/login');
})
router.post('/login',passport.authenticate('local', {failureFlash:true, failureRedirect:'/login' }), (req,res)=>{
    req.flash('success', 'Welcome Back');
    res.redirect('/discussionPage');
})

router.get('/logout', (req,res)=>{
    req.logout();
    req.flash("success", "Logging out, Bye-Bye!");
    res.redirect('/discussionPage');
})

module.exports=router;