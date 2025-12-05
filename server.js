const http = require("http");
const url = require("url");
const fs = require("fs");
const path = require("path");
const { Formidable } = require("formidable");
const cookie = require('cookie');
const { register, login, checkSession, logout, saveSchedule, getSchedule, getStudentCourses, getTeacherCourses, 
    getAllCourses, deleteCourse, saveCourse, getUserProfileData, changeUserPassword, updateAvatarPath, saveAdminMessage, 
    getAdminMessages, viewAndMarkMessageRead, deleteMessage, getStudentResultsOverview, getTeacherCoursesAndGroups, 
    getAssessmentTableData, saveAssessments, createDefaultAssessmentSchema, getStudentAssessmentDetails, getAllCoursesAndGroupsForAdmin, 
    getAcademicEvents, saveAcademicEvent, deleteAcademicEvent } = require("./auth");
const UPLOAD_DIR = path.join(__dirname, 'public', 'uploads', 'avatars');

const mimeTypes = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "text/javascript",
    ".png": "image/png",
    ".jpg": "image/jpeg"
};
/**
 * Асинхронно считывает и парсит тело HTTP-запроса (JSON).
 * @param {object} req - Объект запроса Node.js.
 * @returns {Promise<object>} - Распарсенное тело запроса.
 */
async function parseRequestBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        
        // 1. Сбор данных по частям
        req.on('data', chunk => {
            body += chunk.toString(); 
        });

        // 2. Парсинг после завершения сбора
        req.on('end', () => {
            if (body) {
                try {
                    // Пытаемся распарсить JSON
                    resolve(JSON.parse(body));
                } catch (error) {
                    // Если не JSON, возвращаем ошибку
                    reject(new Error('Invalid JSON in request body'));
                }
            } else {
                // Если тело пустое
                resolve({});
            }
        });

        req.on('error', err => {
            reject(err);
        });
    });
}

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

else if (req.method === "POST" && pathname === "/api/send_admin_message") {
    const cookies = cookie.parse(req.headers.cookie || '');
    const sessionId = cookies.session;
    console.log('/api/send_admin_message called; session cookie:', sessionId);
    const user = await checkSession(sessionId); 
    console.log('Session check result user:', user ? { id: user.id, username: user.username, role: user.role } : null);

    if (!user) {
        res.writeHead(401);
        return res.end(JSON.stringify({ success: false, error: "Неавторизованный доступ." }));
    }

    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', async () => {
        try {
            const { subject, message } = JSON.parse(body);
            console.log('Parsed admin message body:', { subject, message });

            if (!subject || !message) {
                res.writeHead(400);
                return res.end(JSON.stringify({ success: false, error: "Заполните тему и текст сообщения." }));
            }
            const isSaved = await saveAdminMessage(user.id, subject, message); 
            console.log('saveAdminMessage returned:', isSaved);
            
            if (isSaved) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, message: "Сообщение успешно отправлено." }));
            } else {
                res.writeHead(500);
                res.end(JSON.stringify({ success: false, error: "Не удалось сохранить сообщение в БД." }));
            }
            
        } catch (error) {
            console.error("Error processing admin message (DB/Parse):", error);
            res.writeHead(500);
            res.end(JSON.stringify({ success: false, error: "Ошибка сервера при отправке сообщения." }));
        }
    });
    return;
}

else if (req.method === "POST" && pathname === "/api/delete_message") {
    const cookies = cookie.parse(req.headers.cookie || '');
    const sessionId = cookies.session;
    const user = await checkSession(sessionId);

    // 1. ПРОВЕРКА АВТОРИЗАЦИИ И РОЛИ
    if (!user || user.role !== 'admin') { 
        res.writeHead(403, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ success: false, error: "Доступ запрещен. Только для Администратора." }));
    }

    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });

    req.on('end', async () => {
        try {
            const { id } = JSON.parse(body); // Получаем ID из тела запроса

            if (!id) {
                res.writeHead(400, { "Content-Type": "application/json" });
                return res.end(JSON.stringify({ success: false, error: "Отсутствует ID сообщения." }));
            }
            
            // 2. УДАЛЕНИЕ В БД
            const result = await deleteMessage(id); 
            
            if (result.success) {
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ success: true, message: "Сообщение успешно удалено." }));
            } else {
                res.writeHead(404, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ success: false, error: result.error }));
            }

        } catch (error) {
            console.error("Error deleting message:", error);
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: "Ошибка сервера при удалении сообщения." }));
        }
    });
    return;
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

