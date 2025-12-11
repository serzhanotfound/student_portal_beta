const crypto = require("crypto");
const pool = require('./db');
module.exports = { register, login, checkSession, logout, 
    saveSchedule, getSchedule, getStudentCourses, getTeacherCourses,  
    getAllCourses, saveCourse, deleteCourse, getUserProfileData, 
    changeUserPassword, updateAvatarPath, saveAdminMessage, getAdminMessages, 
    viewAndMarkMessageRead, deleteMessage, getStudentResultsOverview, getTeacherCoursesAndGroups, 
    getAssessmentTableData, saveAssessments, createDefaultAssessmentSchema,  
    createDefaultAssessmentSchema, getStudentAssessmentDetails, getAllCoursesAndGroupsForAdmin, getAcademicEvents, saveAcademicEvent, deleteAcademicEvent };

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
    const expires = new Date(Date.now() + 1000 * 60 * 60);

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


async function saveSchedule(teacherId, groupName, dayOfWeek, lessons) {
    let connection;
    try{
        connection = await pool.getConnection();
        await connection.beginTransaction();

        await connection.query(
            'DELETE FROM schedule WHERE group_name = ? AND day_of_week = ?',
            [groupName, dayOfWeek]
        );

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
                [values]
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
        
        if (dayOfWeek) {
            query += ` AND s.day_of_week = ?`;
            params.push(dayOfWeek);
        }

        query += `
             ORDER BY 
                FIELD(s.day_of_week, 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница'),
                s.time_slot
             `;

        const [rows] = await pool.query(query, params);

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
        const [rows] = await pool.query(query, [groupName, semester]);
        return rows;
    } catch (error) {
        throw error;
    }
}

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


async function saveCourse(courseData) {
    const { id, name, description, credits, teacher_id, group_name, semester } = courseData;

    try {
        if (id) {
            const query = `
                UPDATE courses 
                SET name = ?, description = ?, credits = ?, teacher_id = ?, group_name = ?, semester = ?
                WHERE id = ?;
            `;
            await pool.query(query, [name, description, credits, teacher_id, group_name, semester, id]);
            return { success: true };

        } else {
            const insertCourseQuery = `
                INSERT INTO courses (name, description, credits, teacher_id, group_name, semester) 
                VALUES (?, ?, ?, ?, ?, ?);
            `;
            
            const [result] = await pool.query(insertCourseQuery, [name, description, credits, teacher_id, group_name, semester]);
            
            const newCourseId = result.insertId;
            
            if (newCourseId) {
                await createDefaultAssessmentSchema(newCourseId);
            }
            
            return { success: true };
        }

    } catch (error) {
        console.error("DB Error in saveCourse:", error);
        return { success: false, error: error.message }; 
    }
}

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
        const [rows] = await pool.query(query, [userId]); 
        
        return rows[0] || null; 
    } catch (error) {
        console.error("Error fetching user profile data:", error);
        throw error;
    }
}

async function changeUserPassword(userId, currentPassword, newPassword) {
    try {
        
        const hashedCurrentPass = hashPassword(currentPassword);
        
        
        const [rows] = await pool.query(
            "SELECT id FROM users WHERE id = ? AND password = ?", 
            [userId, hashedCurrentPass]
        );

        if (rows.length === 0) {
            
            return { success: false, error: "Неверный текущий пароль." };
        }

        
        const hashedNewPass = hashPassword(newPassword);
        
       
        const updateQuery = "UPDATE users SET password = ? WHERE id = ?";
        await pool.query(updateQuery, [hashedNewPass, userId]);

        return { success: true };

    } catch (error) {
        console.error("Database error during password change:", error);
        
        throw new Error("Ошибка сервера при обновлении пароля.");
    }
}

async function updateAvatarPath(userId, avatarPath) {
    const query = 'UPDATE users SET avatar_path = ? WHERE id = ?';
    try {
        const [result] = await pool.execute(query, [avatarPath, userId]);
        
        
        if (result.affectedRows > 0) {
            return { success: true };
        } else {
            return { success: false, error: "Пользователь не найден." };
        }
    } catch (error) {
        console.error("Database error updating avatar path:", error);
        
        return { success: false, error: "Ошибка при выполнении запроса к БД." };
    }
}


