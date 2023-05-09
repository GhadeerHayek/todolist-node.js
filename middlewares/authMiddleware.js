const jwt = require("jsonwebtoken");
require("dotenv/config")

/**
 *
 * @param req request
 * @param res response
 * @param next next middleware in the stack
 * @returns {*} this middleware ensures that route is only accessed by the authorized user, by checking the token in its headers.
 * If a user is authorized, it modifies the request body and adds a userid field containing the userId extracted from the token.
 */
const authMiddleware = (req, res, next) => {
    // access token from authorization header
    const token = req.headers.authorization;
    // if no token -> not authorized
    if (!token) {
        return res.status(401).json({
                status: "failure",
                message: 'Authentication failed: missing token.'
            }
        );
    }
    try {
        // try to decode the token, if it goes without any exceptions then it's correct
        const decodeToken = jwt.verify(token, process.env.SECRET_KEY);
        req.userData = {userId: decodeToken.userId};
        // pass the request to the next middleware in the stack.
        next();

    } catch (error) {
        // if it fails to decode the token, an exception is thrown and is handled here
        res.status(401).json({
            status: "failure",
            message: "Authentication failed: invalid token"
        });
    }
}


module.exports = authMiddleware;