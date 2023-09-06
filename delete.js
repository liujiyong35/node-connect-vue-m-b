let mysql = require("mysql");
let config = require("./config.js");

let connection = mysql.createConnection(config);

let sql = `DELETE FROM todos WHERE id = ?`;
let id = 5;

connection.query(sql, id, (err, results, fields) => {
  if (err) {
    return console.error(err.message);
  }
  console.log("Deleted Row(s):", results.affectedRows);
});
connection.end();
