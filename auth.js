const crypto = require("crypto");
const pool = require('./db');
module.exports = { register, login, checkSession, logout, 
    saveSchedule, getSchedule, getStudentCourses, getTeacherCourses,  
    getAllCourses, saveCourse, deleteCourse, getUserProfileData, changeUserPassword, updateAvatarPath};

function hashPassword(password) {
    return crypto.createHash("sha256").update(password).digest("hex");
}

function generateSessionId() {
    return crypto.randomBytes(16).toString("hex");
}

async function register(username, password, role) {
    const hashed = hashPassword(password);
    try {
        const [rows] = await pool.query(
            "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
            [username, hashed, role]
        );
        return {success: true};
    } catch (err) {
        return {success : false, error: err.message};
    }
}

async function login(username, password, res) {
    const hashed = hashPassword(password);
    const [rows] = await pool.query("SELECT * FROM users WHERE username=? AND password=?", [username, hashed]);

    if (rows.length === 0) return {success: false, error: "Invalid credentials" };

    const user = rows[0];
    const sessionId = generateSessionId();
    const expires = new Date(Date.now() + 1000 * 60 * 60); //1 hour

    await pool.query("INSERT INTO sessions (user_id, session_id, expires_at) VALUES (?, ?, ?)",
        [user.id, sessionId, expires]);

    res.setHeader("Set-Cookie", `session=${sessionId}; HttpOnly; Path=/; Max-Age=3600`);
    return {success: true, user: {id: user.id, role: user.role} };
}

async function checkSession(sessionId) {
    if (!sessionId) return null;
    const [rows] = await pool.query(
        "SELECT u.id, u.username, u.role, u.group_name FROM sessions s JOIN users u ON s.User_id=u.id WHERE s.session_id=? AND s.expires_at > NOW()",
        [sessionId]
    );
    return rows[0] || null;
}

async function logout(sessionId, res) {
    if (!sessionId) {

        res.setHeader('Set-Cookie', 'session=; HttpOnly; Path=/; Max-Age=0');
        return true;
    }
    
    try {
        await pool.query('DELETE FROM sessions WHERE session_id = ?', [sessionId]);

        res.setHeader('Set-Cookie', 'session=; HttpOnly; Path=/; Max-Age=0');
        
        return true;
    } catch (error) {
        console.error("Error during logout:", error);
        return false;
    }
};

/**
 * Сохраняет (или перезаписывает) расписание для конкретного учителя, группы и дня.
 * @param {number} teacherId - ID учителя, который создает расписание.
 * @param {string} groupName - Название группы (Логистика, Менеджмент и т.д.).
 * @param {string} dayOfWeek - День недели (Понедельник, Вторник и т.д.).
 * @param {Array<Object>} lessons - Массив объектов уроков: [{time_slot, course, classroom}, ...]
 * @returns {Object} Результат операции.
 */

