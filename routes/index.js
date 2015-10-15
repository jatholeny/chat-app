var express = require('express');
var router = express.Router();
var request = require('request');

var mongoose = require('mongoose');
var passport = require('passport');
var User = require('../modules/User');
/*mongoose.connect('mongodb://localhost/test',function(err){
  if(err){
    console.log('Could not connect to mongodb on localhost');
  }else{
    console.log('Successfully connected to mongodb');
  }
});*/

mongoose.connect('mongodb://heroku_vmvnkp2l:um0rgahqlheiog2j8k7qmb2h1p@ds027908.mongolab.com:27908/heroku_vmvnkp2l',function(err){
  if(err){
   console.log('Could not connect to mongodb on localhost'); 
  }else{
    console.log('Successfully connected to mongodb');
  }
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index',{user:req.user});
});

//router.get('/validate', function(req, res, next) {
//  //console.log(req.user);
//  if (req.user) {
//    res.status(200).json({ message: 'user is already logged in ... ' , user: {
//      username: req.user.username
//    }});
//  } else {
//    res.status(401).json({message: 'User is not logged in.'});
//  }
//
//});

router.get('/chat',function(req,res,next){
  if(req.isAuthenticated()){return next()}
  res.redirect('/');
},function(req,res){
  request({
    url:'https://widgetaskapp.herokuapp.com/user/'+req.user.username,
    method:'get'
  },function(err,response,body){
    if(err){
      return console.log('Error:',err);
    }
    if(response.statusCode !== 200){
      return console.log('Invalid Status Code Returned:',response.statusCode);
    }
    var user = {};
    user.user_id = JSON.parse(body).id;
    user.username = req.user.username;
    res.render('chat',{user:user});
  });
});

router.post('/register',function(req,res){
    //console.log(req.body);
    User.register(new User(req.body),req.body.password,function(err){
      if(err){
        res.status(400).json({message:'username has been registered'});
      }else{
        request({
          url:'https://widgetaskapp.herokuapp.com/user',
          method:'POST',
          json:req.body},function(err,response,body){
          if(err){
            return console.log('Error:',err);
          }
          if(response.statusCode !== 201){
            return console.log('Invalid Status Code Returned:',response.statusCode);
          }
          res.json(body);

        });
      }
    });
});

router.post('/login',passport.authenticate('local'),function(req,res){

    res.status(200).json({ user: {
      username: req.user.username
    }});

});

router.get('/logout',function(req,res){
  req.logout();
  res.redirect('/');
});

router.post('/assign',function(req,res){
  console.log('======');
  console.log(req.body);
  request({
    url:'https://widgetaskapp.herokuapp.com/assignTask',
    method:'POST',
    json:req.body
  },function(err,response,body){
    if(err){
      return console.log('Error:',err);
    }
    if(response.statusCode !== 201){
      return console.log('Invalid Status Code Returned:',response.statusCode);
    }
    console.log(body);
    res.json(body);

  });
});

module.exports = router;
