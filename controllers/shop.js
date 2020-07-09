const Product = require('../models/product') ;
const Order = require('../models/order') ;
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const stripe = require('stripe')('sk_test_yYBzgZui43Sm9Q7fz393a5Mm005gkflZk3');


const ITEMS_PER_PAGE = 3;
  
exports.getIndex = (req, res, next) =>{

   const page = +req.query.page || 1 ; // here i will got page number provided by linkes; The Unary plus(+) is the fastest and preferred way of converting something into a number, because it does not perform any other operations on the number
   let totalItems;
   Product.find()
   .countDocuments()
   .then(numProducts => {
      totalItems = numProducts;
      return Product.find()
      .skip((page - 1) * ITEMS_PER_PAGE ) // if i am im page number 1 (1 - 1) * 8 -> so skip first 0 items // if i am in page number 2 (2-1) *8 -> so skip first 8 items and so on
      .limit(ITEMS_PER_PAGE)
   })
   .then(products =>{
      res.render('shop/index', 
      {prods: products, 
       pageTitle: 'Shop', 
       path: '/', 
       currentPage: page, 
       hasNextPage: ITEMS_PER_PAGE * page < totalItems,
       hasPreviousPage: page > 1,
       nextPage: page+1,
       PreviousPage: page-1,
       lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
      }); // end of response
   })
   .catch(err => {
      console.log("Error occurred")
   })
  };



 exports.getProducts = (req, res, next) =>{

    // it's not give us a cursor // we can make it cursor by Product.find().cursor();
   Product.find() 
   .then(products =>{
      res.render('shop/product-list', {prods: products, pageTitle: 'All products', path: '/products', isAuthentiated: req.session.isLoggedIn}); 
   })
   .catch(err => {
      console.log("Error occurred")
   })
};

  exports.getProduct = (req, res, next) =>{
    const prodId = req.params.productID;
    // we even pass a string to find by id and mongoose will automatically convert this to an object ID,
     Product.findById(prodId)
     .then(product =>{
      res.render('shop/product-detail', {product: product, pageTitle: product.title, path: '/products', isAuthentiated: req.session.isLoggedIn});
     })
     .catch(err =>{
        console.log('err in get product in shop.js controller');
     })
         
   
};// end of getProduct function

  
  exports.getCart = (req, res, next) => {
         req.user
         .populate('cart.items.productId') 
         .execPopulate() // to return a promise
         .then( user => {
            const products = user.cart.items
            res.render('shop/cart', { path: '/carts', pageTitle: 'Your Cart', products: products, isAuthentiated: req.session.isLoggedIn });
         })  
  };





  exports.postCart = (req, res, next) => {
   const prodId = req.body.productId;
   Product.findById(prodId)
   .then(product => { 
         req.user.addToCart(product)
   })
   .then(result => {
      res.redirect('/');
     
   })
   .catch(err => {
      console.log('err in postCart');
   })
};






  exports.getCheckout = (req, res, next) => {
     let products;
     let total = 0;
   req.user
   .populate('cart.items.productId') 
   .execPopulate() // to return a promise
   .then(user => {
      products = user.cart.items;
      total = 0;
      products.forEach(p => {
         total += p.quantity * p.productId.price;
      });
      return stripe.checkout.sessions.create({
         payment_method_types: ['card'],
         line_items: products.map(p => {
            return {
               name: p.productId.title,
               description: p.productId.description,
               amount: p.productId.price * 100,
               currency: 'usd',
               quantity: p.quantity
            };
         }),
         success_url: req.protocol + '://'+ req.get('host')+'/checkout/success' ,
         cancel_url:  req.protocol + '://'+ req.get('host')+'/checkout/cancel'
      });

   }) // end of first then block
   .then(session => {
      res.render('shop/checkout', {
         path: '/checkout',
         pageTitle: 'Checkout',
         products: products,
         totalSum: total,
         sessionId: session.id
      });// end of response
   })// end of second then block

};



exports.getOrders = (req, res, next) => {

 Order.find({"user.userId": req.session.user._id})
 .then(orders => {
         res.render('shop/orders', {
            path: '/orders',
            pageTitle: 'Your Orders',
            orders: orders,
            isAuthentiated: req.session.isLoggedIn
         });
 }) 
 .catch(err => {
    console.log(err)
 })

   
}; // end of getOrders function



exports.postOrders = (req, res, next) => {
   req.user
   .populate('cart.items.productId') 
   .execPopulate() // to return a promise
   .then(user => {
         const products = user.cart.items.map(i => {
         return {quantity: i.quantity, product: {...i.productId._doc}};
      })
      const order = new Order({
         user: {
            email: req.user.email,
            userId: req.session.user._id // mongoose will pick the id from there
         },
         products: products
      });
      return order.save()
   })// end of then
   .then(result => {
      res.redirect('/')
      req.user.clearCart();
   }).catch(err => {
      console.log("err here")
   })

}; // end of post order Method




exports.postCartDeleteProduct = (req, res, next) =>{
   const prodId = req.body.productId;
   req.user
   .removeFromCart(prodId)
   .then(result => {
      res.redirect('/');
   })
   .catch(err => {
      console.log("err")
   })

};




exports.getInvoice = (req, res, next) => {
   const orderId = req.params.orderId;
   const invoiceName = 'invoice-' + orderId + '.pdf';
   const invoicePath = path.join('data', 'invoices', invoiceName);

   const pdfDoc = new PDFDocument(); //turns out to be a readable stream,
   res.setHeader('content-Type', 'application/pdf');
   res.setHeader('content-Disposition', 'inline; filename= " '+ invoiceName+' " ');
   pdfDoc.pipe(fs.createWriteStream(invoicePath));
   pdfDoc.pipe(res);
   pdfDoc.fontSize(26).text('Invoice', {underline: true});
   pdfDoc.text('--------------------------------------');
   let totalPrice = 0;
   Order.findById(orderId)
   .then(order => {
      order.products.forEach(element => {
          totalPrice += element.quantity * element.product.price;
          pdfDoc.text(`${element.product.title} - ${element.quantity} x $  ${element.product.price}`);
      }); // end of loop
      pdfDoc.text('Total price : $' + totalPrice);
      pdfDoc.end(); //when you call end, these writable streams for creating the file and for sending the response will be closed
   }); // end of then block
  

      // if you wan a user to downlad files this a code 

      //  let promise =  new Promise((resolve, reject) => {  1

      //       fs.readFile(invoicePath, (err, fileContent) =>{2
      //       resolve(fileContent)3
      //       if (err){4
      //          reject(Error("It broke"))5
      //       }6
      //       });   //end of fs.readFile7


            // this way for large files
            // const file = fs.createReadStream(invoicePath); //node will be able to use that to read in the file step by step in different chunks
            //    res.setHeader('content-Type', 'application/pdf');
            //    res.setHeader('content-Disposition', 'attachment; filename= " '+ invoiceName+' " ');
            //    file.pipe(res); //call the pipe method to forward the data that is read in with that stream to my response because the response object is a writable stream actually

       //  }); // end of promise

      //  promise.then(data => {8
      //     res.setHeader('content-Type', 'application/pdf');9
      //     res.setHeader('content-Disposition', 'attachment; filename= " '+ invoiceName+' " '); //this allows us to define how this content should be served to the client.We can set this to inline to still tell the browser to open it inline for example, or attachment to downlaod it 10
      //     res.send(data);11
      //  })12
      //  .catch(err => {13
      //     console.log(err);14
      //  })15
};// end of  getInvoice function
