module.exports = function (folderName, ext) {
   var
   fs = require('fs'),
   path = require('path'),
   self = {};

   self.get = function(name, callback) {
      var viewPath = path.join(folderName, name + ext);
      try {
         fs.readFile(viewPath, function (err, data) {
            if (err) {
               callback(err);
            }
            else {
               callback(null, data.toString());
            }
         });
      } catch (e) {
         console.log(e.message);
      }
   };

   return self;
}