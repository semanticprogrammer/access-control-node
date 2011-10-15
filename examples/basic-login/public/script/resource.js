resource = function(self) {
   self.version = '0.0.1';
   var vpoint = '#view';
   self.view = function(url, context, selector) {
      if (arguments.length == 1) {
         $.get(url, function(data) {
            $(vpoint).html(data);
         });
      } else {
         var ret = {};
         ret.context = context;
         if (selector) {
            ret.selector = selector;
         }         
         if (typeof ret.selector === "object") {
            ret.selector = JSON.stringify(ret.selector);
         }
         $.get(url, ret, function(data) {
            $(vpoint).html(data);
         });         
      }
   }
   self.post = function(url, selector) {
      $.post(url, $(selector).serialize(), function(data) {
         $(vpoint).html(data);
      });
   }
   return self;
}({});