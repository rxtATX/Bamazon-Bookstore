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

var runningTotal = 0;

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
	
	connection.query("SELECT * FROM products WHERE item_id = ? ", item, function(err, res) {
			if (err) throw err;
			var department = res[0].department_name;
			var stock = res[0].stock_quantity;
			if (stock >= quantity) {
				var stockTotal = stock - quantity;
				var price = res[0].price;
				var cost = quantity * price;

				connection.query("UPDATE departments SET ? WHERE ?", [{total_sales: cost}, {department_name: department}], function(err, res) {});

				runningTotal = runningTotal + cost;
				console.log("Your total comes to $" + runningTotal);

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
						console.log("Thank you for shopping with the Bamazon Bookstore.");
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