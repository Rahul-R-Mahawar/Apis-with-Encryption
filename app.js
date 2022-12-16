import * as dotenv from 'dotenv'
dotenv.config();
import express from 'express';
import bodyParser from 'body-parser';
import ejs from 'ejs';
import mongoose from 'mongoose';
/* import encrypt from 'mongoose-encryption'; */
/* import md5 from 'md5'; */
import bcrypt from 'bcrypt';
const saltRounds = 10;

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
    extended: true,
}));

app.use(express.static("resources"));

//conection to DB
mongoose.set('strictQuery', false);
mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true, useUnifiedTopology: true });

//create schema
const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

//encryption before creating model
/* userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ["password"] }); */

//create model
const UserModel = mongoose.model("User", userSchema);


app.get("/", function (req, res) {
    res.render("home");
});

app.get("/login", function (req, res) {
    res.render("login");
});
app.get("/register", function (req, res) {
    res.render("register");
});

app.post("/register", function (req, res) {
    bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
        const newUser = UserModel({
            email: req.body.username,
            password: hash
        });
        newUser.save(function (err) {
            if (!err) {
                res.render("secrets");
            }
            else {
                console.log(err);
            }
        });
    });
});

app.post("/login", function (req, res) {

    const userName = req.body.username;
    const password = req.body.password;

    UserModel.findOne({ email: userName }, function (err, foundUser) {
        if (!err) {
            if (foundUser) {
                // Load hash from your password DB.
                bcrypt.compare(password, foundUser.password, function (err, result) {
                    if (result) {
                        res.render("secrets");
                    }
                    else {
                        res.send("Wrong");
                    }
                });
            }
            else {
                res.send("Wrong");
            }
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