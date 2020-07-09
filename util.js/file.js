const fs = require('fs');

const deleteFile = (filePath) => {
    // it deletes the name and the file that is connected to the name, so it deletes a file at this path.
    fs.unlink(filePath, (err) => {
        if(err){
            throw (err);
        }
    }); 
};


exports.deleteFile = deleteFile;