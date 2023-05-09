const jwt = require("jsonwebtoken");


const secertkey = "somesecretkey";
// TODO: create environment variables to contain the .env variables such as the secret key
const authMiddleware = (req, res, next) => {
    // access token from authorization header
    // if not defined, split the header value to an array using the space as separator then extract the second value
    const token = req.headers.authorization;
    // if no token
    if (!token) {
        return res.status(401).json({
                status: "failure",
                message: 'Authentication failed: missing token.'
            }
        );
    }
    try {
        // try to decode the token, if it goes without any exceptions then it's correct
        const decodeToken = jwt.verify(token, secertkey);
        req.userData = {userId: decodeToken.userId};
        // pass the request to the next middleware in the stack.
        next();
    } catch (error) {
        res.status(401).json({
            status: "failure",
            message: "Authentication failed: invalid token"
        });
    }
}


module.exports = authMiddleware;