async function saveAdminMessage(userId, subject, message) {
    const query = `
        INSERT INTO admin_messages (user_id, subject, message_text)
        VALUES (?, ?, ?);
    `;
    try {
        const [result] = await pool.execute(query, [userId, subject, message]); 
        return result.affectedRows === 1; 
    } catch (error) {
        console.error("Database error saving admin message:", error);
        throw error; 
    }
}


async function getAdminMessages() {
    try {
        const query = `
            SELECT 
                m.id, 
                m.subject, 
                m.message_text,
                m.is_read, 
                m.created_at,
                u.username
            FROM 
                admin_messages m
            JOIN 
                users u ON m.user_id = u.id
            ORDER BY 
                m.created_at DESC;
        `;
        const [rows] = await pool.query(query);
        return rows.map(row => ({
            id: row.id,
            subject: row.subject,
            message: row.message_text,
            is_read: row.is_read,
            created_at: row.created_at,
            user_name: row.username
        }));
        
    } catch (error) {
        console.error("DB Error in getAdminMessages:", error);
        throw new Error("Failed to fetch messages from database."); 
    }
}

async function viewAndMarkMessageRead(messageId) {
    try {
        const getQuery = `
            SELECT 
                m.id, 
                m.subject, 
                m.message_text, 
                m.created_at,
                u.username 
            FROM 
                admin_messages m
            JOIN 
                users u ON m.user_id = u.id
            WHERE
                m.id = ?;
        `;
        const [rows] = await pool.query(getQuery, [messageId]);
        
        if (rows.length === 0) {
            return { success: false, error: "Сообщение не найдено." };
        }

        const markReadQuery = `
            UPDATE admin_messages
            SET is_read = 1
            WHERE id = ? AND is_read = 0;
        `;
        await pool.query(markReadQuery, [messageId]);

        const message = rows[0];
        message.message = message.message_text;
        delete message.message_text;

        return { success: true, message: message }; 

    } catch (error) {
        console.error("DB Error in viewAndMarkMessageRead:", error);
        throw error;
    }
}

async function deleteMessage(messageId) {
    try {
        const query = `
            DELETE FROM admin_messages
            WHERE id = ?;
        `;
        const [result] = await pool.query(query, [messageId]);
        
        if (result.affectedRows > 0) {
            return { success: true };
        } else {
            return { success: false, error: "Сообщение не найдено." };
        }
    } catch (error) {
        console.error("DB Error in deleteMessage:", error);
        throw error;
    }
}


async function getStudentResultsOverview(userId, groupName, semesterCode = null) {
    if (!userId || !groupName) return [];

    try {
        const query = `
            SELECT 
                c.id AS course_id,              -- ID курса (нужен для кликабельности)
                c.name AS course_name,          -- Название предмета (верх блока)
                u.username AS teacher_name,     -- Имя преподавателя (низ блока)
                sg.final_score,                 -- Текущий рейтинг
                sg.letter_grade                 -- Буквенная оценка (центр блока)
            FROM 
                courses c
            JOIN 
                users u ON c.teacher_id = u.id  -- 1. Получаем имя преподавателя
            LEFT JOIN 
                student_grades sg ON c.id = sg.course_id AND sg.user_id = ? 
                                                -- 2. Получаем оценку конкретного студента
            WHERE 
                c.group_name = ?
                ${semesterCode ? 'AND sg.semester_code = ?' : ''} 
            ORDER BY 
                c.name;
        `;
        
        let params = [userId, groupName];
        if (semesterCode) {
            params.push(semesterCode);
        }

        const [rows] = await pool.query(query, params); 
        
        return rows.map(row => ({
            courseId: row.course_id,
            title: row.course_name,
            teacherName: row.teacher_name,
            currentRating: row.final_score !== null ? `${parseFloat(row.final_score).toFixed(2)}%` : 'Нет данных',
            letterGrade: row.letter_grade || '-'
        }));

    } catch (error) {
        console.error("DB Error in getStudentResultsOverview:", error);
        throw new Error("Failed to fetch student results from database."); 
    }
}


