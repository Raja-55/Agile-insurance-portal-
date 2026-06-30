const authorizeAdmin = (...roles) => {

    return (req, res, next) => {

        if (!req.admin || !roles.includes(req.admin.role)) {

            return res.status(403).json({
                success: false,
                message: "Access denied"
            });

        }

        next();
    };
};

module.exports = authorizeAdmin;