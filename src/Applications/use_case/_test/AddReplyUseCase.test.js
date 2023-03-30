const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const AddReplyUseCase = require('../AddReplyUseCase');

describe('AddReplyUseCase', () => {
  it('should orchestrating the add comment reply action correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      userId: 'user-1',
      content: 'ini balasan',
    };

    const expectedAddedReply = {
      id: 'reply-123',
      content: useCasePayload.content,
      owner: useCasePayload.userId,
    };

    const mockReplyRepository = new ReplyRepository();
    const mockCommentRepository = new CommentRepository();

    mockReplyRepository.addReply = jest.fn()
      .mockImplementation(() => Promise.resolve({
        id: 'reply-123',
        content: useCasePayload.content,
        owner: useCasePayload.userId,
      }));

    mockCommentRepository.verifyCommentExists = jest
      .fn()
      .mockImplementation(() => Promise.resolve({
        id: 'comment-123',
      }));

    const getReplyUseCase = new AddReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    const addedReply = await getReplyUseCase
      .execute(useCasePayload);

    expect(addedReply).toStrictEqual(expectedAddedReply);
    expect(mockReplyRepository.addReply).toBeCalledWith(useCasePayload);
    expect(mockCommentRepository.verifyCommentExists)
      .toBeCalledWith(useCasePayload.threadId, useCasePayload.commentId);
  });

  it('should throw error when new reply payload not contains needed property', async () => {
    // Arrange
    const useCasePayload = {
      commentId: 'comment-123',
      userId: 'user-1',
    };

    const useCasePayload2 = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      userId: {},
      content: 'ini balasan2',
    };

    /** creating use case instance */
    const commentReplyUseCase = new AddReplyUseCase({});

    // Action & Assert
    await expect(commentReplyUseCase.execute(useCasePayload)).rejects.toThrowError('ADD_REPLY_USE_CASE.NOT_CONTAIN_NEEDED_ATTRIBUTE');
    await expect(commentReplyUseCase.execute(useCasePayload2)).rejects.toThrowError('ADD_REPLY_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
  });
});