async function createDefaultAssessmentSchema(courseId) {
    const defaultAssessments = [];
    const maxScore = 100;

    const weeklyWeight = 1.00;
    for (let i = 1; i <= 15; i++) {

        defaultAssessments.push({
            name: `Практика, Неделя ${i}`,
            category: 'Недельные',
            subcategory: 'Практика', 
            weight: weeklyWeight,
            max_score: maxScore
        });

        defaultAssessments.push({
            name: `Лекция, Неделя ${i}`,
            category: 'Недельные',
            subcategory: 'Лекции', 
            weight: weeklyWeight,
            max_score: maxScore
        });
    }


    const srspWeight = 5.00; // 5%
    for (let i = 1; i <= 4; i++) {
        defaultAssessments.push({
            name: `СРСП ${i}`,
            category: 'СРСП',
            subcategory: 'СРСП',
            weight: srspWeight,
            max_score: maxScore
        });
    }


    defaultAssessments.push({ name: '1-РК', category: 'Итоговые', subcategory: '1-РК', weight: 20.00, max_score: maxScore });
    defaultAssessments.push({ name: '2-РК', category: 'Итоговые', subcategory: '2-РК', weight: 20.00, max_score: maxScore });
    defaultAssessments.push({ name: 'Сессия', category: 'Итоговые', subcategory: 'Сессия', weight: 10.00, max_score: maxScore });

    const insertQuery = `
        INSERT INTO assessment_types 
        (course_id, assessment_name, category, subcategory, weight, max_score) 
        VALUES 
        (?, ?, ?, ?, ?, ?)
    `;

    try {
        await Promise.all(defaultAssessments.map(async (item) => {
            await pool.query(insertQuery, [
                courseId,
                item.name,
                item.category,
                item.subcategory,
                item.weight,
                item.max_score
            ]);
        }));
        return { success: true };
    } catch (error) {
        console.error(`DB Error in createDefaultAssessmentSchema for course ${courseId}:`, error);
        throw error;
    }
}


async function getTeacherCoursesAndGroups(teacherId) {
    try {
        const query = `
            SELECT 
                id AS course_id, 
                name AS course_name, 
                group_name
            FROM 
                courses
            WHERE 
                teacher_id = ?
            ORDER BY 
                course_name, group_name;
        `;
        
        const [rows] = await pool.query(query, [teacherId]);

        const coursesMap = {};
        rows.forEach(row => {
            if (!coursesMap[row.course_id]) {
                coursesMap[row.course_id] = {
                    course_id: row.course_id,
                    course_name: row.course_name,
                    groups: new Set()
                };
            }
            if (row.group_name) {
                coursesMap[row.course_id].groups.add(row.group_name);
            }
        });
        const result = Object.values(coursesMap).map(course => ({
            ...course,
            groups: Array.from(course.groups)
        }));

        return { success: true, data: result };

    } catch (error) {
        console.error("DB Error in getTeacherCoursesAndGroups:", error);
        return { success: false, error: "Ошибка базы данных при получении курсов преподавателя." };
    }
}

async function getAssessmentTableData(courseId, groupName) {
    try {
        const studentsQuery = `
            SELECT 
                id AS student_id, 
                full_name,
                username
            FROM 
                users 
            WHERE 
                role = 'student' AND group_name = ?
            ORDER BY 
                full_name;
        `;
        const [students] = await pool.query(studentsQuery, [groupName]);

        const assessmentsQuery = `
            SELECT 
                id, 
                assessment_name, 
                category, 
                subcategory 
            FROM 
                assessment_types 
            WHERE 
                course_id = ?
            ORDER BY 
                category, subcategory, id;
        `;
        const [assessments] = await pool.query(assessmentsQuery, [courseId]);

        const gradesQuery = `
            SELECT 
                student_id, 
                assessment_type_id, 
                score 
            FROM 
                student_assessments 
            WHERE 
                course_id = ? AND student_id IN (?)
            ;
        `;
        const studentIds = students.map(s => s.student_id);
        const [gradesRows] = await pool.query(gradesQuery, [courseId, studentIds]);

        const gradesMap = {};
        gradesRows.forEach(row => {
            const studentId = row.student_id;
            if (!gradesMap[studentId]) {
                gradesMap[studentId] = {};
            }
            gradesMap[studentId][row.assessment_type_id] = row.score;
        });

        return { 
            success: true, 
            data: { 
                students: students, 
                assessments: assessments, 
                grades: gradesMap 
            } 
        };

    } catch (error) {
        console.error("DB Error in getAssessmentTableData:", error);
        return { success: false, error: "Ошибка БД при загрузке данных для оценок." };
    }
}


