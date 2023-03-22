const ReplyRepository = require('../../Domains/replies/ReplyRepository');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReply(reply) {
    const {
      threadId, commentId, userId, content,
    } = reply;

    const id = `reply-${this._idGenerator()}`;
    const isDelete = false;
    const date = new Date().toISOString();

    const query = {
      text: 'INSERT INTO replies(id, content, owner, "comment_id", "thread_id", "isDelete", date) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id, content, owner',
      values: [id, content, userId, commentId, threadId, isDelete, date],
    };
    const { rows } = await this._pool.query(query);

    return rows[0];
  }

  async softDeleteReply(deleteReply) {
    const {
      replyId, userId, commentId,
    } = deleteReply;

    const query = {
      text: 'UPDATE replies SET "isDelete" = true WHERE id = $1 AND owner = $2 AND "comment_id" = $3',
      values: [replyId, userId, commentId],
    };

    await this._pool.query(query);
  }

  async verifyReplyExists(payload) {
    const { commentId, replyId, threadId } = payload;
    const query = {
      text: 'SELECT id FROM replies WHERE id = $1 AND "comment_id" = $2 AND "thread_id" = $3',
      values: [replyId, commentId, threadId],
    };

    const { rowCount } = await this._pool.query(query);

    if (!rowCount) {
      throw new NotFoundError('Data reply tidak ditemukan');
    }
  }

  async verifyReplyOwner(replyId, userId) {
    const query = {
      text: 'SELECT owner FROM replies WHERE id = $1',
      values: [replyId],
    };

    const { rows } = await this._pool.query(query);

    if (!rows.length) {
      throw new NotFoundError('Balasan tidak ditemukan');
    }

    const trueOwner = rows[0].owner;

    if (trueOwner !== userId) {
      throw new AuthorizationError('Anda tidak berhak menghapus balasan ini');
    }
  }
}

module.exports = ReplyRepositoryPostgres;
