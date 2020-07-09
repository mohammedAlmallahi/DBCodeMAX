const Product = require("../models/product");
const { validationResult } = require("express-validator/check");

const fileHelper = require("../util.js/file");

exports.getProducts = (req, res, next) => {
  Product.find() // .select(title price -_id) what do you want to select from that object // //.populate("userId") //first of all describe the path which you want to populate,"userId"...
    .then(products => {
      res.render("admin/products", {
        prods: products,
        pageTitle: "Admin products",
        path: "/admin/products"
      });
    })
    .catch(err => {
      console.log("Error occurred");
    });
}; // end of getProducts function

exports.getAddProduct = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    return res.redirect("/login");
  }
  res.render("admin/edit-product", {
    pageTitle: "Add product",
    path: "/admin/add-product",
    hasError: false,
    editing: false,
    errorMessage: null
  });
}; // end of getAddProduct function

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const image = req.file;
  const price = req.body.price;
  const description = req.body.description;

  if (!image) {
    return res
      .status(422)
      .render("admin/edit-product", {
        pageTitle: "Add product",
        path: "/admin/add-product",
        hasError: true,
        product: { title: title, price: price, description: description },
        editing: false,
        errorMessage: "Attached file is not an image "
      }); // end of render block
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render("admin/edit-product", {
      pageTitle: "Add product",
      path: "/admin/add-product",
      hasError: true,
      product: { title: title, price: price, description: description },
      editing: false,
      errorMessage: errors.array()[0].msg
    }); // end of render block
  } // end of if block

  const imageUrl = image.path;

  const product = new Product({
    title: title,
    price: price,
    description: description,
    imageUrl: imageUrl,
    userId: req.user
  });
  // this save method monggose do it for us
  product
    .save()
    .then(result => {
      res.redirect("/admin/products");
      console.log("product Added ");
    })
    .catch(err => {
      console.log("err here");
    });
}; // end of postAddProduct function

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) return res.redirect("/");

  const prodId = req.params.productId; // extract product id
  Product.findById(prodId)
    .then(product => {
      if (!product) return res.redirect("/"); // if myProduct is undefined
      res.render("admin/edit-product", {
        pageTitle: "Edit product",
        path: "/admin/edit-product",
        product: product,
        editing: editMode,
        hasError: false,
        errorMessage: null
      }); // end of render function
    }) // end of the first then
    .catch(err => {
      console.log(
        "Error happend when excuting getEditProduct in admin.js file "
      );
    });
}; //end of getEditProduct function

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const image = req.file;
  const updatedDes = req.body.description;

  Product.findById(prodId)
    .then(product => {
      //I get back a full mongoose object hence I can manipulate it and call save again,
      product.title = updatedTitle;
      product.price = updatedPrice;
      if (image) {
        fileHelper.deleteFile(product.imageUrl);
        product.imageUrl = image.path;
      }
      product.description = updatedDes;
      return product.save(); //I return the result of that and then call then on that to redirect once the saving was done.
    })
    .then(reult => {
      res.redirect("/admin/products");
    })
    .catch(err => {
      console.log("error");
    }); // catch for findById method
}; // end of postEditProduct function

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then(product => {
      if (!product) {
        return console.log("Error ");
      }
      fileHelper.deleteFile(product.imageUrl);
      return Product.deleteOne({ _id: prodId, userId: req.user._id });
    })
    .then(result => {
      res.redirect("/admin/products");
    })
    .catch(err => {
      console.log("err happend");
    });
}; // end of postDeleteProduct function
