var
connect = require('connect'),
router = require('mutant/lib/router').router,
server = require('mutant/lib/server'),
crypto = require('crypto'),
util = require('util');

var env = require('./config/environment.json', 'utf-8');
var view = require('./resource/view')(__dirname + "/" + env.view.area, env.view.ext);

findUserById = function(id, callback) {
   for (var i = 0; i < users.length; i++) {
      if (users[i].id == id) {
         return callback(null, users[i]);
      }
   }
   callback(new Error('cannot find user'));
}
findUserByLogin = function(login) {
   for (var i = 0; i < users.length; i++) {
      if (users[i].login == login) {
         return users[i];
      }
   }      
   return null;
}
unauthorized = function(res) {
   res.end('Access denied!');
}
hash = function(msg, key) {
   return crypto.createHmac('sha256', key).update(msg).digest('hex');
}

var accessControl = require('../../lib/access-control')(findUserById, findUserByLogin, hash);

var users = [
{
   id: '1',
   login: 'admin',
   salt: 'randomly-generated-salt',
   password: hash('mypass', 'randomly-generated-salt')
}
];



var routerData = [
{
   middleware: connect.cookieParser('besafewithus')
},
{
   middleware: connect.session({
      cookie: {
         maxAge: 900000
      }
   })
},
{
   pattern: '/admin',
   get: accessControl.authorize(unauthorized)
},
{
   pattern: '/admin',
   get: function(req, res) {
      res.end('We are inside of protected area!!!')
   }
},
{
   pattern: '/login',
   get: function(req, res) {
      if (accessControl.loggedIn(req.session)) {
         res.end('You are loggedIn; Click to ' + 
            '<a href="#logout" onclick="resource.view(' + "'/logout'" + ')">Logout</a>');
      }
      else {
         view.get('login', function(err, data) {
            res.end(data)
         });
      }
   }
},
{
   pattern: '/login',
   post: function(req, res) {
      var postData = require('querystring').parse(unescape(req.postdata));
      if (accessControl.login(req.session, postData)) {
         res.end('succesfull login!')
      }
      else {
         res.end('login failed');
      }
   }
},
{
   pattern: '/loggedIn',
   get: function(req, res) {
      res.end('loggedIn = ' + accessControl.loggedIn(req.session))
   }
},
{
   pattern: '/logout',
   get: function(req, res) {
      accessControl.logout(req.session);
      res.end('logout')
   }
},
{
   middleware: connect.static(__dirname + "/" + env.static.area)
},
{
   resourceNotFound: function get(req, res) {
      res.setNotFoundStatus();
      res.end('<h3>Resource Not Found</h3><pre>' + req.params.pathname + '</pre>');
   }
}
];

function start(callback) {
   router = router(routerData);
   env.app.handler = function(req, res) {
      router.proceed(this, req.method, req.params.pathname, req, res);
   }
   callback();
}

start(function () {
   server.run(env.app);
   console.log('listening on host: ' + env.app.hostname + ' port: ' + env.app.port);
});