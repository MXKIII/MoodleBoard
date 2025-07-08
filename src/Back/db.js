import mysql from "mysql2";
import dotenv from "dotenv";
dotenv.config();

let db;

export function connectDB(callback) {
  db = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  db.connect((err) => {
    if (err) {
      console.error('Error connecting to database:', err);
      throw err;
    }
    console.log("Connected to DB");
    callback();
  });
}

export function getDB() {
  return db;
}
