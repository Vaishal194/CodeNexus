import "dotenv/config";

const url = process.env.DATABASE_URL;

console.log("URL exists:", Boolean(url));
console.log("Starts correctly:", url?.startsWith("postgresql://"));
console.log("Contains placeholder:", url?.includes("YOUR_"));
console.log("Has square brackets:", /[[\]]/.test(url ?? ""));

try {
    if (!url) throw new Error("DATABASE_URL is missing");

    const parsed = new URL(url);

    console.log("URL syntax is valid");
    console.log("Protocol:", parsed.protocol);
    console.log("Host:", parsed.hostname);
    console.log("Port:", parsed.port);
    console.log("Database:", parsed.pathname);
} catch (error) {
    console.error("URL validation failed:", error);
}