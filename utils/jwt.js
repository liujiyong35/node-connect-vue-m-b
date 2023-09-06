const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// 生成JWT Token
function generateJWTToken(userId) {
  // 生成 secretKey
  const secretKey = generateSecretKey();
  console.log("generateSecretKey", secretKey);
  const expiresIn = "24h"; // Token过期时间，例如设置为24小时

  // 使用用户ID作为payload生成Token
  const payload = {
    sub: userId,
  };

  // 使用jsonwebtoken库生成Token
  const token = jwt.sign(payload, secretKey, { expiresIn });

  return token;
}
function generateSecretKey() {
  // 生成一个长度为 64 字节的随机字符串作为 secretKey
  // 这里使用 'base64' 编码来表示生成的随机字符串
  const secretKey = "a20230116zhouyi";
  return secretKey;
}
function calculateExpirationTime() {
  // 假设过期时间为 24 小时（可以根据需求进行调整）
  const expirationTimeInHours = 24;

  // 获取当前时间的时间戳（单位：毫秒）
  const currentTime = new Date().getTime();

  // 计算过期时间的时间戳
  const expirationTime = currentTime + expirationTimeInHours * 60 * 60 * 1000;

  return expirationTime;
}
function verifyToken(token, secretKey, callback) {
  console.log("verifyToken", token, secretKey);
  try {
    const decoded = jwt.verify(token, secretKey);
    callback(null, decoded); // 如果验证成功，返回解码后的数据
  } catch (error) {
    callback(error, null); // 如果验证失败，返回错误信息
  }
}
module.exports = {
  generateJWTToken,
  calculateExpirationTime,
  verifyToken,
};
