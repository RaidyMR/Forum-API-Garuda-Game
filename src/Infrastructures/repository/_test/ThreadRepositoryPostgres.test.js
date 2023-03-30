const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
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
      // arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});
      await ThreadsTableTestHelper.cleanTable();
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });

      // action and assert
      await expect(threadRepositoryPostgres.verifyThreadExists('thread-1234')).rejects.toThrowError('Thread tidak ditemukan');
    });

    it('should not throw any error when thread exists', async () => {
      // arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });

      // action and assert
      await expect(threadRepositoryPostgres.verifyThreadExists('thread-123')).resolves.not.toThrowError();
    });
  });

  describe('getDetailThread function', () => {
    it('should return detail thread correctly', async () => {
      // arrange
      const date = new Date('2023-03-30T06:55:00.405Z');
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', date });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', date });
      await CommentsTableTestHelper.addComment({
        id: 'comment-456', threadId: 'thread-123', isDelete: true, date,
      });
      await RepliesTableTestHelper.addReply({
        id: 'reply-123', commentId: 'comment-123', isDelete: true, date,
      });
      const expectedDetailThread = [
        {
          tid: 'thread-123',
          title: 'sebuah title',
          body: 'sebuah body',
          tdate: '2023-03-30T13:55:00.405+07:00',
          username: 'dicoding',
          id: 'comment-123',
          cname: 'dicoding',
          date: '2023-03-30T13:55:00.405+07:00',
          content: 'sebuah comment',
          thread_id: 'thread-123',
          cdeleted: false,
          rid: 'reply-123',
          rname: 'dicoding',
          rdate: '2023-03-30T13:55:00.405+07:00',
          rcontent: 'sebuah balasan',
          rdeleted: true,
          comment_id: 'comment-123',
        },
        {
          tid: 'thread-123',
          title: 'sebuah title',
          body: 'sebuah body',
          tdate: '2023-03-30T13:55:00.405+07:00',
          username: 'dicoding',
          id: 'comment-456',
          cname: 'dicoding',
          date: '2023-03-30T13:55:00.405+07:00',
          content: 'sebuah comment',
          thread_id: 'thread-123',
          cdeleted: true,
          rid: null,
          rname: null,
          rdate: null,
          rcontent: null,
          rdeleted: null,
          comment_id: null,
        },
      ];

      // action
      const detailThread = await threadRepositoryPostgres.getDetailThread('thread-123');

      // assert
      expect(detailThread).toStrictEqual(expectedDetailThread);
    });

    it('should response 404 when thread not found', async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });

      await expect(threadRepositoryPostgres.getDetailThread('thread-1234'))
        .rejects
        .toThrowError(NotFoundError);
    });
  });
});
