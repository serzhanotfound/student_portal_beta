const http = require("http");
const url = require("url");
const fs = require("fs");
const path = require("path");
const cookie = require('cookie');
const { register, login, checkSession } = require("./auth");

const mimeTypes = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "text/javascript",
    ".png": "image/png",
    ".jpg": "image/jpeg"
};

http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    if(req.method === "POST" & pathname === "/register") {
        let body = "";
        req.on("data", chunk => body += chunk);
        req.on("end", async () => {
            const data = JSON.parse(body);
            const result = await register(data.username, data.password, data.role);
            res.end(JSON.stringify(result));
        });
        return;
    }    

     if (req.method === "POST" && pathname === "/login") {
        let body = "";
        req.on("data", chunk => body += chunk);
        req.on("end", async () => {
            const data = JSON.parse(body);
            const result = await login(data.username, data.password, res);
            res.end(JSON.stringify(result));
        });
        return;
    }

    if (req.method === "GET" && pathname === "/profile") {
        const  cookies = cookie.parse(req.headers.cookie || '');
        const sessionId = cookies.session;

        const user = await checkSession(sessionId);
        if (user) {
            res.end(`Welcome ${user.username}, your role is ${user.role}`);
        } else {
            res.end("Unauthorized");
        }
        return;
    }

     // статика
    const filePath = path.join(__dirname, "public", pathname === "/" ? "index.html" : pathname);
    const ext = path.extname(filePath);
    if (fs.existsSync(filePath)) {
        res.writeHead(200, { "Content-Type": mimeTypes[ext] || "text/plain" });
        fs.createReadStream(filePath).pipe(res);
    } else {
        res.writeHead(404);
        res.end("Not Found");
    }
    
}).listen(3000, () => console.log("Server running on http://localhost:3000"));
