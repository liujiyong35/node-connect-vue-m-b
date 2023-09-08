const mysql = require("mysql");
const jwt = require("./utils/jwt");
const formatData = require("./utils/formatData");

// MySQL数据库连接配置
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "123456",
  database: "todoapp",
};

// 创建MySQL连接池
const pool = mysql.createPool(dbConfig);
const bcrypt = require("bcrypt");

// 注册API接口
function registerApiHandlers(values, callback) {
  const [username, password, email] = values;

  // 查询数据库中是否已存在相同邮箱的用户
  const selectQuery = "SELECT * FROM users WHERE email = ?";
  pool.query(selectQuery, [email], (error, results) => {
    if (error) {
      console.error("Error executing selectQuery: ", error);
      const errorObj = { msg: error, code: 500 };
      callback(errorObj, null);
    } else {
      if (results.length > 0) {
        // 邮箱已存在，返回错误信息给用户
        const errorObj = { msg: "邮箱已经被注册！", code: 417 };
        callback(errorObj, null);
      } else {
        // 邮箱不存在，可以进行插入数据操作
        // 哈希密码
        bcrypt.hash(password, 10, (hashError, hashedPassword) => {
          if (hashError) {
            console.error("Error hashing password: ", hashError);
            const errorObj = { msg: "密码哈希错误！", code: 500 };
            callback(errorObj, null);
          } else {
            // 插入数据到数据库
            const sqlQuery = "INSERT INTO users (username, password, password_hash, email) VALUES (?, ?, ?, ?)";
            pool.query(sqlQuery, [username, password, hashedPassword, email], (error, results) => {
              if (error) {
                console.error("Error executing query: ", error);
                const errorObj = { msg: error, code: 500 };
                callback(errorObj, null);
              } else {
                callback(null, { code: 200, data: results, success: true, timestamp: `${new Date().getTime()}` });
              }
            });
          }
        });
      }
    }
  });
}
// 登录接口
function login(values, callback) {
  const sqlQuery = "SELECT * FROM users WHERE email = ?";
  const email = values[0];
  const password = values[1];
  const permissionType = values[2];
  pool.query(sqlQuery, [email], (error, results) => {
    if (error) {
      console.error("Error executing query: ", error);
      callback(error, null);
    } else {
      if (results.length === 0) {
        // 用户名不存在
        const errorObjc = { msg: "用户名不存在！", code: 417 };
        callback(errorObjc, null);
      } else {
        const user = results[0];
        if (user.permissionType != permissionType) {
          // 用户权限不匹配
          const errorObjc = { msg: "用户权限不匹配！", code: 417 };
          callback(errorObjc, null);
        } else {
          // 使用 bcrypt.compare 进行密码验证
          bcrypt.compare(password, user.password_hash, (compareError, isPasswordMatch) => {
            if (compareError) {
              console.error("Error comparing passwords: ", compareError);
              const errorObjc = { msg: "密码验证错误！", code: 500 };
              callback(errorObjc, null);
            } else if (!isPasswordMatch) {
              // 密码不匹配
              const errorObjc = { msg: "密码不正确！", code: 417 };
              callback(errorObjc, null);
            } else {
              const token = jwt.generateJWTToken(user.user_id);
              callback(null, { code: 200, data: { token }, success: true, timestamp: `${new Date().getTime()}` });
            }
          });
        }
      }
    }
  });
}
// 获取用户信息
function getUserInfo(userId, callback) {
  const sql = "SELECT * FROM users WHERE user_id = ?";
  pool.query(sql, [userId], (error, results) => {
    if (error) {
      console.error("Error executing query: ", error);
      callback(error, null);
    } else {
      if (results.length === 0) {
        // 用户不存在
        const errorObjc = { msg: "用户不存在！", code: 417 };
        callback(errorObjc, null);
      } else {
        const user = results[0];
        const permissionType = user.permissionType;
        const sql = "SELECT * FROM route_permissions WHERE permissionType = ?";
        pool.query(sql, [permissionType], (error, results) => {
          if (error) {
            console.error("Error executing query: ", error);
            callback(error, null);
          } else {
            const permissions = results;
            // console.log("permissions: ", permissions);
            const data = { userId: user.user_id, username: user.username, email: user.email, permissions };
            callback(null, { code: 200, data, success: true, timestamp: `${new Date().getTime()}` });
          }
        });
      }
    }
  });
}
// 获取系别列表
function getDepartmentList(callback) {
  const sql = "SELECT * FROM department ORDER BY departmentType ASC";
  pool.query(sql, (error, results) => {
    if (error) {
      console.error("Error executing query: ", error);
      callback(error, null);
    } else {
      callback(null, { code: 200, data: results, success: true, timestamp: `${new Date().getTime()}` });
    }
  });
}
// 获取数据字典
function getDictionary(dictKeys, callback) {
  const keyArr = dictKeys.split(",");
  const placeholders = keyArr.map(() => "?").join(", ");
  // 执行查询
  const queryString = `
    SELECT * FROM sys_dict_type
    WHERE dict_type IN (${placeholders});
  `;
  pool.query(queryString, keyArr, (error, results) => {
    if (error) {
      console.error("Error executing query: ", error);
      callback(error, null);
    } else {
      const formattedData = formatData.formatDictData(results);
      callback(null, { code: 200, data: formattedData, success: true, timestamp: `${new Date().getTime()}` });
    }
  });
}
// 保存Token到数据库
function saveTokenToDatabase(userId, callback) {
  const sqlToken = "SELECT * FROM tokens WHERE user_id = ?";
  pool.query(sqlToken, [userId], (error, results) => {
    // 生成Token
    let token = jwt.generateJWTToken(userId);
    if (error) {
      console.error("Error executing query: ", error);
      callback(error, null);
    } else {
      const tokenInfo = results[0];
      if (tokenInfo) {
        const currentTime = new Date().getTime();
        let expirationTime = tokenInfo.expiration_time;

        if (expirationTime > currentTime) {
          // Token 仍然有效
          console.log("Token is valid.", tokenInfo.token);
          callback(null, tokenInfo.token);
        } else {
          // Token 已过期
          console.log("Token has expired.");
          const sqlUpdate = "UPDATE tokens SET token = ?, expiration_time = ? WHERE user_id = ?";
          expirationTime = jwt.calculateExpirationTime();
          pool.query(sqlUpdate, [token, expirationTime, userId], (error, results) => {
            if (error) {
              console.error("Error executing query: ", error);
              callback(error, null);
            } else {
              console.log("Token updated in database.");
              callback(null, token);
            }
          });
        }
      } else {
        // 没有找到相关的 Token 信息
        console.log("Token not found.");
        const expirationTime = jwt.calculateExpirationTime();
        const sqlQuery = "INSERT INTO tokens (user_id, token, expiration_time) VALUES (?, ?, ?)";
        pool.query(sqlQuery, [userId, token, expirationTime], (error, results) => {
          if (error) {
            console.error("Error executing query: ", error);
            callback(error, null);
          } else {
            console.log("Token saved to database.");
            callback(null, token);
          }
        });
      }
    }
  });
}

module.exports = {
  registerApiHandlers,
  login,
  getUserInfo,
  getDictionary,
  getDepartmentList,
};
