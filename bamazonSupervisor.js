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

handleSupervisorInputs();

function handleSupervisorInputs() {
	inquirer.prompt([
		{
			type: "list",
			name: "query",
			message: "Select an option.",
			choices: ["View Product Sales by Department.", "Create New Department."]
		}
	]).then(function(info) {
		if (info.query === "View Product Sales by Department.") {
			connection.query("SELECT * FROM departments", function(err, res) {
				if (err) throw err;

				for (var i = 0; i < res.length; i++) {
					var total_profit = parseFloat(res[i].total_sales - res[i].over_head_costs);

					if (total_profit < 0) {
						console.log(res[i].department_id + ": The " + res[i].department_name + " department has a total sales amount of $" + res[i].total_sales + " and the over-head cost of $" + res[i].over_head_costs + " which amounts to a total loss of $" + (total_profit * -1) + "\n----------------------------------------------------------------------------------------------------------------------------------------------------------");
					} else if (total_profit >= 0) {
						console.log(res[i].department_id + ": The " + res[i].department_name + " department has a total sales amount of $" + res[i].total_sales + " and the over-head cost of $" + res[i].over_head_costs + " which amounts to a total of $" + total_profit + " in profit.\n----------------------------------------------------------------------------------------------------------------------------------------------------------");
					}
				}

				terminateConnection();
			});			
		} else if (info.query === "Create New Department."){
			departmentInputs();
		}
	});
}

function departmentInputs() {
	inquirer.prompt([
		{
			type: "input",
			name: "newDept",
			message: "What is the new department name?"
		}
	]).then(function(info) {
		var newName = info.newDept;
		var valid;

		connection.query("SELECT department_name FROM departments", function(err, res) {
			if (err) throw err;

			for (var i = 0; i < res.length; i++) {
				if (newName !== res[i].department_name) {
					valid = true;
				} else {
					valid = false;
				}
			}
			if (valid) {
				inquirer.prompt([
				{
					type: "input",
					name: "overhead",
					message: "What kind of overhead costs will this department have?",
					validate: function(res) {
						if (isNaN(res) === false) {
							return true;
						}
						console.log("You need to enter a valid numerical value.");
						return false;
					}		
				}
				]).then(function(info) {
					var sales = 0;
					var OHC = info.overhead;
					var newDeptData = {
						department_name: newName,
						over_head_costs: OHC,
						total_sales: sales
					};

					connection.query("INSERT INTO departments SET ?", newDeptData, function(err, res) {
						if (err) throw err;
					});

					terminateConnection();
				});
			} else {
				console.log("That department already exists.");
				departmentInputs();
			}
		});	
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
			handleSupervisorInputs();
		}
	});
}