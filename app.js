// Import necessary modules
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

// Create an instance of express
const app = express();

// Use the CORS middleware to enable Cross-Origin Resource Sharing (CORS)
app.use(cors());

// Middle ware to extract info from the html body name attribute
app.use(
  express.urlencoded({
    extended: true,
  })
);

// Middle ware to extract info from the frontend that are sent through json
app.use(express.json());

// Route to check if the server is running
app.get("/", (req, res) => {
  res.send("The server is running");
});

// // Create a MySQL connection
const connection = mysql.createConnection({
  host: "localhost", // MySQL server host
  user: "september", // MySQL username
  password: "september", // MySQL password
  database: "september", // Database to use
  // socketPath: "/Applications/MAMP/tmp/mysql/mysql.sock", // Uncomment if using MAMP
});

// Connect to the MySQL database
connection.connect((err) => {
  if (err) {
    console.log(err); // Log error if connection fails
  } else {
    console.log("Database is connected"); // Log success message
  }
});

// Route to create tables in the database
app.get("/create-table", (req, res) => {
  // SQL query to create 'customers' table
  let name = `CREATE TABLE IF NOT EXISTS customers (
        customer_id INT AUTO_INCREMENT, 
        name VARCHAR(255) NOT NULL,     
        PRIMARY KEY (customer_id)      
    )`;

  // SQL query to create 'address' table
  let address = `CREATE TABLE IF NOT EXISTS address (
        address_id INT AUTO_INCREMENT,   
        customer_id INT(11) NOT NULL,    
        address VARCHAR(255) NOT NULL,    
        PRIMARY KEY (address_id),       
        FOREIGN KEY (customer_id) REFERENCES customers (customer_id) 
    )`;

  // SQL query to create 'company' table
  let company = `CREATE TABLE IF NOT EXISTS company (
        company_id INT AUTO_INCREMENT,    
        customer_id INT(11) NOT NULL,    
        company VARCHAR(255) NOT NULL,    
        PRIMARY KEY (company_id),        
        FOREIGN KEY (customer_id) REFERENCES customers (customer_id) 
    )`;

  // Execute the query to create 'customers' table
  connection.query(name, (err) => {
    if (err) {
      console.log(err); // Log error if query fails
    }
  });

  // Execute the query to create 'address' table
  connection.query(address, (err) => {
    if (err) {
      console.log(err); // Log error if query fails
    }
  });

  // Execute the query to create 'company' table
  connection.query(company, (err) => {
    if (err) {
      console.log(err); // Log error if query fails
    }
  });

  // Send response indicating tables were created
  res.send("Tables created successfully");
});

// CRUD (Create, Read, Update, Delete)
// #1. Route: /add-customer => To insert customer data to the tables
app.post("/add-customer", (req, res) => {
  // Destructuring
  const { name, address, company } = req.body;

  let insertName = "INSERT INTO customers (name) VALUES (?)";
  let insertAddress =
    "INSERT INTO address (customer_id, address) VALUES (?, ?)";
  let insertCompany =
    "INSERT INTO company (customer_id, company) VALUES (?, ?)";

  connection.query(insertName, [name], (err, result, fields) => {
    if (err) console.log(err);

    console.log(result)
    let id = result.insertId;

    connection.query(insertAddress, [id, address], (err, result) => {
      if (err) console.log(err);
    });

    connection.query(insertCompany, [id, company], (err, result) => {
      if (err) console.log(err);
    });
  });
  res.send("Data inserted successfully");
});

// #2. Route: /customers => To retrieve data from the tables
app.get("/customers", (req, res) => {
  connection.query(
    "SELECT * FROM customers JOIN address JOIN company ON customers.customer_id = address.customer_id AND customers.customer_id = company.customer_id",
    (err, results, fields) => {
      if (err) console.log(err);
      res.send(results);
    }
  );
});

// // Route: /customers => To retrieve customized data from the tables
// app.get("/customers", (req, res) => {
// 	connection.query(
// 		"SELECT customers.customer_id AS id, customers.name, address.address, company.company FROM customers JOIN address JOIN company ON customers.customer_id = address.customer_id AND customers.customer_id = company.customer_id",
// 		(err, results, fields) => {
// 			if (err) console.log("Error During selection", err);
// 			// console.log(results);
// 			res.send(results);
// 		}
// 	);
// });



// #3. Route: /update => To  update data from the tables
app.put("/update", (req, res) => {
  const { newName, id } = req.body;

  let updateName = `UPDATE customers SET name = '${newName}' WHERE customer_id = '${id}'`;

  connection.query(updateName, (err, result) => {
    if (err) console.log(err);
    else {
      console.log("Data updated successfully");
      res.send(result);
    }
  });
});

// #4. Route: /remove-user => To delete all data from the tables
app.delete("/remove-user", (req, res) => {
  const { id } = req.body;
  let removeName = `DELETE FROM customers WHERE customer_id = '${id}'`;
  let removeAddress = `DELETE FROM address WHERE customer_id = '${id}'`;
  let removeCompany = `DELETE FROM company WHERE customer_id = '${id}'`;

  connection.query(removeAddress, (err, result) => {
    if (err) console.log(err);
    else {
      console.log("User deleted successfully");
    }
  });
  connection.query(removeCompany, (err, result) => {
    if (err) console.log(err);
    else {
      console.log("User deleted successfully");
    }
  });
  connection.query(removeName, (err, result) => {
    if (err) console.log(err);
    else {
      console.log("User deleted successfully");
    }
  });

  res.send("User Deleted")
});

// Start the server and listen on port 2025
app.listen(2025, () => {
  console.log("Server is running on http://localhost:2025"); // Log server start message
});
