const jwt = require("./jwt");
function authMiddleware(req, res, next) {
  const token = req.headers["x-access-token"];

  if (!token) {
    return res.status(417).json({ error: "未提供token", success: false });
  }

  jwt.verifyToken(token, "a20230116zhouyi", (error, decoded) => {
    if (error) {
      return res.status(401).json({ error: "token已过期", success: false, code: 401 });
    }
    req.user = decoded; // 将解码后的用户信息保存到请求对象中
    next(); // 继续处理下一个中间件或路由处理函数
  });
}

module.exports = authMiddleware;
