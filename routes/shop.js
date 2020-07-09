const express = require("express");
const router = express.Router();

const shopController = require('../controllers/shop');

 router.get('/', shopController.getIndex);
 router.get('/products', shopController.getProducts);
 router.get('/products/:productID', shopController.getProduct) //productID is from your choice; note that dynamic router must come after specifc route
 router.post('/cart-delet-item', shopController.postCartDeleteProduct);
 router.get('/checkout', shopController.getCheckout)
 router.get('/checkout/success', shopController.postOrders)
 router.get('/checkout/cancel', shopController.getCheckout)
 router.get('/cart', shopController.getCart);
 router.post('/cart', shopController.postCart);
 router.get('/orders', shopController.getOrders);
 router.get('/orders/:orderId', shopController.getInvoice);

module.exports = router;
