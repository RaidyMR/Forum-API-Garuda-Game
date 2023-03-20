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
        console.log(newThread)
        const query = {
            text: 'INSERT INTO threads VALUES($1, $2, $3, $4) RETURNING id, title, owner',
            values: [id, title, body, userId],
        };
        
        const result = await this._pool.query(query);
        console.log(result.rows[0])
        return new AddedThread({ ...result.rows[0] });
    }
}

module.exports = ThreadRepositoryPostgres;

