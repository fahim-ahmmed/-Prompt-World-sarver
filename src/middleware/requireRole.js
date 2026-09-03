// Usage: router.post("/prompts", requireAuth, requireRole("creator", "admin"), handler)
// Must run AFTER requireAuth so req.user is populated.
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "You must be logged in to do that." });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `This action requires one of these roles: ${allowedRoles.join(", ")}.`,
      });
    }
    next();
  };
}
