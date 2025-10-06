const crypto = require("crypto");
const pool = require('./db');
module.exports = { register, login, checkSession, logout, saveSchedule, getSchedule };

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