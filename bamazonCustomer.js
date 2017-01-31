'use strict';

var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
	host: "localhost",
	port: 3306,
	user: "root",
	password: "******",
	database: "bamazon_bookstore"
});
connection.connect(function(err) {
	if (err) throw err;
});
purchaserQuery();

function purchaserQuery() {
	inquirer.prompt([
	{
		type: "input",
		name: "query",
		message: "Input the item ID you wish to purchase.",
	},
	{
		type: "input",
		name: "quantity",
		message: "How many of this item will you purchase?",
	}
	]).then(function(info) {
		var item = info.query;
		var quantity = info.quantity;

		connection.query("SELECT * FROM products WHERE item_id = ? ", item, function(err, res) {
			if (err) throw err;
			var stock = res[0].stock_quantity;
			if (stock >= quantity) {
				var total = stock - quantity;
				var cost = res[0].price;
				console.log(total);

				console.log("inside: " + item);
				console.log("The items are available");
				console.log("Your total comes to $" + (quantity * cost));
				connection.query("UPDATE products SET ? WHERE ?", [{stock_quantity: total}, {item_id: item}], function(err, res) {});
			} else {
				console.log("Insufficient quantity!");
				purchaserQuery();
			}
		});
	});
} 