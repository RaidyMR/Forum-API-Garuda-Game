const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const DeleteReplyUseCase = require('../DeleteReplyUseCase');

describe('DeleteReplyUseCase', () => {
  it('should throw error if use case payload not contain needed property', async () => {
    // Arrange
    const useCasePayload = {};
    const deleteReplyUseCase = new DeleteReplyUseCase({});

    // Action & Assert
    await expect(deleteReplyUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('DELETE_REPLY_USE_CASE.NOT_CONTAIN_NEEDED_ATTRIBUTE');
  });

  it('should throw error if payload data type doesnt meet type specification', async () => {
    // Arrange
    const useCasePayload = {
      commentId: true,
      userId: 'user-1',
      replyId: 'reply-1',
      threadId: 'thread-1',
    };
    const deleteReplyUseCase = new DeleteReplyUseCase({});

    // Action & Assert
    await expect(deleteReplyUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('DELETE_REPLY_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should orchestrating the delete comment reply action correctly', async () => {
    // Arrange
    const useCasePayload = {
      commentId: 'comment-1',
      userId: 'user-1',
      replyId: 'reply-1',
      threadId: 'thread-1',
    };

    const mockReplyRepository = new ReplyRepository();
    mockReplyRepository.verifyReplyExists = jest.fn().mockImplementation(() => Promise.resolve());
    mockReplyRepository.verifyReplyOwner = jest.fn().mockImplementation(() => Promise.resolve());
    mockReplyRepository.softDeleteReply = jest.fn()
      .mockImplementation(() => Promise.resolve());

    const deleteReplyUseCase = new DeleteReplyUseCase({
      replyRepository: mockReplyRepository,
    });

    // Act
    await deleteReplyUseCase.execute(useCasePayload);

    // Assert
    expect(mockReplyRepository.verifyReplyExists)
      .toHaveBeenCalledWith(useCasePayload);
    expect(mockReplyRepository.softDeleteReply)
      .toHaveBeenCalledWith(useCasePayload);
    expect(mockReplyRepository.verifyReplyOwner)
      .toHaveBeenCalledWith(useCasePayload.replyId, useCasePayload.userId);

    expect(await deleteReplyUseCase.execute(useCasePayload))
      .toEqual({ status: 'success' });
  });
});
