const User = require("../models/user");
const bcrypt = require("bcryptjs"); //npm i --save bcryptjs
const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");
const crypto = require("crypto"); // built in library This is a library that helps us with creating secure unique random values and other things but we'll need that unique secure random value here.
const { validationResult } = require("express-validator/check"); // validationResult allow us to gather all the errors thrown by middleware isEmale by example;

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key:
        "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"
    }
  })
); //so that is essentially some setup telling nodemailer how your e-mails will be delivered nodejs won't do this on its own,

exports.getLogin = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }

  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    errorMessage: message,
    oldInput: {
      email: "",
      password: ""
    },
    validationErrors: []
  });
}; // end of getOrders function

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("auth/login", {
      path: "/login",
      pageTitle: "login",
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password
      },
      validationErrors: errors.array()
    });
  } // end of if Block

  User.findOne({ email: email })
    .then(user => {
      if (!user) {
        return res.status(422).render("auth/login", {
          path: "/login",
          pageTitle: "login",
          errorMessage: "Invalid email or password",
          oldInput: {
            email: email,
            password: password
          },
          validationErrors: []
        });
      } // end if block where if there is no user

      bcrypt
        .compare(password, user.password)
        .then(doMatch => {
          // the result will be true of false

          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user; // this will just store the data and it will not store the methods
            return req.session.save(err => {
              // to make sure you request is saved correctly // this sync operation so palce return to avoid compleate of excution
              console.log(err);
              res.redirect("/");
            });
          }
          return res.status(422).render("auth/login", {
            path: "/login",
            pageTitle: "login",
            errorMessage: "Invalid email or password",
            oldInput: {
              email: email,
              password: password
            },
            validationErrors: []
          });
        })
        .catch(err => {
          console.log(err);
          res.redirect("/login");
        });
    }) // end of the first then
    .catch(err => console.log("err in fiding email in database")); // catch for the first then
}; // end ofpostLogin function٫

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect("/");
  });
}; // end of postLogout function٫

exports.getSignup = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "SignUp",
    errorMessage: message,
    oldInput: { email: " ", password: " " },
    validationErrors: []
  });
}; // end of getSignup function٫

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // 422 which is a common status code for indicating that validation failed
    return res.status(422).render("auth/signup", {
      path: "/signup",
      pageTitle: "SignUp",
      errorMessage: errors.array()[0].msg,
      oldInput: { email: email, password: password },
      validationErrors: errors.array()
    });

    // err will be like that
    // [
    //       {
    //             location:'body',
    //             param: 'email',
    //             value: 'test',
    //             msg: 'invalid value'
    //       }
    // ]
  } // end of if Block

  bcrypt
    .hash(password, 12)
    .then(hashedPassword => {
      const user = new User({
        email: email,
        password: hashedPassword,
        cart: { items: [] }
      }); // user model
      return user.save();
    }) // this then for bcrypt becasue it sync operation
    .then(result => {
      res.redirect("/login");
      return transporter.sendMail({
        to: email,
        from: "shop@outlook.com",
        subject: "signup succeeded!!",
        html: "<h1> You successfully sugined up </h1>"
      }); //you pass a javascript object where you configure the email you want to send,
    })
    .catch(err => {
      console.log(err);
    });
}; // end of postSignup function

exports.getReset = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/rest", {
    path: "/reset",
    pageTitle: "Reset password",
    errorMessage: message
  }); // end of response
}; // end of getRest functin

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      return res.redirect("/reset");
    }

    const token = buffer.toString("hex"); //need to pass hex because that buffer will store hexadecimal valuess and this is information toString needs to convert hexadecimal values to normal ASCII characters. Now that token should get stored in the database and it should get stored on the user object because it belongs to that user,
    User.findOne({ email: req.body.email })
      .then(user => {
        if (!user) {
          req.flash("error", "No account with that email");
          return res.redirect("/reset");
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        return user.save();
      })
      .then(result => {
        res.redirect("/");
        transporter.sendMail({
          to: req.body.email,
          from: "shop@outlook.com",
          subject: "password Resrt",
          html: `
                              <p> you requested a password reset </p>
                              <p> click this <a href='http://localhost:8000/reset/${token}'>Link</a> link to set new password </p>
                        
                        `
        });
      })
      .catch(err => {
        console.log(err);
      });
  });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({
    resetToken: token,
    resetTokenExpiration: { $gte: Date.now() }
  })
    .then(user => {
      let message = req.flash("error");
      if (message.length > 0) {
        message = message[0];
      } else {
        message = null;
      }
      res.render("auth/new-password", {
        path: "/new-password",
        pageTitle: "New Password",
        errorMessage: message,
        userId: user._id.toString(),
        passwordToken: token
      }); // end of response
    })
    .catch(err => {
      console.log(err);
    });
};

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;

  let resetUser;

  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: { $gte: Date.now() },
    _id: userId
  })
    .then(user => {
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then(hashedPassword => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then(result => {
      res.redirect("/login");
    })
    .catch(err => {
      console.log(err);
    });
};
