const http = require("http");
const url = require("url");
const fs = require("fs");
const path = require("path");
const { Formidable } = require("formidable");
const cookie = require('cookie');
const { register, login, checkSession, logout, saveSchedule, getSchedule, getStudentCourses, getTeacherCourses, 
    getAllCourses, deleteCourse, saveCourse, getUserProfileData, changeUserPassword, updateAvatarPath} = require("./auth");
const UPLOAD_DIR = path.join(__dirname, 'public', 'uploads', 'avatars');

const mimeTypes = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "text/javascript",
    ".png": "image/png",
    ".jpg": "image/jpeg"
};

//----------------------------------------

http.createServer(async (req, res) => {
    let parsedUrl = url.parse(req.url, true);
    let pathname = parsedUrl.pathname;

    const isStatic = pathname.endsWith('.html') || pathname.endsWith('.css') || 
                     pathname.endsWith('.js') || pathname.endsWith('.png') || 
                     pathname.endsWith('.jpg') || pathname.startsWith('/assets/') ||
                     pathname.startsWith('/uploads/');

    if (isStatic) {
        // Указываем, что все файлы находятся в папке 'public'
        const filePath = path.join(__dirname, "public", pathname);
        const ext = path.extname(filePath);
        
        if (fs.existsSync(filePath)) {
            res.writeHead(200, { "Content-Type": mimeTypes[ext] || "text/plain" });
            fs.createReadStream(filePath).pipe(res);
            return;
        } else {
            res.writeHead(404);
            res.end("Not Found: " + pathname);
            return;
        }
    }

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

else if (req.method === "POST" && pathname === "/login") {
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

else if (req.method === "POST" && pathname === "/logout") {
        const cookies = cookie.parse(req.headers.cookie || '');
        const sessionId = cookies.session;
        
        
        await logout(sessionId, res); 

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true }));
        return;
    }
  

else if (req.method === "POST" && pathname === "/api/save_schedule") {
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

else if (req.method === "POST" && pathname === "/api/save_course") {
    const cookies = cookie.parse(req.headers.cookie || '');
    const sessionId = cookies.session;
    const user = await checkSession(sessionId);

    if (!user || user.role !== 'admin') {
        res.writeHead(403);
        res.end(JSON.stringify({ success: false, error: "Доступ запрещен. Только для Администратора." }));
        return;
    }

    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", async () => {
        try {
            const data = JSON.parse(body);
            // data содержит: id (опционально), name, description, credits, teacher_id
            
            const result = await saveCourse(data.id, data.name, data.description, data.credits, data.teacher_id,  data.group_name, data.semester); 

            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(result));

        } catch (error) {
            console.error("Save course processing error:", error);
            res.writeHead(500);
            res.end(JSON.stringify({ success: false, error: "Неверный формат данных." }));
        }
    });
    return;
}

else if (req.method === "POST" && pathname === "/api/delete_course") {
    const cookies = cookie.parse(req.headers.cookie || '');
    const sessionId = cookies.session;
    const user = await checkSession(sessionId);

    if (!user || user.role !== 'admin') {
        res.writeHead(403);
        res.end(JSON.stringify({ success: false, error: "Доступ запрещен. Только для Администратора." }));
        return;
    }

    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", async () => {
        try {
            const data = JSON.parse(body);
            // data содержит: id
            
            const result = await deleteCourse(data.id); 

            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(result));

        } catch (error) {
            console.error("Delete course processing error:", error);
            res.writeHead(500);
            res.end(JSON.stringify({ success: false, error: "Неверный формат данных." }));
        }
    });
    return;
}

