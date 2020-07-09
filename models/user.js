const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
        email: {
            type: String,
            required: true
        },

        password: {
            type: String,
            required: true,
        },
        resetToken: String,
        resetTokenExpiration: Date,

        cart: {
            items: [{productId: {type: Schema.Types.ObjectId, ref: 'Product', required: true}, quantity: {type: Number, required: true}}]
        }
});

userSchema.methods.addToCart = function(product){

              const cartProductIndex = this.cart.items.findIndex(cp => {
                  //I want to return true if I found the right product in my items array 
                    return cp.productId.toString() === product._id.toString();
               });
              
                let newQuantity = 1; // it will cahng so it;s let
                const updatedCartItms = [...this.cart.items];
               
                if(cartProductIndex >= 0){
                    //then this means this product already exists.
                    newQuantity = this.cart.items[cartProductIndex].quantity + 1;
            
                    updatedCartItms[cartProductIndex].quantity = newQuantity;
                }else{
                    updatedCartItms.push({productId: product._id, quantity: newQuantity}) //mongoose should automatically wrap it in an object
                }
               
               
                const updatedCart = {items: updatedCartItms };
                this.cart = updatedCart;
                return this.save()
}// end of addToCart method



userSchema.methods.removeFromCart = function(productId){
    const  updatedCartItems = this.cart.items.filter(item => {
                  return item.productId.toString() !== productId.toString() // return all product that doesnot equal this item
             })

             this.cart.items = updatedCartItems;
            return this.save();
}// end of removeFromCartmethod

userSchema.methods.clearCart = function(){
    this.cart = {items: []}
    return this.save()
}

module.exports = mongoose.model('User', userSchema);