async function saveSchedule(teacherId, groupName, dayOfWeek, lessons) {
    let connection;
    try{
        connection = await pool.getConnection();
        await connection.beginTransaction(); //Начинаем транзакцию для безопасности

        // УДАЛЯЕМ старые записи для этой комбинаций ГРУППА + ДЕНЬ
        await connection.query(
            'DELETE FROM schedule WHERE group_name = ? AND day_of_week = ?',
            [groupName, dayOfWeek]
        );

        // ВСТАВЛЯЕМ новые записи
        if (lessons && lessons.length > 0) {
            
            const values = lessons.map(lesson => [
                teacherId,
                groupName,
                dayOfWeek,
                lesson.time_slot,
                lesson.course,
                lesson.classroom
            ]);

            await connection.query(
                'INSERT INTO schedule (teacher_id, group_name, day_of_week, time_slot, course, classroom) VALUES ?',
                [values] // MySQL автоматом обрабатывает массив массивов для ВАЛЮС
            );
        }
        
        await connection.commit(); 
        return { success: true };
    
    } catch (error) {
        if (connection) {
            await connection.rollback(); 
        }
        console.error("Error saving schedule:", error);
        return { success: false, error: "Ошибка сохранения расписания в базе данных."};
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

/* Получает расписание для конкретной группы И ДНЯ НЕДЕЛИ.
 * @param {string} groupName - Название группы.
 * @param {string} [dayOfWeek] - День недели (опционально, для учителя).
 * @returns {Array<Object> | null} Массив объектов расписания или null при ошибке.
 **/
async function getSchedule(groupName, dayOfWeek = null) {
    if (!groupName) return [];
        try {
            let query = `
            SELECT 
                s.*, 
                u.username AS teacher_name 
            FROM 
                schedule s
            JOIN 
                users u ON s.teacher_id = u.id 
            WHERE 
                s.group_name = ?
        `;
         let params = [groupName];
        
        // ДОБАВЛЯЕМ ФИЛЬТР ПО ДНЮ, ЕСЛИ ОН ПЕРЕДАН
        if (dayOfWeek) {
            query += ` AND s.day_of_week = ?`;
            params.push(dayOfWeek);
        }

        query += `
             ORDER BY 
                FIELD(s.day_of_week, 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница'),
                s.time_slot
             `;

        const [rows] = await pool.query(query, params); // <-- ИСПОЛЬЗУЕМ НОВЫЙ МАССИВ ПАРАМЕТРОВ

     return rows;
    } catch (error) {
        console.error("Error fetching schedule:", error);
        return null;
    }
}

async function getStudentCourses(groupName, semester) { 
    if (!groupName || !semester) return [];

    try {
        const query = `
            SELECT DISTINCT
                c.name AS course_name,
                u.username AS teacher_name,
                c.credits,
                c.description
            FROM 
                courses c
            JOIN 
                users u ON c.teacher_id = u.id 
            WHERE 
                c.group_name = ? AND c.semester = ?; 
        `;
        const [rows] = await pool.query(query, [groupName, semester]); // Используем оба параметра
        return rows;
    } catch (error) {
        throw error;
    }
}

// Функция для получения курсов, которые преподает учитель
async function getTeacherCourses(teacherId) {
    try {
        const query = `
            SELECT 
                c.name AS course_name,
                c.credits,
                c.description,
                c.group_name,          
                c.semester
            FROM 
                courses c
            WHERE 
                c.teacher_id = ?
            ORDER BY c.group_name, c.semester;
        `;
        const [rows] = await pool.query(query, [teacherId]);
        return rows;
    } catch (error) {
        throw error;
    }
}

// Функция для получения ВСЕХ курсов (для Администратора)
async function getAllCourses() {
    try {
        const query = `
            SELECT 
                c.id,
                c.name,
                c.description,
                c.credits,
                c.teacher_id
            FROM 
                courses c
            ORDER BY c.name;
        `;
        const [rows] = await pool.query(query);
        return rows;
    } catch (error) {
        console.error("Error fetching all courses:", error);
        throw error;
    }
}

// Функция для сохранения (добавления/обновления) курса
async function saveCourse(id, name, description, credits, teacher_id, group_name, semester) { 
    try {
        if (id) {
            const query = `
                UPDATE courses 
                SET name = ?, description = ?, credits = ?, teacher_id = ?, group_name = ?, semester = ? 
                WHERE id = ?;
            `;
            // Обновите массив параметров
            await pool.query(query, [name, description, credits, teacher_id, group_name, semester, id]);
        } else {
            // ДОБАВЛЕНИЕ НОВОГО
            const query = `
                INSERT INTO courses (name, description, credits, teacher_id, group_name, semester)
                VALUES (?, ?, ?, ?, ?, ?);
            `;
            // Обновите массив параметров
            await pool.query(query, [name, description, credits, teacher_id, group_name, semester]);
        }
        return { success: true };
    } catch (error) {
        console.error("Error saving course:", error);
        return { success: false, error: "Ошибка базы данных при сохранении курса." };
    }
}

// Функция для удаления курса
async function deleteCourse(id) {
    try {
        const query = `DELETE FROM courses WHERE id = ?;`;
        await pool.query(query, [id]);
        return { success: true };
    } catch (error) {
        console.error("Error deleting course:", error);
        return { success: false, error: "Ошибка базы данных при удалении курса." };
    }
}

// STUDENT PROFILE 

// Функция для получения всех данных профиля пользователя (для студента и преподавателя)
// Функция для получения всех данных профиля пользователя (для студента и преподавателя)
async function getUserProfileData(userId) {
    try {
        const query = `
            SELECT 
                id, 
                username, 
                role, 
                group_name, 
                full_name,          
                major,              
                entrance_year,
                avatar_path       
            FROM 
                users 
            WHERE 
                id = ?;
        `;
        // ✅ Комментарии на кириллице лучше оставлять снаружи, в JS-коде, а не в самой SQL-строке
        const [rows] = await pool.query(query, [userId]); 
        
        return rows[0] || null; 
    } catch (error) {
        console.error("Error fetching user profile data:", error);
        throw error;
    }
}

// ... (После функции getUserProfileData)

/**
 * Меняет пароль пользователя, используя существующую схему SHA256.
 * @param {number} userId - ID пользователя.
 * @param {string} currentPassword - Текущий (старый) пароль.
 * @param {string} newPassword - Новый пароль.
 * @returns {Object} Результат операции.
 */
async function changeUserPassword(userId, currentPassword, newPassword) {
    try {
        // 1. Хешируем текущий пароль, чтобы сравнить его с хешем в БД
        const hashedCurrentPass = hashPassword(currentPassword);
        
        // 2. Ищем пользователя по ID и текущему хешу
        const [rows] = await pool.query(
            "SELECT id FROM users WHERE id = ? AND password = ?", 
            [userId, hashedCurrentPass]
        );

        if (rows.length === 0) {
            // Пользователь не найден, либо текущий пароль неверен
            return { success: false, error: "Неверный текущий пароль." };
        }

        // 3. Хешируем новый пароль
        const hashedNewPass = hashPassword(newPassword);
        
        // 4. Обновляем пароль в БД
        const updateQuery = "UPDATE users SET password = ? WHERE id = ?";
        await pool.query(updateQuery, [hashedNewPass, userId]);

        return { success: true };

    } catch (error) {
        console.error("Database error during password change:", error);
        // Не раскрываем пользователю детали ошибки БД
        throw new Error("Ошибка сервера при обновлении пароля.");
    }
}

async function updateAvatarPath(userId, avatarPath) {
    const query = 'UPDATE users SET avatar_path = ? WHERE id = ?';
    try {
        const [result] = await pool.execute(query, [avatarPath, userId]);
        
        // ❗ Теперь возвращаем объект:
        if (result.affectedRows > 0) {
            return { success: true };
        } else {
            return { success: false, error: "Пользователь не найден." };
        }
    } catch (error) {
        console.error("Database error updating avatar path:", error);
        // ❗ Возвращаем объект ошибки
        return { success: false, error: "Ошибка при выполнении запроса к БД." };
    }
}