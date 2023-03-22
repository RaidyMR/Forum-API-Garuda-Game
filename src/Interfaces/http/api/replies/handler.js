const AddReplyUseCase = require('../../../../Applications/use_case/AddReplyUseCase');
const DeleteReplyUseCase = require('../../../../Applications/use_case/DeleteReplyUseCase');

class ReplyHandler {
  constructor(container) {
    this._container = container;

    this.postReplyHandler = this.postReplyHandler.bind(this);
    this.deleteReplyHandler = this.deleteReplyHandler.bind(this);
  }

  async postReplyHandler({ auth, params, payload }, h) {
    const addReplyUseCase = this._container.getInstance(AddReplyUseCase.name);
    const { commentId, threadId } = params;
    const { id: userId } = auth.credentials;
    const { content } = payload;
    const addedReply = await addReplyUseCase
      .execute({
        threadId, commentId, userId, content,
      });

    return h.response({
      status: 'success',
      data: {
        addedReply,
      },
    }).code(201);
  }

  async deleteReplyHandler({ auth, params }) {
    const deleteReplyUseCase = this._container.getInstance(DeleteReplyUseCase.name);
    const { commentId, replyId, threadId } = params;
    const { id: userId } = auth.credentials;

    const payload = {
      commentId, userId, replyId, threadId,
    };

    await deleteReplyUseCase.execute(payload);

    return {
      status: 'success',
    };
  }
}

module.exports = ReplyHandler;
