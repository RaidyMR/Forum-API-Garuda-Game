/* istanbul ignore file */

const pool = require('../src/Infrastructures/database/postgres/pool');

const ThreadsTableTestHelper = {
  async cleanTable() {
    await pool.query('DELETE FROM threads where 1=1');
  },

  async findThreadsById(threadId) {
    const query = {
      text: 'SELECT * FROM threads WHERE id = $1',
      values: [threadId],
    };

    const result = await pool.query(query);

    return result.rows;
  },

  async addThread({
    id = 'thread-123', title = 'sebuah title', body = 'sebuah body', userId = 'user-123',
  }) {
    const query = {
      text: 'INSERT INTO threads(id, title, body, owner) VALUES($1, $2, $3, $4) RETURNING id, title, owner',
      values: [id, title, body, userId],
    };

    await pool.query(query);
  },
};
module.exports = ThreadsTableTestHelper;