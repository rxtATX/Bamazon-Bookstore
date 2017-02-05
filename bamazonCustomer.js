"use strict";
//Require the NPMs
var mysql = require("mysql");
var inquirer = require("inquirer");
//Require file which holds the password
var passcode = require("./keys.js");
//Create the connection object for the MySQL database we're using
var connection = passcode.connection;
//Actually connecting to server
connection.connect(function(err) {
	if (err) throw err;
});
//Global variables
var runningTotal = 0;
//Calls function which starts the entire application
runProcess();
//This function holds the two functions necessary for application: displaying the available products, and a time-delayed prompt for customer input.
function runProcess() {
	displayTable();
	setTimeout(purchaserQuery, 500);	
}
//Show table
function displayTable() {
	connection.query("SELECT * FROM products", function(err, res) {
		for (var i = 0; i < res.length; i++) {

			console.log("| Item ID: " + res[i].item_id + " | $" + res[i].price + " | '" + res[i].product_name + "' by " + res[i].author_name + " | From: " + res[i].department_name + " |" + "\n_____________________________________________________________________________________________________________");
		}
	});
}
//Ask user questions and capture input
function purchaserQuery() {
	inquirer.prompt([
	{
		type: "input",
		name: "query",
		message: "Input the item ID you wish to purchase.",
		//Prevents the app from accepting non-numerical inputs
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
	//This grabs information from the MySQL database to assign as useable variables
	connection.query("SELECT * FROM products WHERE item_id = ? ", item, function(err, res) {
			if (err) throw err;
			var department = res[0].department_name;
			var stock = res[0].stock_quantity;
			if (stock >= quantity) {
				var stockTotal = stock - quantity;
				var price = res[0].price;
				var cost = quantity * price;
				//Alters the information within the database to reflect customer selections
				connection.query("UPDATE departments SET ? WHERE ?", [{total_sales: cost}, {department_name: department}], function(err, res) {});
				//Represents the user's "Shopping cart"
				runningTotal = runningTotal + cost;
				console.log("Your total comes to $" + runningTotal);
				//Changes the quantity available after user check-out
				connection.query("UPDATE products SET ? WHERE ?", [{stock_quantity: stockTotal}, {item_id: item}], function(err, res) {});
				//Option to disconnect from server and end application
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
			//If the item is out-of-stock, the user will be prompted back to start.
			} else {
				console.log("Insufficient quantity!");
				runProcess();
			}
		});
	});
}