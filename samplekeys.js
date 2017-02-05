var mysql = require("mysql");

exports.connection = mysql.createConnection({
	host: "localhost",
	port: 3306,
	user: "root",
    //Be sure to input your password here.
	password: "***",
	database: "bamazon_bookstore"
});