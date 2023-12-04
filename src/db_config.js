import mysql from "mysql2/promise";

// create the connection to database
const db_config = {
  host: "localhost",
  port: 3306,
  user: "root",
  database: "hardtech",
  password: process.env.DB_PASS,
};

// export const connection = mysql.createConnection(db_config);
export const connection = mysql.createPool(db_config);
console.log("MySQL Connected");
