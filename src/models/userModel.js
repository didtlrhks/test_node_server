const db = require('../config/database');

class User {
  static async findAll() {
    const [rows] = await db.query('SELECT * FROM users');
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0];
  }

  static async create(userData) {
    const { username, email, password } = userData;
    const [result] = await db.query(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, password]
    );
    return result.insertId;
  }

  static async update(id, userData) {
    const { username, email } = userData;
    const [result] = await db.query(
      'UPDATE users SET username = ?, email = ? WHERE id = ?',
      [username, email, id]
    );
    return result.affectedRows;
  }

  static async delete(id) {
    const [result] = await db.query('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows;
  }
}

module.exports = User; 