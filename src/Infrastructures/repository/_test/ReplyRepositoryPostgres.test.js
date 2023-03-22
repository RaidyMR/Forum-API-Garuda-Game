const { DatabaseError } = require('pg');
const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');

describe('ReplyRepositoryPostgres', () => {
  beforeAll(async () => {
    await UsersTableTestHelper.addUser({});
  });

  beforeEach(async () => {
    await ThreadsTableTestHelper.addThread({ date: new Date() });
    await CommentsTableTestHelper.addComment({});
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await RepliesTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('addReply function', () => {
    it('should persist new comment and return added comment correctly', async () => {
      // Arrange
      const newReply = {
        content: 'sebuah balasan',
        userId: 'user-123',
        commentId: 'comment-123',
        threadId: 'thread-123',
      };
      const fakeIdGenerator = () => '123'; // stub!
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await replyRepositoryPostgres.addReply(newReply);

      // Assert
      const replies = await RepliesTableTestHelper.findRepliesById('reply-123');
      expect(replies).toHaveLength(1);
    });

    it('should throw error when database constraints error', async () => {
      // Arrange
      const newReply = {
        content: 'sebuah balasan',
        userId: 'user-123',
        commentId: 'comment-123',
        threadId: 'thread-123',
      };
      const fakeIdGenerator = () => '123'; // stub!
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);
      await replyRepositoryPostgres.addReply(newReply);

      // Action
      await expect(replyRepositoryPostgres.addReply(newReply))
        .rejects
        .toThrowError(DatabaseError);
    });

    it('should return added comment correctly', async () => {
      // Arrange
      const newReply = {
        content: 'sebuah balasan',
        userId: 'user-123',
        commentId: 'comment-123',
        threadId: 'thread-123',
      };
      const fakeIdGenerator = () => '123'; // stub!
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedReply = await replyRepositoryPostgres.addReply(newReply);

      // Assert
      expect(addedReply).toStrictEqual({
        id: 'reply-123',
        content: 'sebuah balasan',
        owner: 'user-123',
      });
    });
  });

  describe('verifyReplyOwner', () => {
    it('should throw NotFoundError when reply not found', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});
      const payload = {
        replyId: 'reply-123',
        userId: 'user-123',
        threadId: 'thread-123',
      };

      // Action & Assert
      await expect(replyRepositoryPostgres.verifyReplyOwner(payload.replyId, payload.userId))
        .rejects
        .toThrowError(NotFoundError);
    });

    it('should throw AuthorizationError when reply\'s owner not match', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});
      const payload = {
        replyId: 'reply-test',
        userId: 'user-1',
        threadId: 'thread-123',
      };
      await ThreadsTableTestHelper.addThread({ id: 'thread-1', date: new Date() });
      await CommentsTableTestHelper.addComment({ id: 'comment-1', threadId: 'thread-1', userId: 'user-123' });
      await RepliesTableTestHelper.addReply({
        id: 'reply-test', commentId: 'comment-1', userId: 'user-123',
      });

      // Action & Assert
      await expect(replyRepositoryPostgres.verifyReplyOwner(payload.replyId, payload.userId))
        .rejects
        .toThrowError(AuthorizationError);

      await expect(replyRepositoryPostgres.verifyReplyOwner('reply-test', 'user-123'))
        .resolves
        .not
        .toThrow(AuthorizationError);
    });

    it('should not throw error when owner matched', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});
      const payload = {
        replyId: 'reply-test',
        userId: 'user-123',
        threadId: 'thread-123',
      };
      await ThreadsTableTestHelper.addThread({ id: 'thread-1', date: new Date() });
      await CommentsTableTestHelper.addComment({ id: 'comment-1', threadId: 'thread-1', userId: 'user-123' });
      await RepliesTableTestHelper.addReply({
        id: 'reply-test', threadId: 'thread-1', commentId: 'comment-1', userId: 'user-123',
      });

      // Action & Assert
      await expect(replyRepositoryPostgres.verifyReplyOwner(payload.replyId, payload.userId))
        .resolves
        .not
        .toThrow(AuthorizationError);
    });
  });

  describe('verifyReplyExistFunction', () => {
    it('should throw NotFoundError when thread not found', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});
      const payload = {
        commentId: 'comment-11',
        userId: 'user-123',
        threadId: 'thread-123',
      };

      // Action & Assert
      await expect(replyRepositoryPostgres.verifyReplyExists(payload))
        .rejects
        .toThrowError(NotFoundError);
    });

    it('should not throw error when comment and thread is found', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});
      const payload = {
        commentId: 'comment-1234',
        replyId: 'reply-123',
        threadId: 'thread-1234',
      };
      await ThreadsTableTestHelper.addThread({ id: 'thread-1234' });
      await CommentsTableTestHelper.addComment({ id: 'comment-1234', threadId: 'thread-1234' });
      await RepliesTableTestHelper.addReply({ threadId: 'thread-1234', commentId: 'comment-1234' });

      // Action & Assert
      await expect(replyRepositoryPostgres.verifyReplyExists(payload))
        .resolves
        .not
        .toThrow(NotFoundError);
    });
  });

  describe('softDeleteReply function', () => {
    it('should delete comment successfully', async () => {
      // Arrange
      const payload = {
        commentId: 'comment-1',
        replyId: 'reply-test',
        userId: 'user-123',
      };
      await ThreadsTableTestHelper.addThread({ id: 'thread-1', date: new Date() });
      await CommentsTableTestHelper.addComment({ id: 'comment-1', threadId: 'thread-1', userId: 'user-123' });
      await RepliesTableTestHelper.addReply({
        id: 'reply-test', commentId: 'comment-1', userId: 'user-123',
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      await expect(replyRepositoryPostgres.softDeleteReply(payload))
        .resolves
        .not
        .toThrow(NotFoundError);

      const replies = await RepliesTableTestHelper.findRepliesById('reply-test');
      expect(replies).toHaveLength(1);
      expect(replies[0].content).toEqual('sebuah balasan');
      expect(replies[0].isDelete).toEqual(true);
    });
  });
});
