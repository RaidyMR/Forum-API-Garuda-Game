const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const NewThread = require('../../../Domains/threads/entities/NewThread');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');

describe('ThreadRepositoryPostgres', () => {
    beforeAll(async () => {
        await UsersTableTestHelper.addUser({});
    });

    afterEach(async () => {
        await ThreadsTableTestHelper.cleanTable();
    });
    
    afterAll(async () => {
        await UsersTableTestHelper.cleanTable();
        await pool.end();
    });

    describe('addThread function', () => {
        it('should persist add thread and return added thread correctly', async () => {
            // Arrange
            const newThread = new NewThread({
                title: 'sebuah title',
                body: 'body',
                userId: 'user-123',
              });
              const fakeIdGenerator = () => '123'; // stub!
              const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);
        
              // Action
              await threadRepositoryPostgres.addThread(newThread);
        
              // Assert
              const threads = await ThreadsTableTestHelper.findThreadsById('thread-123');
              expect(threads).toHaveLength(1);
        });

        it('should return added thread correctly', async () => {
            // Arrange
            const newThread = new NewThread({
              title: 'sebuah title',
              body: 'body',
              userId: 'user-123',
            });
            const fakeIdGenerator = () => '123'; // stub!
            const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);
      
            // Action
            const addedThread = await threadRepositoryPostgres.addThread(newThread);
      
            // Assert
            expect(addedThread).toStrictEqual(new AddedThread({
              id: 'thread-123',
              title: 'sebuah title',
              owner: 'user-123',
            }));
        });
    });

    describe('verifyThreadExists function', () => {
        it('should throw NotFoundError when thread doesn\'t exist with the given thread id', async () => {
            //arrange
            const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});
            await ThreadsTableTestHelper.cleanTable();
            await ThreadsTableTestHelper.addThread({id: 'thread-123'});

            //action and assert
            await expect(threadRepositoryPostgres.verifyThreadExists('thread-1234')).rejects.toThrowError('Thread tidak ditemukan');            
        });
    
        it('should not throw any error when thread exists', async () => {
            //arrange
            const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});
            await ThreadsTableTestHelper.addThread({id: 'thread-123'});

            //action and assert
            await expect(threadRepositoryPostgres.verifyThreadExists('thread-123')).resolves.not.toThrowError();            
             
        });
    });
});


