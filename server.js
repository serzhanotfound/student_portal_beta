const http = require("http");
const url = require("url");
const fs = require("fs");
const path = require("path");
const cookie = require('cookie');
const { register, login, checkSession, logout, saveSchedule, getSchedule } = require("./auth");

const mimeTypes = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "text/javascript",
    ".png": "image/png",
    ".jpg": "image/jpeg"
};

//----------------------------------------

http.createServer(async (req, res) => {``
    let parsedUrl = url.parse(req.url, true);
    let pathname = parsedUrl.pathname;

    if(req.method === "POST" && pathname === "/register") {
        let body = "";
        req.on("data", chunk => body += chunk);
        req.on("end", async () => {
            const data = JSON.parse(body);
            const result = await register(data.username, data.password, data.role);
            res.end(JSON.stringify(result));
            return;
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
            return;
        });
        return;
    }

 if (req.method === "POST" && pathname === "/logout") {
        const cookies = cookie.parse(req.headers.cookie || '');
        const sessionId = cookies.session;
        
        
        await logout(sessionId, res); 

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true }));
        return;
    }
  

if (req.method === "POST" && pathname === "/api/save_schedule") {
    const cookies = cookie.parse(req.headers.cookie || '');
    const sessionId = cookies.session;
    const user = await checkSession(sessionId);

    if (!user || user.role !== 'teacher') {
        res.writeHead(403); //Forbidden
        res.end(JSON.stringify({success: false, error: "Доступ запрещен. Только для учителей."}))
        return;
    }

    //СБОР ТЕЛА ЗАПРОСА
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", async () => {
        try{
            const data = JSON.parse(body);

            // data должен содержать:groupName, daOfWeek, lessons
            const result = await saveSchedule(
                user.id, // Используем АЙДИ учителя для привязки расписания
                data.groupName,
                data.dayOfWeek,
                data.lessons
            );

            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(result));
            return;
        } catch (error) {
            console.error("Schedule processing error:", error);
            res.writeHead(500);
            res.end(JSON.stringify({success: false, error: "Неверный формат данных."}));
            return;
        }
    });
    return;
}

//--------------------------POST---------------------------------
if(req.method === "GET" && pathname === "/api/get_schedule") {
    const cookies = cookie.parse(req.headers.cookie || '');
    const sessionId = cookies.session;
    const user = await checkSession(sessionId);


    if (!user) {
        res.writeHead(401);
        res.end(JSON.stringify({success: false, error: "Неавторизованный доступ."}));
        return;
    }

    //Определение группы
    let groupName;
    let dayOfWeek = parsedUrl.query.day;
    
    if(user.role === 'student') {
        groupName = user.group_name;

    } else if(user.role === 'teacher') {
        // Учитель может посматривать любую группу, которую он выберет.
        // Для простоты, здесь мы будем запрашивать группу из URL-параметров.
        // /api/get_schedule?group=Логистика
        groupName = parsedUrl.query.group;
    } else {
        res.writeHead(403);
        res.end(JSON.stringify({success: false, error: "Нет прав для просмотра расписания"}));
        return;
    }

    // Получение данных
    const scheduleData = await getSchedule(groupName, dayOfWeek);

    if(scheduleData) {
        res.writeHead(200, {"Content-Type": "application/json"});
        res.end(JSON.stringify({success: true, schedule: scheduleData, group: groupName}));
        return;
    }else{
        res.writeHead(500);
        res.end(JSON.stringify({success: false, error: "Ошибка при получений данных расписания."}));
        return;
    }
}

    if (req.method === "GET" && pathname === "/profile") {
        const  cookies = cookie.parse(req.headers.cookie || '');
        const sessionId = cookies.session;

        const user = await checkSession(sessionId);
        if (user) {
            res.writeHead(200, { "Content-Type": "application/json"});
            res.end(JSON.stringify({username: user.username , role: user.role}));
            return;
        } else {
            res.writeHead(401);
            res.end("Unauthorized");
            return;
        }
        return;
    }

    if (req.method === "GET" && pathname === "/dashboard") {
    const cookies = cookie.parse(req.headers.cookie || '');
    const sessionId = cookies.session;
    const user = await checkSession(sessionId);

    if (user) {
        const filePath = path.join(__dirname, "public", "dashboard.html");
        if (fs.existsSync(filePath)) {
            res.writeHead(200, { "Content-Type": "text/html" });
            fs.createReadStream(filePath).pipe(res);
            return;
        } else {
            res.writeHead(404);
            res.end("Dashboard not found");
            return;
        }
        return;
    } else {
        res.writeHead(302, { "Location": "/" });
        res.end();
        return;
    }
};




 // статика
    const filePath = path.join(__dirname, "public", pathname === "/" ? "index.html" : pathname);
    const ext = path.extname(filePath);
    if (fs.existsSync(filePath)) {
        res.writeHead(200, { "Content-Type": mimeTypes[ext] || "text/plain" });
        fs.createReadStream(filePath).pipe(res);
        return;
    } else {
        res.writeHead(404);
        res.end("Not Found");
        return;
    };
    return;

}).listen(3000, () => console.log("Server running on http://localhost:3000"));
