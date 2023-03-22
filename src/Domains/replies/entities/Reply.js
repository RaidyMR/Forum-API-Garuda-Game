class Reply {
  constructor(payload) {
    this._verifyPayload(payload);
    const {
      content, userId, commentId, threadId,
    } = payload;
    this.content = content;
    this.userId = userId;
    this.commentId = commentId;
    this.threadId = threadId;
  }

  _verifyPayload(payload) {
    const {
      content, userId, commentId, threadId,
    } = payload;
    if (!content || !userId || !commentId || !threadId) {
      throw new Error('REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
    }
    if (typeof content !== 'string' || typeof userId !== 'string' || typeof commentId !== 'string' || typeof threadId !== 'string') {
      throw new Error('REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = Reply;
