
var passport = require('passport');
var localStrategy = require('passport-local').Strategy;
var facebookStrategy = require('passport-facebook').Strategy;
var db = require('./db.js');

/*passport.serializeUser(function(user, done){
	done(null, user.id);
});

passport.deserializeUser(function(id, done){
	var columns = ['display_name', 'email', 'auth_id', 'token'];
	db.query('SELECT ?? FROM users WHERE email = ? AND password = ?', 
		[columns, username, password], function(error, results, fields){
			done(error, results[0]);
		});
});*/
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

passport.use(new localStrategy({
		usernameField: 'email'
	},

	function(username, password, done){
	//console.log('user: ' + username + ', password: ' + password);
	var columns = ['id', 'display_name', 'email', 'auth_id', 'token'];

	db.query('SELECT ?? FROM users WHERE email = ? AND password = PASSWORD(?)', 
		[columns, username, password], function(error, results, fields){
			if(error){
				console.log(error);
				return done(error);
			}
			if(results.length === 0){
				return done(null, false, {message: 'Incorrect username or password'});
			}
			return done(null, results[0]);
		});
}));

passport.use(new facebookStrategy({
		clientID: '311650595969273',
		clientSecret: '09f5647546ee229cb73b5aa17a1f9dfb',
		callbackURL: 'http://localhost:3000/fbcallback',
		profileFields: ['id', 'displayName', 'name', 'gender', 'email', 'photos'],
		passReqToCallback: true
	}, 
	function(req, accessToken, refreshToken, profile, done){
		process.nextTick(function(){
			if(!req.user){
				var columns = ['id', 'display_name', 'email', 'auth_id', 'token'];

				db.query('SELECT ?? FROM users WHERE auth_id = ?', 
					[columns, profile.id], function(error, results, fields){
						if(error) return done(error);
						if(results.length === 0){
							var newUser = {
								display_name: profile.displayName,
								email: (profile.emails[0].value || '').toLowerCase(),
								auth_id: profile.id,
								token: accessToken
							};
							db.query('INSERT INTO users(display_name, email, auth_id, token) VALUES (?, ?, ?, ?)',
								[newUser.display_name, newUser.email, newUser.auth_id, newUser.token], 
								function(insError, insResults, insFields){
									if(insError)return done(insError);
									newUser.id = insResults.insertedId;
									return done(null, newUser);

							});				

						}else{

							var user = results[0];
							//console.log(user);
							if(!user.token){
								user.token = accessToken;
								user.display_name = profile.displayName;
								user.email = (profile.emails[0].value || '').toLowerCase();

								return done(null, user);

								db.query('UPDATE users SET token = ?, display_name = ?, email = ? WHERE id = ?', 
									[user.token, user.display_name, user.email, user.id],
									function(updError, updResults, updFields){
										console.log(updResults);
										if(updError) return done(updError);
										return done(null, user);
								});
							}
							return done(null, user);
						}
				});
			}else{
				console.log('pulling user out of the session');
				var user = req.user;
				user.email = (profile.emails[0].value || '').toLowerCase();
				user.token = accessToken;
				user.display_name = profile.displayName;
				user.auth_id = profile.id;
				db.query('UPDATE users SET token = ?, display_name = ?, email = ? WHERE id = ?', 
					[user.token, user.display_name, user.email, user.id],
					function(updError, updResults, updFields){
						if(updError) return done(updError);
						return done(null, user);
				});
			}
		});
	}
));