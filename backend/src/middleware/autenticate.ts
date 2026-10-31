
import { Request, Response, NextFunction } from "express";
import { supabaseAuth } from "../config/supabase.js"
import {pool} from "../database.js"

export async function authenticate(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader?.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Authentication token required",
            });
        }

        const token = authHeader.slice(7).trim();

        if (!token) {
            return res.status(401).json({
                message: "Authentication token required",
            });
        }

        const { data, error } =
            await supabaseAuth.auth.getUser(token);

        if (error || !data.user) {
            return res.status(401).json({
                message: "Invalid or expired access token",
            });
        }

        // Read the application role from our database,
        // not from user-supplied request data.
        const result = await pool.query(
            `SELECT role
             FROM public.profiles
             WHERE id = $1`,
            [data.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(403).json({
                message: "User profile not found",
            });
        }

        const role = result.rows[0].role;

        if (role !== "student" && role !== "admin") {
            return res.status(403).json({
                message: "Invalid user role",
            });
        }

        req.user = {
            id: data.user.id,
            email: data.user.email ?? undefined,
            role,
        };

        next();
    } catch (error) {
        console.error("Authentication error:", error);

        return res.status(500).json({
            message: "Authentication service error",
        });
    }
}
