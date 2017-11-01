var express = require('express');
var router = express.Router();
var db = require('../config/db.js');
var passport = require('passport');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get('/login', function(req, res, next){

	res.render('login', {errMessage: req.flash('info')});
});

router.get('/logout', function(req, res, next){
	req.logout();
	res.redirect('/');
});
router.post('/login', passport.authenticate('local', {
	successRedirect: '/users', failureRedirect: '/login', failureFlash: true}));

router.get('/register', function(req, res, next) {
  res.render('register', { title: 'Express' });
});

router.post('/register', function(req, res, next){
	var user = {display_name: req.body.name, email: req.body.email, password: req.body.password};
	db.query('INSERT INTO users(display_name, email, password) VALUES(?, ?, PASSWORD(?))', 
		[user.display_name, user.email, user.password], function(error, result, fields){
			if(error){
				console.log(error);
				res.render('error', {message: error, error: {status: 500}});
				return;
			}
			res.redirect('/users');
		});
});

router.get('/users', function(req, res, next){
	if(!req.user){
		res.redirect('/login');
	}else{
		//console.log(req.user);
		db.query('SELECT * FROM users', function(error, results, fields){
			if(error){
				console.log(error);
				res.render('error', {message: error, error: {status: 500}});
				return;
			}
			//console.log(results);
			res.render('users', {users: results, curUser: req.user});

		});	
	}
});

router.get('/fblogin', passport.authenticate('facebook'));

router.get('/fbcallback', passport.authenticate('facebook', {successRedirect: '/users', 
	failureRedirect: 'login'})
);

module.exports = router;
