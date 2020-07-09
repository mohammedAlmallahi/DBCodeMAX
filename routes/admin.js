const express = require("express");
const router = express.Router();
const {check, body} = require('express-validator/check'); // the return value is Object  

const adminController = require('../controllers/admin');

// /admin/add-product => GET
 router.get('/add-product', adminController.getAddProduct); // don't excute it so you tell express when request is happen go and excute this function
 // /admin/add-product => Post
 router.post('/add-product',
 [
    body('title').isString().isLength({min: 3}).trim(),
    body('price').isFloat(),
    body('description').isLength({min: 5, max: 400}).trim(),

 ],adminController.postAddProduct);
 router.get('/products', adminController.getProducts);
 router.get('/edit-product/:productId', adminController.getEditProduct); //1
 router.post('/edit-product',
 [
    body('title').isAlphanumeric().isLength({min: 3}).trim(),
    body('price').isFloat(),
    body('description').isLength({min: 5, max: 400}).trim(),

 ],adminController.postEditProduct ); //2
 router.post('/delete-product', adminController.postDeleteProduct);
module.exports = router;
