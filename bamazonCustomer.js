"use strict";

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

var cost = 0;

runProcess();

function runProcess() {
	displayTable();
	setTimeout(purchaserQuery, 800);	
}

function displayTable() {
	connection.query("SELECT * FROM products", function(err, res) {
		for (var i = 0; i < res.length; i++) {

			console.log("| Item ID: " + res[i].item_id + " | $" + res[i].price + " | '" + res[i].product_name + "' by " + res[i].author_name + " | From: " + res[i].department_name + " |" + "\n_____________________________________________________________________________________________________________");
		}
	});
}

function purchaserQuery() {
	clearInterval();
	inquirer.prompt([
	{
		type: "input",
		name: "query",
		message: "Input the item ID you wish to purchase.",
		validate: function(res) {
			if (isNaN(res) === false) {
				return true;
			}
			console.log("You need to enter a valid numerical ID.");
			return false;
		}
	},
	{
		type: "input",
		name: "quantity",
		message: "How many of this item will you purchase?",
		validate: function(res) {
			if (isNaN(res) === false) {
				return true;
			}
			console.log("You need to enter a valid numerical amount.");
			return false;
		}
	}
	]).then(function(info) {
	var item = info.query;
	var quantity = info.quantity;
	
	//creat function to input string add title create var = stringid:+id while var.length is < 5 var = var + " " return var;

	connection.query("SELECT * FROM products WHERE item_id = ? ", item, function(err, res) {
			if (err) throw err;
			var stock = res[0].stock_quantity;
			if (stock >= quantity) {
				var stockTotal = stock - quantity;
				var price = res[0].price;
				cost = cost + quantity * price;

				console.log("Your total comes to $" + cost);
				connection.query("UPDATE products SET ? WHERE ?", [{stock_quantity: stockTotal}, {item_id: item}], function(err, res) {});
				inquirer.prompt([
					{
						type: "confirm",
						name: "complete",
						message: "Have you finished shopping?"
					}
				]).then(function(info){
					var complete = info.complete;

					if (complete) {
						console.log("Thank you for shopping with Bamazon.");
						connection.end();
					} else {
						runProcess();
					}
				});

			} else {
				console.log("Insufficient quantity!");
				runProcess();
			}
		});
	});
}