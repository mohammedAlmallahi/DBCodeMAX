const mongodb = require('mongodb');
const MongoClient =  mongodb.MongoClient; //we can use that client to connect to our mongodb database
let _db;

const mongoConnect = () => {
    return new Promise((resolve, reject) => { 
        const Url = 'mongodb+srv://mohammed:5UhPoeheFLa6i2wx@cluster0-1ihst.mongodb.net/shop?retryWrites=true&w=majority';
        MongoClient.connect(Url)
        .then(client => {
            console.log("connected");
            _db = client.db(); //I will store access to the database here and if I leave it like this, what we will do is we will connect
            resolve()

        })
        .catch(err => {
            reject()  
        })
                
}); // end of promise

}; // end of mongoConnect function

const getDb = () =>{
    if(_db){
        return _db;
    }
    throw 'No DataBase found';
}

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;



