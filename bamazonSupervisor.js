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
//Calls function which starts the entire application
handleSupervisorInputs();
//This function holds all processes necessary for application to run
function handleSupervisorInputs() {
	inquirer.prompt([
		{
			type: "list",
			name: "query",
			message: "Select an option.",
			choices: ["View Product Sales by Department.", "Create New Department."]
		}
	]).then(function(info) {
		//These if statements depend on the initial section by the user and will either display the information requested, or store the input into the affected tables within the database
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
//If the user wants to alter the information stored on the database, this function will run
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
		//Validation to ensure an existing department name will not be duplicated
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
					//Object which holds all new information input by user
					var newDeptData = {
						department_name: newName,
						over_head_costs: OHC,
						total_sales: sales
					};
					//Updates the database with the object
					connection.query("INSERT INTO departments SET ?", newDeptData, function(err, res) {
						if (err) throw err;
					});

					terminateConnection();
				});
			} else {
				//If the department already exists the user may try again
				console.log("That department already exists.");
				departmentInputs();
			}
		});	
	});
}
//Function to end connection includes option to relaunch entire application
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