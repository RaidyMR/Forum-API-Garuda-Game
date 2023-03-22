class DeleteReplyUseCase {
    constructor({ replyRepository }) {
        this._replyRepository = replyRepository;
    }

    async execute(useCasePayload) {
      this._validatePayload(useCasePayload);
      await this._replyRepository.verifyReplyExists(useCasePayload);
      await this._replyRepository.verifyReplyOwner(useCasePayload.replyId, useCasePayload.userId);
      await this._replyRepository.softDeleteReply(useCasePayload);
        return { status: 'success' };
      }
    
      _validatePayload({
        threadId, commentId, userId, replyId,
      }) {
        if (!threadId || !userId || !commentId || !replyId) {
          throw new Error('DELETE_REPLY_USE_CASE.NOT_CONTAIN_NEEDED_ATTRIBUTE');
        }
    
        if (typeof threadId !== 'string' || typeof userId !== 'string' || typeof commentId !== 'string' || typeof replyId !== 'string') {
          throw new Error('DELETE_REPLY_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
        }
      }
}

module.exports = DeleteReplyUseCase;