const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//I pass a javascript object and in that object you now define how your product should look like,
const productSchema = new Schema({
  title: {
    type: String,
    required: true
  },

  price: {
    type: Number,
    required: true
  }, 

  description: {
    type: String,
    required: true
  }, 

  imageUrl: {
    type: String,
    required: true
  },

  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }


});

//Now model is a function I call and a model basically is important for mongoose behind the scenes to connect a schema, a blueprint with a name basically, "Entity Name"
module.exports = mongoose.model('Product', productSchema);




















// class Product{
//       constructor(title, price, description, imageUrl, id, userId){
//         this.title = title;
//         this.price = price;
//         this.description = description;
//         this.imageUrl = imageUrl;
//         this._id = id ? new mongodb.ObjectID(id) : null;
//         this.userId = userId;
//       }

//       save(){
//         const db = getDb(); // if need acces database in both blocks 
//         if(this._id){
//           //update product if this product has id 
//           return db.collection('products')
//                    .updateOne({_id: this._id}, {$set: this}) //you can type it like this {$set: {title:this.title, price: this.price}}
//                    .then(result => {
//                          console.log("product updated successfully")
//                      })// end of then block
//                    .catch(err => {
//                          console.log('err in save method in Product where i Update One product');
//                       })//end of catch block
//         }// end of if bloch
//         else{
//            return db.collection('products')
//                     .insertOne(this)
//                     .then(result => {
//                        console.log("inserted successfully");
//                     })// end of then block
//                     .catch(err => {
//                      console.log('error in inserting product');
//                      })//end of catch block

//         }// end of else block
       
//       }// end of save method

//       static fetchAll() {
//               const db = getDb();
//               return db.collection('products')
//               .find()
//               .toArray() // this mean don't make cursor just get all my products;
//               .then(products => {
//                 console.log(products);
//                 return products
//               })
//               .catch(err => {
//                 console.log('err in featch method')
//               })
//       } // end of ferchAll

//       static findById(prodId){
//             const db = getDb();
//      return db.collection('products')
//               .find({_id: new mongodb.ObjectID(prodId)}).next()
//               .then(product => {
//                 console.log(product);
//                 return product
//               })
//               .catch(err =>{
//                 console.log('err in findById function in product.js');
//               })

//       }// end of findById

//       static deleteById(prodId){
//         const db = getDb();
//         return db.collection('products')
//                  .deleteOne({_id: new mongodb.ObjectID(prodId)})                               
//                  .then( ()=> {
//                    console.log("dleted is correct");
                
//                  })
//                  .catch(err =>{
//                    console.log('err in findById function in product.js');
//                  })
   
//          }// end of findById
    
// }// end of class


// module.exports = Product;



























 /*
 const fs = require('fs');//we need to be able to work with the file system,
const path = require('path'); //then also be created in special path, so I will use the path tool,to construct a path that works on all operating systems.
const Cart = require('./cart');

let getProductsFromFile = () =>{
     const p = path.join(path.dirname(process.mainModule.filename),'data' ,'products.json');
     return new Promise((resolve, reject) => {  
            fs.readFile(p, (err, fileContent) =>{
              resolve(JSON.parse(fileContent))
              if (err){
                reject()
              }
             });   //end of fs.readFile
}); // end of promise
} // end of getProductsFromFile


module.exports = class Product{
    constructor(id, title, imageUrl, description, price){
        this.id = id;
        this.title = title;
        this.imageUrl = imageUrl;
        this.description = description;
        this.price = price;
    }

     save(){
      getProductsFromFile()
      .then(products =>{
        if(this.id){
          const existingProductIndex = products.findIndex(prod => prod.id === this.id);
          const updatedProducts = [...products];
          updatedProducts[existingProductIndex] = this;
          const p = path.join(path.dirname(process.mainModule.filename),'data' ,'products.json');
          fs.writeFile(p, JSON.stringify(updatedProducts), (err) => {console.log('error')});
        }
        else {
          this.id = Math.random().toString();
          products.push(this);
          const p = path.join(path.dirname(process.mainModule.filename),'data' ,'products.json');
          fs.writeFile(p, JSON.stringify(products), (err) => {console.log('error on writing')});
        }
     })
     .catch(() => {
       console.log("error happend here....")
     })

    }

    static deleteById(id){
      getProductsFromFile()
      .then(products =>{
        const product = products.find(prod => prod.id === id);
        const updatedProducts = products.filter(prod => prod.id !== id);
        const p = path.join(path.dirname(process.mainModule.filename),'data' ,'products.json');
        fs.writeFile(p, JSON.stringify(updatedProducts), (err) => {
          if(!err){
          Cart.deleteProduct(id, product);
         }
       });
     })//end then
     .catch(() => {
       console.log("error happend here")
     })//end catch
    }// end function

    
    static  fetchAll(){
       return getProductsFromFile();

    } // end of fetchAll
};// end of class
*/