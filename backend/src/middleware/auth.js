import jwt from "jsonwebtoken";
import { getUserById } from "../data/users-dao.js";

//Verify if the user is authenticated and if the user is admin
export function verifyAdmin(req, res, next) {
    const token = req.cookies.authToken;

    if (!token) {
        return res.status(401).json({ message: "Authentication required." });
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);

        //Check if the isAdmin data from jwt token created in api-auth.js login route function is True.
        if (!decoded.isAdmin) {
            return res.status(403).json({ message: "Access denied. Admin privileges required." });
        }

        req.user = decoded;  // Attach decoded user to request object
        next();  // Proceed to the next middleware/route handler
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token." });
    }
}

//Basically the same as verifyAdmin function above, but without checking the isAdmin data
export function verifyAuthenticated(req, res, next) {
    const token = req.cookies.authToken;

    // Check if token exists
    if (!token) {
        return res.status(401).json({ message: "Authentication required." });
    }

    try {
        // Verify the token using the secret key
        const decoded = jwt.verify(token, process.env.SECRET_KEY);

        // Attach the decoded user data to the request object
        req.user = decoded;
        
        // Proceed to the next middleware/route handler
        next();
    } catch (error) {
        // Handle invalid or expired token
        return res.status(401).json({ message: "Invalid or expired token." });
    }
}

export async function requiresAuthentication(req, res, next) {

    if (!req.cookies.authToken) return res.sendStatus(401);

    try {
      const decoded = jwt.verify(req.cookies.authToken, process.env.SECRET_KEY);
      const user = await getUserById(decoded.userId);
      if (!user) return res.sendStatus(401);
      req.user = user;
      return next();
    } catch {
      return res.sendStatus(401);
    }
  }

