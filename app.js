import * as dotenv from 'dotenv'
dotenv.config();
import express from 'express';
import bodyParser from 'body-parser';
import ejs from 'ejs';
import mongoose from 'mongoose';
import session from 'express-session';
import passport from 'passport';
import passportLocalMongoose from 'passport-local-mongoose';


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
    extended: true,
}));

app.use(express.static("resources"));

//session
app.use(session({
    secret: "my secret is here",
    resave: false,
    saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

//conection to DB
mongoose.set('strictQuery', false);
mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true, useUnifiedTopology: true });

//create schema
const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

//add plugin
userSchema.plugin(passportLocalMongoose);

//create model
const UserModel = mongoose.model("User", userSchema);

//serilize the session
passport.use(UserModel.createStrategy());
passport.serializeUser(UserModel.serializeUser());
passport.deserializeUser(UserModel.deserializeUser());


app.get("/", function (req, res) {
    res.render("home");
});

app.get("/login", function (req, res) {
    res.render("login");
});
app.get("/register", function (req, res) {
    res.render("register");
});

app.get("/secrets", function (req, res) {
    if (req.isAuthenticated()) {
        res.render("secrets");
    }
    else {
        res.render("login");
    }
});

app.post("/register", function (req, res) {
    UserModel.register({ username: req.body.username }, req.body.password, function (err, user) {
        if (err) {
            console.log(err);
            res.redirect("/register");
        }
        else {
            passport.authenticate("local")(req, res, function () {
                res.redirect("/secrets");
            });
        }
    });
});

app.post("/login", function (req, res) {

    const newUser = new UserModel({
        username: req.body.username,
        password: req.body.password
    });

    req.login(newUser, function (err) {
        if (err) {
            console.log(err);
        }
        else {
            passport.authenticate("local")(req, res, function () {
                res.redirect("/secrets");
            });
        }
    })
});

app.get("/logout", function (req, res) {
    req.logout(function (err) {
        if (!err) {
            res.redirect("/");
        }
        else {
            console.log(err);
        }
    });
});

//app port run listn
app.listen(3000, function (err) {
    console.log("Server is running on port 3000");
});