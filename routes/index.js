var express = require('express');
var router = express.Router();
var Users = require('../model/User');
var hash = require('../pass').hash;

/* GET home page. */
router.get('/', function(req, res, next) {
 
 if(req.session && req.session.user){
 	 res.redirect('/home');
 }else{
 	res.redirect('/login');
 }

 	
	
});

router.get('/home' , function(req ,res , next){
	if(req.session.user)
		res.render('home' , {name : "Ajay"})
	else res.redirect('/login') ;
});

router.get('/login' , function(req ,res , next){
	if(req.session.user){
		res.redirect('/home');
	}

	res.render('login');
});

router.get('/logout' , function(req ,res , next){
	if(req.session.user){
			req.session.destroy(function(){

				res.render('logout');	
			});
	}else res.redirect('/login')
});

router.get('/signup' , function(req ,res , next){
	if(req.session && req.session.user){
		res.redirect('/home');
	}else{
		res.render('signup');	
	}
	
});
router.get('/error' , function(req ,res , next){
	if(req.session.user && req.session.locals.error)
		res.render('error'  , { message : req.session.locals.error });
	else if(req.session.user)
		res.render('error'  , { message : req.session.locals.error });
	else
		res.render('error'  , { message : req.session.locals.error });
});

router.post('/login' , function(req , res , next){
	var username  = req.body.username;
	var password = req.body.password;

	authenticate(username , password , function(err ,user){	
		
		if(err) {  req.session.locals.error = err.message ; res.redirect('/error'); }
		else{
			req.session.user = user;
			req.session.success = "User is in session";
			res.redirect('/home');
		}
		
	})
});
router.post('/signup' , userExist ,  function(req ,res , next){

	var username = req.body.username;
	var password = req.body.password;

	hash(password , function(err, salt , hash){
		if(err) throw err;
		new Users({ username : username , hash : hash , salt : salt}).save(function(err , UserCreated){
				if(err) throw err;
				authenticate(username , password , function( err , user ){
					if(err) throw err;
					
					  req.session.user = user;
					  req.session.success = 'User is in session';
					  //res.redirect('/home' , {user : req.session.user});
					  //req.session.success = 'Authenticated as ' + user.username + ' click to <a href="/logout">logout</a>. ' + ' You may now access <a href="/restricted">/restricted</a>.';
                	  res.redirect('/home');
				});	
		})

	});
})

function userExist(req , res , next){
	Users.count({username : req.body.username } , function(err , count){
		if(err) throw err;
		if(count == 0){
			next();
		}else{
			req.session.error = 'User already exists';
			//res.redirect('/');
			res.send(req.session.error);
			 //throw new Error(req.session.error);
		}
	})
};

function authenticate( username , pass , fn){
	Users.findOne({username  : username} , function(err , user){
			//if(err) throw err ;
			if(user){
				hash(pass, user.salt , function(err, hash){
							if(err) throw err;
			
							if(hash == user.hash)
							{
								fn(null, user);
							}else{
								fn(new Error('Authentication Failed!'));
							}
			
						});
			}else{
				fn(new Error('User not Found!'));
			}
	})

}

module.exports = router;
