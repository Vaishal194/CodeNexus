
declare global {
    namespace Express {
        interface User {
            id: string;
            email?: string;
            role: "student" | "admin";
        }

        interface Request {
            user?: User;
        }
    }
}

export {};
