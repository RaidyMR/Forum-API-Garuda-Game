const Comment = require('../../Domains/comments/entities/Comment');

class AddCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload, userId) {
    const addComment = new Comment({ ...useCasePayload, userId });

    await this._threadRepository.verifyThreadExists(addComment.threadId);

    const result = await this._commentRepository.addComment(addComment);
    return result;
  }
}

module.exports = AddCommentUseCase;
