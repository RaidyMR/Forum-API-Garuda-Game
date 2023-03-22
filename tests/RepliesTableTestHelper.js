const pool = require('../src/Infrastructures/database/postgres/pool');

const RepliesTableTestHelper = {
  async cleanTable() {
    await pool.query('DELETE FROM replies WHERE 1=1');
  },

  async addReply({
    id = 'reply-123', content = 'sebuah balasan', userId = 'user-123', commentId = 'comment-123', threadId = 'thread-123', isDelete = false, date = new Date(),
  }) {
    const query = {
      text: 'INSERT INTO replies(id, content, owner, "comment_id", "thread_id", "isDelete", date) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id, content, owner',
      values: [id, content, userId, commentId, threadId, isDelete, date],
    };

    await pool.query(query);
  },

  async findRepliesById(replyId) {
    const query = {
      text: 'SELECT * FROM replies WHERE id = $1',
      values: [replyId],
    };

    const { rows } = await pool.query(query);

    return rows;
  },

  async softDeleteReplyById(replyId) {
    const query = {
      text: 'UPDATE replies SET "isDelete" = true WHERE id = $1',
      values: [replyId],
    };

    await pool.query(query);
  },
};

module.exports = RepliesTableTestHelper;