else if (req.method === 'POST' && pathname === '/api/teacher/save_assessments') {
    const session = req.headers.cookie ? cookie.parse(req.headers.cookie).session : null;
    const user = await checkSession(session);

    if (!user || (user.role !== 'teacher' && user.role !== 'admin')) {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Доступ запрещен.' }));
        return;
    }

    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', async () => {
        try {
            const assessments = JSON.parse(body);
            
            if (!Array.isArray(assessments)) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Некорректный формат данных.' }));
                return;
            }

            const result = await saveAssessments(assessments);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(result));

        } catch (error) {
            console.error("Server error processing save assessments:", error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: "Ошибка сервера при обработке оценок." }));
        }
    });
    return;
}

else if (req.method === 'POST' && pathname === '/api/admin/calendar/save') {
    const session = req.headers.cookie ? cookie.parse(req.headers.cookie).session : null;
    const user = await checkSession(session);
    
    // 1. СТРОГАЯ ПРОВЕРКА РОЛИ: ТОЛЬКО АДМИН
    if (!user || user.role !== 'admin') {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Доступ запрещен. Требуются права Администратора.' }));
        return;
    }

    // 2. Парсинг тела запроса (предполагаем, что у вас есть функция для этого)
    let body = await parseRequestBody(req); // Используйте вашу функцию парсинга
    
    try {
        const result = await saveAcademicEvent(body); 

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));

    } catch (error) {
        console.error("Server error saving academic event:", error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Ошибка сервера при сохранении события.' }));
    }
    return;
}

else if (req.method === 'POST' && pathname === '/api/admin/calendar/delete') {
    const session = req.headers.cookie ? cookie.parse(req.headers.cookie).session : null;
    const user = await checkSession(session);

    if (!user || user.role !== 'admin') {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Доступ запрещен.' }));
        return;
    }

    let body = await parseRequestBody(req); // Используйте вашу функцию парсинга

    try {
        const result = await deleteAcademicEvent(body.id);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
    } catch (error) {
        console.error("Server error deleting academic event:", error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Ошибка сервера при удалении.' }));
    }
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

    } else if(user.role === 'teacher' || user.role === 'admin') {
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

else if (req.method === 'GET' && pathname.startsWith('/api/teacher/assessment_data/')) {
    const session = req.headers.cookie ? cookie.parse(req.headers.cookie).session : null;
    const user = await checkSession(session);
    
    // 1. Проверка авторизации
    if (!user) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Требуется авторизация.' }));
        return;
    }
    
    // ⭐ 2. Проверка роли (разрешаем Admin И Teacher)
    if (user.role !== 'teacher' && user.role !== 'admin') {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Доступ запрещен.' }));
        return;
    }

    const parts = pathname.split('/');
    // Проверьте индексы! Если маршрут /api/teacher/assessment_data/123/GroupA, то CourseID=4, GroupName=5
    const courseId = parseInt(parts[4]); 
    const groupName = parts[5] ? decodeURIComponent(parts[5]) : null; 

    if (isNaN(courseId) || !groupName) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Некорректный запрос.' }));
        return;
    }

    try {
        // Вызываем функцию БД, которая не зависит от teacherId (см. Шаг 2)
        const result = await getAssessmentTableData(courseId, groupName); 

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));

    } catch (error) {
        console.error("Server error loading assessment data:", error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Ошибка сервера при загрузке данных.' }));
    }
    return;
}

