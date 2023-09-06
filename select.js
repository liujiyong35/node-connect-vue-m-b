let mysql = require("mysql");
let config = require("./config.js");

let connection = mysql.createConnection(config);

// let sql = `SELECT * FROM todos`;
// let sql = `SELECT * FROM todos WHERE completed=?`;
let id = 2; // pass argument to query
let sql = `SELECT * FROM todos WHERE id=` + mysql.escape(id);
//更多请阅读：https://www.yiibai.com/mysql/nodejs-select.html

connection.query(sql, (err, results, fields) => {
  if (err) {
    return console.error(err.message);
  }
  console.log(results);
});
connection.end();
