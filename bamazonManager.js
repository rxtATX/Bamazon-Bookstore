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

runEntireProcess();

function runEntireProcess() {
	inquirer.prompt([
	{
		type: "list",
		name: "query",
		message: "Select an action.",
		choices: ["View Products for Sale.", "View Low Inventory.", "Add to Inventory.", "Add New Product."]
	},
	{
		type: "input",
		name: "id_input",
		message: "What is the product ID number?",
		when: function(answer) {
			return answer.query === "Add to Inventory.";
		},
		validate: function(answer) {
			if (isNaN(answer) === false) {
				return true;
			}
			console.log("You need to enter a valid numerical amount.");
			return false;
		}
	},
	{
		type: "input",
		name: "title",
		message: "What is the title of the new product?",
		when: function(answer) {
			return answer.query === "Add New Product.";
		}
	},
	{
		type: "confirm",
		name: "textbook",
		message: "Is the new product a textbook?",
		when: function(answer) {
			return answer.title !== undefined;
		}
	},
	{
		type: "list",
		name: "department",
		message: "In which department does this product belong?",
		choices: ["Award Winners", "Bargain Books", "Children's Books", "Books in Spanish"],
		when: function(answer) {
			return !(answer.textbook);
		},
		validate: function(answer) {
		}
	},
	{
		type: "input",
		name: "author",
		message: "Who is the author of the new product?",
		when: function(answer) {
			return answer.textbook === false;
		}
	},
	{
		type: "input",
		name: "quantity",
		message: "How many units are being added to the stock?",
		when: function(answer) {
			if (answer.id_input !== undefined) {
				return answer.id_input;
			} else if (answer.title !== undefined);
				return answer.title;
			},
		validate: function(answer) {
			if (isNaN(answer) === false) {
				return true;
			}
			console.log("You need to enter a valid numerical amount.");
			return false;
		}
	},
	{
		type: "input",
		name: "price",
		message: "How much does this new product cost per unit?",
		when: function(answer) {
			return answer.title !== undefined;
		},
		validate: function(answer) {
			if (isNaN(answer) === false) {
				return true;
			}
			console.log("You need to enter a valid numerical amount.");
			return false;
		}
	}
	]).then(function(info) {
		if (info.textbook) {
			info.department = "Textbook";
		}
		var product_id = info.id_input;
		var title = info.title;
		var author = info.author;
		var quantity = parseFloat(info.quantity);
		var price = info.price;
		var department = info.department;

		if (info.query === "View Products for Sale.") {
			connection.query("SELECT * FROM products", function(err, res) {
				if (err) throw err;
				for (var i = 0; i < res.length; i++) {

					console.log("| Item ID: " + res[i].item_id + " | $" + res[i].price + " | '" + res[i].product_name + "' by " + res[i].author_name + " | From: " + res[i].department_name + " | Remaining: " + res[i].stock_quantity + "\n_____________________________________________________________________________________________________________");
				}
			});

			terminateConnection();
		} else if (info.query === "View Low Inventory.") {
			connection.query("SELECT * FROM products WHERE stock_quantity BETWEEN 0 AND 100", function(err, res) {
				if (err) throw err;
				for (var i = 0; i < res.length; i++) {
					
					console.log("| Item ID: " + res[i].item_id + " | '" + res[i].product_name + "' | From: " + res[i].department_name + " | Remaining: " + res[i].stock_quantity + "\n_____________________________________________________________________________________________________________");
				}
			});

			terminateConnection();
		} else if (info.query === "Add to Inventory.") {
			connection.query("SELECT stock_quantity FROM products WHERE item_id = ?", product_id, function(err, res) {
				if (err) throw err;
				console.log(quantity + " added to item number " + product_id);

				var original = parseFloat(res[0].stock_quantity);
				quantity = original + quantity;
				connection.query("UPDATE products SET ? WHERE ?", [{stock_quantity: quantity}, {item_id: product_id}], function(err, res) {});
			});

			terminateConnection();
		} else if (info.query === "Add New Product.") {
			var newData = {
				product_name: title,
				author_name: author,
				department_name: department,
				price: price,
				stock_quantity: quantity
			};
			connection.query("INSERT INTO products SET ?", newData, function(err, res) {
				if (author !== undefined) {
				console.log("You have added " + quantity + " of '" + title + "' by " + author + " to the " + department + " department to be sold for $" + price + " each.");
				} else {
				console.log("You have added " + quantity + " of '" + title + "' to the " + department + " department to be sold for $" + price + " each.");
				}
			});

			terminateConnection();
		}
	});
}

function terminateConnection() {
	inquirer.prompt([
		{
			type: "confirm",
			name: "endConnection",
			message: "Would you like to disconnect?"
		}
	]).then(function(info) {
		if (info.endConnection === true) {
			connection.end();
		} else {
			runEntireProcess();
		}
	});
}