else if (req.method === "POST" && pathname === "/api/upload_avatar") {
    const cookies = cookie.parse(req.headers.cookie || '');
    const sessionId = cookies.session;
    const user = await checkSession(sessionId);

    if (!user) {
        res.writeHead(401);
        res.end(JSON.stringify({ success: false, error: "Неавторизованный доступ." }));
        return;
    }

    const form = new Formidable({ 
        uploadDir: UPLOAD_DIR,
        keepExtensions: true,
        maxFileSize: 5 * 1024 * 1024, // 5 МБ
    });

    form.parse(req, async (err, fields, files) => {
        if (err) {
            console.error("Formidable error:", err);
            res.writeHead(400);
            res.end(JSON.stringify({ success: false, error: "Ошибка при разборе файла." }));
            return;
        }

        const avatarFile = files.avatar && files.avatar[0];
        if (!avatarFile) {
             res.writeHead(400);
             res.end(JSON.stringify({ success: false, error: "Файл не был передан." }));
             return;
        }

        const allowedExtensions = ['.png', '.jpg', '.jpeg'];
        const fileExt = path.extname(avatarFile.originalFilename).toLowerCase();
        
        if (!allowedExtensions.includes(fileExt)) {
            // Удаляем некорректный файл
            fs.unlinkSync(avatarFile.filepath); 
            res.writeHead(400);
            res.end(JSON.stringify({ success: false, error: "Недопустимый формат файла. Разрешены только PNG/JPG." }));
            return;
        }

        // 1. Создаем новое имя файла, используя ID пользователя
        const newFileName = `${user.id}_avatar${fileExt}`;
        const newFilePath = path.join(UPLOAD_DIR, newFileName);
        
        // 2. Переименовываем/перемещаем файл
        fs.rename(avatarFile.filepath, newFilePath, async (renameErr) => {
            if (renameErr) {
                console.error("File rename error:", renameErr);
                res.writeHead(500);
                res.end(JSON.stringify({ success: false, error: "Ошибка сервера при сохранении файла." }));
                return;
            }

            // 3. Сохраняем путь в БД
           const publicPath = `/uploads/avatars/${newFileName}`;
           // updateAvatarPath возвращает true/false
           const isPathSaved = await updateAvatarPath(user.id, publicPath); 
           
           // ❗ Изменение здесь: проверяем, что isPathSaved (булево) равно true
           if (isPathSaved) { 
               res.writeHead(200, { 'Content-Type': 'application/json' });
               res.end(JSON.stringify({ success: true, filePath: publicPath }));
           } else {
               // Это произойдет, если запрос к БД прошел, но не обновил ни одной строки (например, user.id не найден)
               res.writeHead(500);
               res.end(JSON.stringify({ success: false, error: "Ошибка БД: Не удалось обновить путь к аватару. Пользователь не найден." }));
           }
        });
    });
    return;
}

//--------------------------POST---------------------------------
else if (req.method === "GET" && pathname === "/") {
    const cookies = cookie.parse(req.headers.cookie || '');
    const sessionId = cookies.session;
    const user = await checkSession(sessionId);

    if (user) {
        // Пользователь авторизован -> Перенаправляем на /dashboard
        res.writeHead(302, { 'Location': '/dashboard' });
        res.end();
        return;
    } else {
        // Пользователь не авторизован -> Отдаем страницу входа (login.html)
        const filePath = path.join(__dirname, "public", "index.html");
        if (fs.existsSync(filePath)) {
            res.writeHead(200, { "Content-Type": "text/html" });
            fs.createReadStream(filePath).pipe(res);
            return;
        }
    }
}

else if(req.method === "GET" && pathname === "/api/get_schedule") {
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

else if (req.method === "GET" && pathname === "/api/get_all_courses") {
    const cookies = cookie.parse(req.headers.cookie || '');
    const sessionId = cookies.session;
    const user = await checkSession(sessionId);

    if (!user || user.role !== 'admin') {
        res.writeHead(403);
        res.end(JSON.stringify({ success: false, error: "Доступ запрещен. Только для Администратора." }));
        return;
    }

    try {
        const coursesData = await getAllCourses(); 

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
            success: true, 
            courses: coursesData,
            role: user.role
        }));

    } catch (error) {
        console.error("Error fetching all courses:", error);
        res.writeHead(500);
        res.end(JSON.stringify({ success: false, error: "Ошибка сервера при получении всех курсов." }));
    }
}