async function saveAssessments(assessments) {
    if (!assessments || assessments.length === 0) {
        return { success: false, error: "Нет данных для сохранения." };
    }

    try {
        const upsertQuery = `
            INSERT INTO student_assessments 
            (student_id, assessment_type_id, course_id, score)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
            score = VALUES(score),
            date_recorded = CURRENT_TIMESTAMP;
        `;

        await Promise.all(assessments.map(async (item) => {
            await pool.query(upsertQuery, [
                item.student_id,
                item.assessment_type_id,
                item.course_id,
                item.score
            ]);
        }));

        const uniqueUpdates = new Set();
        assessments.forEach(item => {
            uniqueUpdates.add(`${item.student_id}-${item.course_id}`);
        });

        await Promise.all(Array.from(uniqueUpdates).map(async (pair) => {
            const [studentId, courseId] = pair.split('-').map(Number);
             
            const summary = await calculateSummaryForStudent(studentId, courseId); 
            
            await updateStudentFinalGrade(studentId, courseId, summary.finalPercent, summary.letterGrade); 
        }));
        

        return { success: true, message: `Успешно сохранено ${assessments.length} оценок и обновлено ${uniqueUpdates.size} итоговых оценок.` };

    } catch (error) {
        console.error("DB Error in saveAssessments and post-processing:", error);
        return { success: false, error: "Ошибка базы данных при сохранении оценок и/или перерасчете итоговой оценки." };
    }
}

async function getStudentAssessmentDetails(studentId, courseId) {
    try {
        const query = `
            SELECT
                at.assessment_name,
                at.category,
                at.subcategory,
                at.weight,
                at.max_score,
                sa.score  -- Балл студента (может быть NULL, если не проставлен)
            FROM
                assessment_types at
            LEFT JOIN
                student_assessments sa ON at.id = sa.assessment_type_id 
                                     AND sa.student_id = ?
            WHERE
                at.course_id = ?
            ORDER BY
                at.category, at.assessment_name;
        `;
        

        const [results] = await pool.query(query, [studentId, courseId]);
        
        if (results.length === 0) {

            return { success: true, data: [] }; 
        }

        const groupedData = {};
        results.forEach(item => {
            const category = item.category;
            if (!groupedData[category]) {
                groupedData[category] = [];
            }
            groupedData[category].push(item);
        });

        return { success: true, data: groupedData };

    } catch (error) {
        console.error("DB Error in getStudentAssessmentDetails:", error);
        return { success: false, error: "Ошибка сервера при получении детальных оценок." };
    }
}

async function getAllCoursesAndGroupsForAdmin() {
    try {
        const query = `
            SELECT 
                id, 
                name, 
                group_name 
            FROM 
                courses
            ORDER BY 
                name, group_name;
        `;
        const [rows] = await pool.query(query);

        const coursesMap = {};


        rows.forEach(row => {
            if (!coursesMap[row.id]) {
                coursesMap[row.id] = {
                    course_id: row.id,
                    course_name: row.name,
                    groups: new Set()
                };
            }
            if (row.group_name) {
                 coursesMap[row.id].groups.add(row.group_name);
            }
        });

        const result = Object.values(coursesMap).map(course => ({
            course_id: course.course_id,
            course_name: course.course_name,
            groups: Array.from(course.groups)
        }));

        return { success: true, data: result };

    } catch (error) {
        console.error("DB Error in getAllCoursesAndGroupsForAdmin:", error);
        return { success: false, error: "Ошибка сервера при получении всех курсов." };
    }
}


