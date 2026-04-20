import jwt from "jsonwebtoken";

export const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'];
  
  if (!token) {
    console.log("Auth failed: No token provided");
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log("Auth failed: Invalid/Expired token", err.message);
      return res.status(403).json({ error: "Invalid or expired token." });
    }
    req.user = user;
    next();
  });
};
