class GetDetailThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(payload) {
    const { threadId } = payload;
    const {
      id, title, body, date, username, comments,
    } = await this._threadRepository.getDetailThread(threadId);

    const newComments = this.updateDeletedCommentAndReplyContent(comments);
    const result = {
      id, title, body, date, username, comments: newComments,
    };

    return result;
  }

  updateDeletedReplyContent(replies) {
    const result = replies?.map((reply) => {
      const rep = {
        ...reply,
        content: reply.deleted ? '**balasan telah dihapus**' : reply.content,
      };
      delete rep.deleted;
      return rep;
    });

    return result.sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  updateDeletedCommentAndReplyContent(comments) {
    const result = comments?.map((comment) => {
      const com = {
        ...comment,
        content: comment.deleted ? '**komentar telah dihapus**' : comment.content,
        replies: this.updateDeletedReplyContent(comment.replies),
      };
      delete com.deleted;
      return com;
    });

    // sort result based on result.date
    return result.sort((a, b) => new Date(a.date) - new Date(b.date));
  }
}

module.exports = GetDetailThreadUseCase;