async function getAcademicEvents() {
    try {
        const query = `
            SELECT 
                id, 
                title, 
                start_date AS start, 
                end_date AS end, 
                color,
                description 
            FROM 
                academic_events
            ORDER BY
                start_date;
        `;
        
        
        const [events] = await pool.query(query);
        
        const formattedEvents = events.map(event => ({
            id: event.id,
            title: event.title,
            start: event.start,
            end: event.end ? event.end : null,
            color: event.color,
            description: event.description 
        }));
        
        return { success: true, data: formattedEvents };

    } catch (error) {
        console.error("DB Error in getAcademicEvents:", error);
        return { success: false, error: "Ошибка БД при загрузке событий календаря." };
    }
}

async function saveAcademicEvent(eventData) {
    const { id, title, start, end, color, description } = eventData;
    
    try {
        if (id) {
            // Режим обновления существующего события
            const query = `
                UPDATE academic_events
                SET title = ?, start_date = ?, end_date = ?, color = ?, description = ?
                WHERE id = ?;
            `;
            await pool.query(query, [title, start, end || null, color, description, id]);
            return { success: true, message: "Событие успешно обновлено." };

        } else {
            // Режим создания нового события
            const query = `
                INSERT INTO academic_events (title, start_date, end_date, color, description)
                VALUES (?, ?, ?, ?, ?);
            `;
            const [result] = await pool.query(query, [title, start, end || null, color, description]);
            
            return { success: true, message: "Событие успешно создано.", newId: result.insertId };
        }
    } catch (error) {
        console.error("DB Error in saveAcademicEvent:", error);
        return { success: false, error: "Ошибка БД при сохранении события." };
    }
}

async function deleteAcademicEvent(id) {
    try {
        await pool.query("DELETE FROM academic_events WHERE id = ?", [id]);
        return { success: true, message: "Событие удалено." };
    } catch (error) {
        console.error("DB Error in deleteAcademicEvent:", error);
        return { success: false, error: "Ошибка БД при удалении события." };
    }
}


async function calculateSummaryForStudent(studentId, courseId) {

    const query = `
        SELECT 
            at.weight,
            at.max_score,
            sa.score
        FROM 
            assessment_types at 
        LEFT JOIN 
            student_assessments sa 
            ON at.id = sa.assessment_type_id AND sa.student_id = ?
        WHERE 
            at.course_id = ?;
    `;
    

    const [assessments] = await pool.query(query, [studentId, courseId]);
    
    
    let totalEarnedWeight = 0; 
    let maxWeight = 0;         
    
    if (assessments.length === 0) {
        return { finalPercent: 0, letterGrade: '-' };
    }

    assessments.forEach(item => {
        const weight = parseFloat(item.weight) || 0;
        const maxScore = parseFloat(item.max_score) || 1; 

        if (weight > 0) {
            maxWeight += weight;
            
            if (item.score !== null) {
                const score = parseFloat(item.score) || 0;
                
                const earnedPoints = (score / maxScore) * weight;
                totalEarnedWeight += earnedPoints;
            }
        }
    });

    const finalPercent = maxWeight > 0 ? (totalEarnedWeight / maxWeight) * 100 : 0;

    const getLetterGrade = (percent) => {
        if (percent >= 90) return 'A';
        if (percent >= 80) return 'B';
        if (percent >= 70) return 'C';
        if (percent >= 60) return 'D';
        return 'F';
    };

   return {
        finalPercent: parseFloat(finalPercent.toFixed(2)), 
        letterGrade: getLetterGrade(finalPercent)
    };
}

async function updateStudentFinalGrade(studentId, courseId, finalPercent, letterGrade) {
    
    const upsertQuery = `
        INSERT INTO student_grades 
        (user_id, course_id, final_score, letter_grade)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
        final_score = VALUES(final_score),
        letter_grade = VALUES(letter_grade);
    `;
    
    await pool.query(upsertQuery, [
        studentId, 
        courseId, 
        finalPercent, 
        letterGrade
    ]);
}