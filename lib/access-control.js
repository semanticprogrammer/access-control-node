module.exports = function (userById, userByLogin, hash) {
   var connect = require('connect');
   var self = {}, findUser = {
      byId: userById, 
      byLogin: userByLogin
   }
   
   self.authenticate = function(login, password) {
      var user = findUser.byLogin(login);
      if (user && user.password == hash(password, user.salt)) {
         return user
      }
      return null;
   }
   self.authorize = function(unauthorized) {
      return function(req, res, next) {
         if (req.user) return next();
         if (!req.session.auth) return unauthorized(res);
         var pause = connect.utils.pause(req);
         findUser.byId(req.session.auth.userId, function (err, user) {
            if (err || !user) return unauthorized(res);
            req.user = user;
            next();
            pause.resume();
         });         
      }
   }
   self.addUserToSession = function(session, user) {
      if (user) {
         session.regenerate(function() {
            var auth = session.auth = {};
            auth.userId = user.id;
            auth.loggedIn = !!user;
         });
      }
   }
   self.login = function(session, credential) {
      var user = self.authenticate(credential.login, credential.password);
      if (user) {
         session.regenerate(function() {
            var auth = session.auth = {};
            auth.userId = user.id;
            auth.loggedIn = !!user;
         });
      }
      return user ? true : false;
   }
   self.loggedIn = function(session) {
      return (!!session.auth && !!session.auth.loggedIn)
   }
   self.logout = function(session) {
      session.destroy();
   }
   return self;
}