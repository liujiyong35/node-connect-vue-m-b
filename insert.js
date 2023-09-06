let mysql = require("mysql");
let config = require("./config.js");
let connection = mysql.createConnection(config);
// let sql = `INSERT INTO todos(title,completed)
//            VALUES('Learn how to insert a new row',true)`;

// let stmt = `INSERT INTO todos(title,completed)
//             VALUES(?,?)`;
// let todo = ["Insert anemw row with placeholders", false];

let stmt = `INSERT INTO todos(title,completed)  VALUES ?  `;
let todos = [
  ["Insert multiple rows at a time", false],
  ["现在学习一次插入多行记录(by www.yiibai.com)", true],
  ["It should work perfectly", true],
];
//更多请阅读：https://www.yiibai.com/mysql/nodejs-insert.html

// execute the insert statment
connection.query(stmt, [todos], (err, results, fields) => {
  if (err) {
    return console.error(err.message);
  }
  // get inserted rows
  console.log("Todo Id:" + results.insertId);
});

connection.end();
