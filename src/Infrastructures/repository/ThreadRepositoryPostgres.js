const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AddedThread = require('../../Domains/threads/entities/AddedThread');
const ThreadRepository = require('../../Domains/threads/ThreadRepository');

class ThreadRepositoryPostgres extends ThreadRepository {
    constructor(pool, idGenerator) {
        super();
        this._pool = pool;
        this._idGenerator = idGenerator;
    }

    async addThread(newThread) {
        const { title, body, userId } = newThread;
        const id = `thread-${this._idGenerator()}`;
        const date = new Date().toISOString();

        const query = {
            text: 'INSERT INTO threads VALUES($1, $2, $3, $4, $5) RETURNING id, title, owner',
            values: [id, title, body, userId, date],
        };
        
        const result = await this._pool.query(query);
        return new AddedThread({ ...result.rows[0] });
    }

    async verifyThreadExists(threadId) {
        const query = {
          text: 'SELECT id FROM threads WHERE id = $1',
          values: [threadId],
        };
    
        const { rowCount } = await this._pool.query(query);
    
        if (!rowCount) {
          throw new NotFoundError('Thread tidak ditemukan');
        }
    }

    async getDetailThread(threadId) {
        const query = {
            text: `
            SELECT t.id AS tid, t.title, t.body, t.date AS tdate, us.username, cm.*, rp.*
            FROM threads t
            LEFT JOIN  (SELECT c.id, u.username AS cname, c.date, c.content, c."thread_id", c."isDelete" AS cdeleted
                        FROM comments c, users u
                        WHERE c."owner" = u.id
                        ORDER BY c.date ASC) cm ON t.id = cm."thread_id"
            LEFT JOIN (SELECT r.id AS rid, ur.username AS rname, r.date AS rdate, r.content AS rcontent, r."isDelete" AS rdeleted, r."comment_id"
                        FROM replies r, users ur
                        WHERE r.owner = ur.id
                        ORDER BY r.date ASC) rp ON rp."comment_id" = cm.id
            LEFT JOIN users us
            ON us.id = t.owner
            WHERE t.id = $1
            `,
            values: [threadId],
        };

        const result = await this._pool.query(query);
        
        if(!result.rows.length) {
            throw new NotFoundError('Thread tidak ditemukan');
        }        

        const {
            tid: id, title, body, tdate: date, username,
          } = result.rows[0];
      
          const replies = result.rows.reduce((group, item) => {
            const {
              id: commentId, rid, rname, rdate, rcontent, rdeleted,
            } = item;
            group[commentId] = group[commentId] ?? [];
            if (rid) {
              group[commentId].push({
                id: rid, username: rname, date: rdate, content: rcontent, deleted: rdeleted,
              });
            }
            return group;
          }, {});
      
          let comments = result.rows.map((item) => {
            if (item.id) {
              return ({
                id: item.id,
                username: item.cname,
                date: item.date,
                content: item.content,
                deleted: item.cdeleted,
                replies: replies[item.id],
              });
            }
            return {};
          });
      
          comments = comments.length === 1 && Object.keys(comments[0]).length === 0 ? [] : comments;
      
          comments = comments.filter((value, index, self) => index === self.findIndex((t) => (
            t.id === value.id
          )));
      
          return {
            id, title, body, date, username, comments,
        };
    }
}

module.exports = ThreadRepositoryPostgres;

