const express=require('express');
const path = require("path");
const app=express();
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const session=require('express-session');
const flash=require('connect-flash');
const {discussionSchema,replySchema}=require('./schemas.js');

const passport=require('passport');
const LocalStrategy=require('passport-local');

mongoose.connect('mongodb://localhost:27017/discussionPage')
.then(()=>{
    console.log("Mongo Connection Open");
})
.catch((err=>{
    console.log("Mongo Error");
    console.log(err);
}))

const User=require('./models/user');
//* Our model
const Discussion=require('./models/discussion');
const Reply=require('./models/reply');

//!Express route requiring.
const usersRoutes=require('./routes/users');
const discussionListRoutes=require('./routes/discussions');
const repliesRoutes=require('./routes/replies');


const {disuccsionSchema}=require('./schemas');
const catchAsync=require('./utils/catchAsync');
const ExpressError=require('./utils/ExpressError');
//! for HTTP verbs.
const methodOverride=require('method-override');
const reply = require('./models/reply.js');
app.engine('ejs', ejsMate);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(express.urlencoded({extended: true}));

//!Session.
const sessionConfig={
    secret:'thisshouldbemysecret',
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now()+1000*60*60*24*7,
        maxAge:1000*60*60*24*7,
        //!total 7 days.
    }
} 
app.use(session(sessionConfig));
app.use(flash()); 

//! passport session should be placed after session.
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
//!static methods of passport are authenticate,serialize, deserialize.
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));


//!middleware for flash messages.
app.use((req,res,next)=>{
    res.locals.currentUser=req.user;
    res.locals.success=req.flash('success');
    res.locals.error=req.flash('error')
    next();
})

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

//!isLoggedIn middleware.
const {isLoggedIn}=require('./middleware');

//!RESTFUL routes.
app.get('/',(req,res)=>{
    res.render('home')
})

// !Express Routes.
app.use('/',usersRoutes);
app.use('/discussionList',discussionListRoutes);
app.use('/discussionList/:id/reply',repliesRoutes);

app.get("/discussionPage",catchAsync(async (req, res) => {
    //* finding all the list and sending it discussionPage.
    const discussion = await Discussion.find({});
    res.render("pages/discussionPage", { discussion });
  })
);

//! new Route.
app.get("/discussion/new",isLoggedIn, (req, res) => {
    
    res.render("pages/new");
});

app.post("/discussionPage",isLoggedIn,validateDiscussion, catchAsync(async (req, res, next) => {

    const discussion = new Discussion(req.body.discussion);
    discussion.author=req.user._id;
    await discussion.save();
    req.flash('success','Successfully made a new Discussion Page.')
    res.redirect(`/discussionList/${discussion._id}`);
  })
);



app.all('*', (req,res,next)=>{
    next(new ExpressError('Page not Found',404))
})



//* our error handler.
app.use((err,req,res,next)=>{
 const {statusCode=500}=err;
 if(!err.message) err.message='Oh No, Something went Wrong!!'
 res.status(statusCode).render('error',{err})
})
app.listen(3000, ()=>{
    console.log('Serving on Port 3000')
})