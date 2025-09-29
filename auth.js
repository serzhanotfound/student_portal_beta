const crypto = require("crypto");
const pool = require('./db');

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
        "SELECT u.id, u.username, u.role FROM sessions s JOIN users u ON s.User_id=u.id WHERE s.session_id=? AND s.expires_at > NOW()",
        [sessionId]
    );
    return rows[0] || null;
}
module.exports = { register, login, checkSession };