var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '1q2wMysql',
  database : 'auth'
});

connection.connect(function(err){
	if(err){
		console.log('conection error ' + err);
		return;
	}
	console.log('Successfully connected to ' + connection.database + ' as ID ' + connection.threadId);
});

module.exports = connection;