else if (req.method === "GET" && pathname === "/profile") {
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

else if (req.method === "GET" && pathname === "/api/get_courses") {
    // Проверка сессии
    const cookies = cookie.parse(req.headers.cookie || '');
    const sessionId = cookies.session;
    const user = await checkSession(sessionId);

    if (!user) {
        res.writeHead(401);
        res.end(JSON.stringify({ success: false, error: "Неавторизованный доступ." }));
        return;
    }
    const parsedUrl = url.parse(req.url, true);

    try {
        let coursesData;
        let semester = parsedUrl.query.semester;

        // 2. Логика по ролям
        if (user.role === 'student') {
            
             if (!semester) semester = 1; 
            coursesData = await getStudentCourses(user.group_name, parseInt(semester)); 

        } else if (user.role === 'teacher') {
            
            coursesData = await getTeacherCourses(user.id);
        } else {
            res.writeHead(403);
            res.end(JSON.stringify({ success: false, error: "Доступ запрещен для вашей роли." }));
            return;
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
            success: true, 
            courses: coursesData,
            role: user.role
        }));

    } catch (error) {
        console.error("Error fetching courses:", error);
        res.writeHead(500);
        res.end(JSON.stringify({ success: false, error: "Ошибка сервера при получении курсов." }));
    }
}

else if (req.method === "GET" && pathname === "/dashboard") {
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
}
else if (req.method === "GET" && pathname === "/api/get_profile_data") {
    const cookies = cookie.parse(req.headers.cookie || '');
    const sessionId = cookies.session;
    const user = await checkSession(sessionId);

    if (!user) {
        res.writeHead(401);
        res.end(JSON.stringify({ success: false, error: "Неавторизованный доступ." }));
        return;
    }

    try {
        // НОВАЯ ФУНКЦИЯ, см. auth.js
        const profileData = await getUserProfileData(user.id); 

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
            success: true, 
            user: profileData,
            role: user.role
        }));

    } catch (error) {
        console.error("Error fetching profile data:", error);
        res.writeHead(500);
        res.end(JSON.stringify({ success: false, error: "Ошибка сервера при получении данных профиля." }));
    }
} 
else if (req.method === "POST" && pathname === "/api/change_password") {
    const cookies = cookie.parse(req.headers.cookie || '');
    const sessionId = cookies.session;
    const user = await checkSession(sessionId);

    // 1. Проверка авторизации
    if (!user) {
        res.writeHead(401);
        res.end(JSON.stringify({ success: false, error: "Неавторизованный доступ." }));
        return;
    }

    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });

    req.on('end', async () => {
        try {
            const data = JSON.parse(body);
            const { currentPassword, newPassword } = data; // Получаем пароли из тела запроса

            if (!currentPassword || !newPassword) {
                res.writeHead(400);
                res.end(JSON.stringify({ success: false, error: "Отсутствуют необходимые поля." }));
                return;
            }
            
            // 2. Вызываем логику смены пароля из auth.js
            const result = await changeUserPassword(user.id, currentPassword, newPassword);

            if (result.success) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
            } else {
                // Возвращаем ошибку, например, "Неверный текущий пароль"
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: result.error }));
            }

        } catch (error) {
            console.error("Server error processing password change:", error);
            res.writeHead(500);
            res.end(JSON.stringify({ success: false, error: "Ошибка сервера при смене пароля." }));
        }
    });
    return;
}


else{
 // статика
   let fileToLoad = pathname.substring(1); // Удаляем ведущий '/'

     if (fileToLoad === "") {
        fileToLoad = "index.html"; 
    } 
    const filePath = path.join(__dirname, "public", fileToLoad);
    const ext = path.extname(filePath);

    if (fs.existsSync(filePath)) {
        res.writeHead(200, { "Content-Type": mimeTypes[ext] || "text/plain" });
        fs.createReadStream(filePath).pipe(res);
        return;
    } else {
        res.writeHead(404);
        res.end("Not Found");
        return;
    }
}

}).listen(3000, () => console.log("Server running on http://localhost:3000"));
