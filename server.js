const express = require("express"); // this will export express as function
const app = express();
const bodyParser = require("body-parser");
const path = require("path"); // to don't refer to opreating system files
const errorController = require("./controllers/error");
const User = require("./models/user");
const mongoose = require("mongoose");
const session = require("express-session"); // first step in seesion after npm i --save connect-mongodb-session
const MongoDBStore = require("connect-mongodb-session")(session); // seconed step is import the packge and insert this sestion
const csrf = require("csurf"); //sudo npm i --save csurf
const flash = require("connect-flash");
const multer = require("multer"); // to enable you to work with binary data this furst step after that go to form and enctype="multipart/form-data"

// any engine to use ?!
app.set("view engine", "ejs");
// you will find views in the views folder
app.set("views", "views"); // where to find these templeats
//url encoded data is basically text data -> This format is then called url encoded
app.use(bodyParser.urlencoded({ extended: false }));

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    //null, you tell multer that it's OK to store it there is no Errors
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + "-" + file.originalname);
  }
}); //Disk storage is in the end a storage engine which you can use with multer It takes two keys, it takes the destination and it takes the file name.

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    // 'image/png', are just the names of the MIME types
    cb(null, true);
  } else {
    cb(null, false);
  }
};
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
); //Accept a single file with the name fieldName ->The single file will be stored in req.file. image is the name of input in our form

//To serve static files such as images, CSS files, and JavaScript files, use the express.static built-in middleware function in Express.
//The root "__dirname" argument specifies the root directory from which to serve static assets
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "images")));

const Url =
  "mongodb+srv://mohammed:5UhPoeheFLa6i2wx@cluster0-1ihst.mongodb.net/shop?retryWrites=true&w=majority";
const store = new MongoDBStore({
  uri: Url,
  collection: "sessions"
});
// resace: this means that the session will not be saved on every request but only if something changed in the session. ..saveun..:ensure that no session gets saved for a request where it doesn't need to be saved because nothing was changed about it
app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store: store
  })
);

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }

  User.findById(req.session.user._id)

    .then(user => {
      if (!user) {
        return next();
      }
      //I store the found user in my request object
      req.user = user;
      next();
    }) // end of then blocj
    .catch(err => {
      throw new Error(err);
    }); // end of catch block
}); // end of middleware

const csrfProtection = csrf(); // after session
app.use(csrfProtection); //csrf protection is generally enabled

app.use(flash());

//So now for every request that is executed, these two fields will be set for the views that are rendered
app.use((req, res, next) => {
  res.locals.isAuthentiated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next(); //so that we are able to continue.
});

const adminRoutes = require("./routes/admin"); // order doesn't matters
const shopRoutes = require("./routes/shop"); // order doesn't matters
const authRoutes = require("./routes/auth"); // order doesn't matters

app.use("/admin", adminRoutes); // the order matter;
app.use(shopRoutes); // the order matter if you used "use" in "app.use";
app.use(authRoutes); // the order matter;

//if there is no request matched;
app.use(errorController.get404);

mongoose
  .connect(Url)
  .then(result => {
    app.listen(8000);
    console.log("connection succeed");
  })
  .catch(err => {
    console.log("connection failed");
  });