else if (req.method === 'GET' && pathname === '/api/teacher/courses') { 
    const session = req.headers.cookie ? cookie.parse(req.headers.cookie).session : null;
    const user = await checkSession(session);

    let result;
    
    // 1. Проверка авторизации
    if (!user) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Требуется авторизация.' }));
        return;
    }

    // 2. Логика для Администратора: загрузить ВСЕ курсы
    if (user.role === 'admin') {
        // Мы вызываем новую функцию, созданную на Шаге 1
        result = await getAllCoursesAndGroupsForAdmin(); 
    } 
    // 3. Логика для Преподавателя: загрузить только его курсы
    else if (user.role === 'teacher') {
        // Вызываем существующую функцию
        result = await getTeacherCoursesAndGroups(user.id);
    } 
    // 4. Доступ запрещен для всех остальных ролей (Student)
    else {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Доступ запрещен. Требуется роль Преподавателя или Администратора.' }));
        return;
    }

    // Отправка данных (единая точка выхода)
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(result));
    return;
}

else if (req.method === "GET" && pathname === "/api/get_admin_messages") {
    const cookies = cookie.parse(req.headers.cookie || '');
    const sessionId = cookies.session;
    const user = await checkSession(sessionId);

    if (!user) {
        res.writeHead(401, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, error: "Неавторизованный доступ." }));
        return;
    }

    if (user.role !== 'admin') { 
        res.writeHead(403, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, error: "Доступ запрещен. Только для Администратора." }));
        return;
    }

    try {
        const messagesData = await getAdminMessages(); 
        
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ 
            success: true, 
            messages: messagesData 
        }));
        return;

    } catch (error) {
        console.error("Error fetching admin messages:", error);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, error: "Ошибка сервера при получении сообщений." }));
        return;
    }
}

else if (req.method === "GET" && pathname === "/api/view_message") {
    const cookies = cookie.parse(req.headers.cookie || '');
    const sessionId = cookies.session;
    const user = await checkSession(sessionId);
    const messageId = parsedUrl.query.id;


    if (!user || user.role !== 'admin') { 
        res.writeHead(403, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, error: "Доступ запрещен. Только для Администратора." }));
        return;
    }

    if (!messageId) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, error: "Отсутствует ID сообщения." }));
        return;
    }

    try {
        const messageData = await viewAndMarkMessageRead(messageId); 
        
        if (messageData.success) {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(messageData));
        } else {
            res.writeHead(404, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: messageData.error || "Сообщение не найдено." }));
        }
        return;

    } catch (error) {
        console.error("Error fetching and marking message:", error);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, error: "Ошибка сервера при просмотре сообщения." }));
        return;
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

else if (req.method === 'GET' && pathname === '/api/student/results/overview') {
    const session = req.headers.cookie ? cookie.parse(req.headers.cookie).session : null;
    const user = await checkSession(session);

    if (!user || user.role !== 'student') {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Доступ запрещен.' }));
        return;
    }

    try {
        const results = await getStudentResultsOverview(user.id, user.group_name);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, data: results }));
    } catch (error) {
        console.error("Server error fetching student results overview:", error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: "Ошибка сервера при получении результатов." }));
    }
    return;
}

else if (req.method === 'GET' && pathname.startsWith('/api/student/results/details/')) {

    const cookies = cookie.parse(req.headers.cookie || '');
    const session = cookies.session;
    const user = await checkSession(session);

    console.log(`[DEBUG] Session ID: ${session}`);
    console.log('[DEBUG] User object from checkSession:', user);

    if (!user || user.role !== 'student') {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Доступ запрещен.' }));
        return;
    }

    const parts = pathname.split('/');
    const courseId = parseInt(parts[5]); 

    if (isNaN(courseId)) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Некорректный ID курса.' }));
        return;
    }

    try {
        // user.id берется из активной сессии
        const result = await getStudentAssessmentDetails(user.id, courseId);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
    } catch (error) {
        console.error("Server error fetching student assessment details:", error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: "Ошибка сервера при получении деталей оценок." }));
    }
    return;
}

else if (req.method === 'GET' && pathname === '/api/calendar/events') {
    const session = req.headers.cookie ? cookie.parse(req.headers.cookie).session : null;
    const user = await checkSession(session);

    // 1. Проверка авторизации: доступен всем авторизованным
    if (!user) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Требуется авторизация.' }));
        return;
    }

    try {
        // 2. Вызываем функцию из auth.js
        const result = await getAcademicEvents();
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));

    } catch (error) {
        console.error("Server error loading academic events:", error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Ошибка сервера при загрузке календаря.' }));
    }
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
