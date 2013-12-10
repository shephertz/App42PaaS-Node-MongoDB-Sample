
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');

var mongo = require('mongodb');
var monk = require('monk');
var db = monk('<User Name>:<Password>@<VM IP>:<VM PORT>/<Database name>');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// App root URL will redirect to Users list
app.get('/', function(req, res){
  var collection = db.get('usercollection');
  collection.find({},{},function(e,docs){
    res.render('users', {
      "users" : docs
    });
  });
});

// Add a new User
app.get("/users/new", function (req, res) {
  res.render("new", {
    title: 'App42PaaS Express MongoDb Application'
  });
});

// Save the Newly created User
app.post("/users", function (req, res) {
  // Get our form values. These rely on the "name" attributes	
  var name=req.body.name;
  var email=req.body.email;
  var des=req.body.des;

  // Set our collection
  var collection = db.get('usercollection');

  // Submit to the DB
  collection.insert({
    "name" : name,
    "email" : email,
    "des" : des
  }, function (err, doc) {
    if (err) {
      // If it failed, return error
      res.send("There was a problem adding the information to the database.");
    }
    else {
      // If it worked, set the header so the address bar doesn't still say /adduser
      res.location("users");
      // And forward to success page
      res.redirect("/");
    }
  });
});

// http server
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
