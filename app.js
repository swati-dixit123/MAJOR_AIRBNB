if(process.env.NODE_ENV!="production")
{
  require('dotenv').config();
}

console.log(process.env.SECRET);

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore=require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

// Routers
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/reviews.js");
const userRouter=require("./routes/user.js");
const chatbotRoutes = require("./routes/chatbot");
const wishlistRoutes = require("./routes/wishlist");


//map

const apiKey = process.env.GOOGLE_MAPS_API_KEY;

// Database connection
//const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const dbUrl=process.env.ATLASDB_URL;

main()
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.log("❌ Mongo connection error:", err));

async function main() {
  await mongoose.connect(dbUrl);
}

// EJS setup
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));



// Middleware
app.use(express.json());  
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));


// const store=MongoStore.create({
//      mongoUrl:dbUrl,
//      crypto:
//      {
//        secret:"mysupersecretcode",
//      },
//      touchAfter:24*3600,
// });

// store.on("error",()=>
// {
// console.log("ERROR IN MONGO SESSION STORE",err);
// })

const sessionOptions = {
 // store,
  secret:process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true
  },
};


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Flash middleware
app.use((req, res, next) => {
  res.locals.currUser = req.user; 
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

// Demo user route (⚠️ fix variable typo)
// app.get("/demouser", async (req, res) => {
//   let fakeUser = new User({
//     email: "student@gmail.com",
//     username: "delta-student"
//   });

//   let registeredUser = await User.register(fakeUser, "helloworld"); // ✅ use User, not user
//   res.send(registeredUser);
// });

// Routes
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/chatbot", chatbotRoutes);
app.use("/wishlist", wishlistRoutes);

app.use("/",userRouter);

// Error handling
app.use((req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).render("error.ejs", { message });
});

// app.get("/",(req,res)=>
// {
//    res.send("Welcome to the root");
// });

// app.get("/map", (req, res) => {
//     res.render("map", { googleKey: process.env.GOOGLE_MAPS_API_KEY });
// });


// Server
app.listen(8080, () => {
  console.log("🚀 Server running on http://localhost:8080");
});
