const express = require("express");
const cors = require("cors"); // 引入 cors 中间件
const url = require("url");
const jwt = require("./utils/jwt");
const apiHandlers = require("./apiHandlers");
// 引入 authMiddleware
const authMiddleware = require("./utils/authMiddleware");
const allowedOrigins = ["http://10.2.20.43:5000", "http://example.com"]; // 允许跨域的白名单

const app = express();
const port = 9000;
// 解决跨域问题
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);
app.use(express.json());
// 注册接口
app.post("/api/register", (req, res) => {
  const { username, password, email } = req.body;
  const values = [username, password, email];
  if (!username || !password || !email) {
    res.status(400).json({ error: "Missing necessary parameters" });
    return;
  }

  apiHandlers.registerApiHandlers(values, (error, results) => {
    if (error) {
      res.status(error.code).json({ error: error.msg, code: error.code, success: false, timestap: `${new Date().getTime()}` });
    } else {
      res.json(results);
    }
  });
});
// 登录接口
app.post("/api/login", (req, res) => {
  const { password, email, permissionType } = req.body;
  const values = [email, password, permissionType];
  if (!password || !email) {
    res.status(400).json({ error: "Missing necessary parameters" });
    return;
  }

  apiHandlers.login(values, (error, results) => {
    if (error) {
      res.status(error.code).json({ error: error.msg, code: error.code, success: false, timestap: `${new Date().getTime()}` });
    } else {
      res.json(results);
    }
  });
});
// 获取用户信息接口
app.get("/api/getUserInfo", authMiddleware, (req, res) => {
  // 现在，您可以在 req.user 中访问解码后的用户信息
  apiHandlers.getUserInfo(req.user.sub, (error, results) => {
    if (error) {
      res.status(error.code).json({ error: error.msg, code: error.code, success: false, timestap: `${new Date().getTime()}` });
    } else {
      res.json(results);
    }
  });
});
// 获取系别列表接口
app.post("/api/getDepartmentList", authMiddleware, (req, res) => {
  // const { permissionType } = req.body;
  apiHandlers.getDepartmentList((error, results) => {
    if (error) {
      res.status(error.code).json({ error: error.msg, code: error.code, success: false, timestap: `${new Date().getTime()}` });
    } else {
      res.json(results);
    }
  });
});
// 获取字典接口
app.get("/api/getDictionary", authMiddleware, (req, res) => {
  const queryObject = url.parse(req.url, true).query;
  const { dictKeys } = queryObject;
  apiHandlers.getDictionary(dictKeys, (error, results) => {
    if (error) {
      res.status(error.code).json({ error: error.msg, code: error.code, success: false, timestap: `${new Date().getTime()}` });
    } else {
      res.json(results);
    }
  });
});

// 监听端口
app.listen(port, () => {
  console.log(`Server is running on http://10.2.20.43:${port}`);
});
