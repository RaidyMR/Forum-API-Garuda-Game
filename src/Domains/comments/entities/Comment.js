class Comment {
  constructor(payload) {
    this._verifyPayload(payload);
    const { content, userId, threadId } = payload;
    this.content = content;
    this.userId = userId;
    this.threadId = threadId;
  }

  _verifyPayload(payload) {
    const { content, userId, threadId } = payload;
    if (!content || !userId || !threadId) {
      throw new Error('COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }
    if (typeof content !== 'string' || typeof userId !== 'string' || typeof threadId !== 'string') {
      throw new Error('COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = Comment;
