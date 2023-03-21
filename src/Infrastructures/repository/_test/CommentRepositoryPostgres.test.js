const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const pool = require('../../database/postgres/pool');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const Comment = require('../../../Domains/comments/entities/Comment');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');

describe('CommentRepositoryPostgres', () => {  
  beforeAll(async () => {
      await UsersTableTestHelper.cleanTable();
      await UsersTableTestHelper.addUser({});
  });

  beforeEach(async () => {
    await ThreadsTableTestHelper.addThread({});
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await UsersTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('addComment function', () => {
    it('should persist add comment and return added comment correctly', async () => {
      //Arrange
      const newComment = {
        content: 'content',
        userId: 'user-123',
        threadId: 'thread-123',
      };
      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      //Action
      await commentRepositoryPostgres.addComment(newComment);

      //Assert
      const comments = await CommentsTableTestHelper.findCommentsById('comment-123');
      expect(comments).toHaveLength(1);
    });

    it('should return added comment correctly', async () => {
      // Arrange
      const newComment = new Comment({
        content: 'sebuah comment',
        userId: 'user-123',
        threadId: 'thread-123',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);
  
      // Action
      const addedComment = await commentRepositoryPostgres.addComment(newComment);
  
      // Assert
      expect(addedComment).toStrictEqual({
        id: 'comment-123',
        content: 'sebuah comment',
        owner: 'user-123',
      });
    });
  });

  describe('verifyCommentExistFunction', () => {
    it('should throw NotFoundError when thread not found', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentExists('thread-12', 'comment-123'))
        .rejects
        .toThrowError(NotFoundError);
    });

    it('should not throw error when comment and thread is found', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      await CommentsTableTestHelper.addComment({});

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentExists('thread-123', 'comment-123'))
        .resolves
        .not
        .toThrow(NotFoundError);
    });
  });

  describe('verifyCommentOwner function', () => {
    it('should throw not found error when comment is not found', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      await ThreadsTableTestHelper.addThread({ id: 'thread-12', date: new Date() });
      await CommentsTableTestHelper.addComment({ id: 'comment-12', threadId: 'thread-12' });

      await expect(commentRepositoryPostgres.verifyCommentOwner('comment-1', 'user-123'))
        .rejects
        .toThrowError(NotFoundError);
    });

    it('should throw authorization error when given user is not the owner of comment', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      await ThreadsTableTestHelper.addThread({ id: 'thread-12', date: new Date() });
      await CommentsTableTestHelper.addComment({ id: 'comment-12', threadId: 'thread-12' });

      await expect(commentRepositoryPostgres.verifyCommentOwner('comment-12', 'user-12'))
        .rejects
        .toThrowError(AuthorizationError);
    });

    it('should throw no error when the given user id is the owner of the given comment id', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      await ThreadsTableTestHelper.addThread({ id: 'thread-12', date: new Date() });
      await CommentsTableTestHelper.addComment({ id: 'comment-12', threadId: 'thread-12' });

      await expect(commentRepositoryPostgres.verifyCommentOwner('comment-12', 'user-123'))
        .resolves
        .not
        .toThrow(NotFoundError);

      await expect(commentRepositoryPostgres.verifyCommentOwner('comment-12', 'user-123'))
        .resolves
        .not
        .toThrow(AuthorizationError);
    });
  });

  describe('softDeleteComment function', () => {
    it('should delete comment successfully', async () => {
      // Arrange
      await ThreadsTableTestHelper.addThread({ id: 'thread-1', date: new Date() });
      await CommentsTableTestHelper.addComment({ id: 'comment-1', threadId: 'thread-1', userId: 'user-123' });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Actions
      await commentRepositoryPostgres.softDeleteComment('thread-1', 'comment-1', 'user-123');
      const comments = await CommentsTableTestHelper.findCommentsById('comment-1');

      expect(comments).toHaveLength(1);
      expect(comments[0].isDelete).toEqual(true);
    });
  });
});

