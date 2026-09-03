import jwt from "jsonwebtoken";

// ১. টোকেন ভেরিফাই করা
export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ success: false, message: "Access Denied! No token provided." });
  }

  try {
    const verified = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback_secret"
    );
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ success: false, message: "Invalid Token" });
  }
};

// ২. রোল চেক করা (Admin / Creator / User)
export const checkRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You do not have permission to perform this action!",
      });
    }
    next();
  };
};