let mysql = require("mysql");
let connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "123456",
  database: "todoapp",
});
// 连接数据库
connection.connect(function (err) {
  if (err) {
    return console.error("error: " + err.message);
  }
  console.log("Connected to the MySQL server.");
  let createTodos = `
  create table if not exists todos(
    id int primary key auto_increment,
    title varchar(255)not null,
    completed tinyint(1) not null default 0
  )`;
  connection.query(createTodos, function (err, results, fields) {
    if (err) {
      console.log(err.message);
    }
  });
  // 关闭数据库
  //connection.destroy();
  connection.end(function (err) {
    if (err) {
      return console.log("error:" + err.message);
    }
    console.log("Close the database connection.");
  });
});

// 连接池
// var pool = mysql.createPool({
//   connectionLimit: 5,
//   host: "localhost",
//   user: "root",
//   password: "",
//   database: "todoapp",
// });
// // 从连接池中获取连接
// pool.getConnection(function (err, connection) {
//   // execute query
//   // ...
//   connection.release();
// });
// // 关闭连接池
// pool.end(function (err) {
//   if (err) {
//     return console.log(err.message);
//   }
//   // close all connections
// });
