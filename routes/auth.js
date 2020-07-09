const express = require("express");
const router = express.Router();
const authController = require('../controllers/auth')
const {check, body} = require('express-validator/check'); // the return value is Object  
const User = require('../models/user');

router.get('/login', authController.getLogin);

router.post('/login',

body('email').isEmail().withMessage('please enter a valid email address').normalizeEmail(),
body('password').isLength({min: 5}).isAlphanumeric().withMessage('please the min is 5 digit or character').trim()


,authController.postLogin);

router.post('/logout',authController.postLogout);

router.get('/signup', authController.getSignup);

router.post('/signup',
check('email')
.isEmail()
.withMessage('please enter a valid Email!!')
.custom((value, {req} ) => { // value refer to ->  the value of the field we're checking so the value in the email field and the req here we use it to refactor body of forms

   return  User.findOne({email: value})
        .then(userDoc => {
                    if(userDoc){
                        return Promise.reject('Email is already exist');
                    };
            
                });  // end of then block
}).normalizeEmail(),
body('password', 'Invalid Password').isLength({min: 5}).isAlphanumeric().trim(),
body('confirmPassword').trim().custom((value, {req}) => {
    if(value !== req.body.password){
        throw new Error('password have to match')
    }
    return true;
})
, authController.postSignup); //check this function will in the end return a middleware.

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);



module.exports = router;