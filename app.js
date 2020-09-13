const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

app.use(express.static("public"));
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({
    extended: true
}));
//creating a session
app.use(session({
    secret:"mysecret",
    resave:false,
    saveUninitialized: false,
    // cookie: { secure: true }
}));
//initializing pasport
app.use(passport.initialize());
app.use(passport.session());
//Connect to mongo DB
mongoose.connect("mongodb://localhost:27017/userDB",{useUnifiedTopology:true, useNewUrlParser:true});
mongoose.set('useCreateIndex', true);
//USER SCHEMA
const userSchema = new mongoose.Schema({
    email: String,
    password: String
});
userSchema.plugin(passportLocalMongoose);
//Creating user model
const User = mongoose.model("User", userSchema);
passport.use(User.createStrategy());
 
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//Get/rendering Home page to the screen
app.get("/",(req,res)=>{
    res.render("home")
});
//Get/rendering Login page to the screen
app.get("/login",(req,res)=>{
    res.render("login")
});
//Get/rendering Register page to the screen
app.get("/register",(req,res)=>{
    res.render("register")
});
//Get secret page
app.get("/secrets",(req,res)=>{
    if(req.isAuthenticated()){
        res.render("secrets");
    }else{
        res.redirect("/login")
        console.log("not allowed")
    }
});
//logout
app.get("/logout",(req,res)=>{
    req.logOut();
    res.redirect("/")
})
//Registering user to the DB
app.post("/register",(req,res)=>{
    User.register({username: req.body.username},req.body.password,(err, user)=>{
        if(err){
            console.log(err);
            res.redirect("/register")
        }else{
            passport.authenticate("local")(req,res,()=>{
                res.redirect("/secrets")
                console.log("success")
            })
        }
    })
});
//user login
app.post("/login",(req,res)=>{
    const user = new User({
        username:req.body.username,
        password:req.body.password
    });
    req.login(user,(err)=>{
        if(err){
            console.log(err)
        }else{
            passport.authenticate("local")(req,res,()=>{
                res.redirect("/secrets")
            });
        }
    })
    
});




app.listen(3000,()=>{
    console.log("Now you can start working in peace not pieces!!!");
});

