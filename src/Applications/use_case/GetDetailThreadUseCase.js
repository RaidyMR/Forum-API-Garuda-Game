class GetDetailThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(payload) {
    const { threadId } = payload;
    const rawData = await this._threadRepository.getDetailThread(threadId);
    const {
      id, title, body, date, username, comments,
    } = this.processRawdata(rawData);

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

    return result.sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  processRawdata(rawData) {
    const {
      tid: id, title, body, tdate: date, username,
    } = rawData[0];

    const replies = rawData.reduce((group, item) => {
      const {
        id: commentId, rid, rname, rdate, rcontent, rdeleted,
      } = item;
      group[commentId] = group[commentId] ?? [];
      if (rid) {
        group[commentId].push({
          id: rid, username: rname, date: rdate, content: rcontent, deleted: rdeleted,
        });
      }
      return group;
    }, {});

    let comments = rawData.map((item) => {
      if (item.id) {
        return ({
          id: item.id,
          username: item.cname,
          date: item.date,
          content: item.content,
          deleted: item.cdeleted,
          replies: replies[item.id],
        });
      }
      return {};
    });

    comments = comments.length === 1 && Object.keys(comments[0]).length === 0 ? [] : comments;

    comments = comments.filter((value, index, self) => index === self.findIndex((t) => (
      t.id === value.id
    )));

    return {
      id, title, body, date, username, comments,
    };
  }
}

module.exports = GetDetailThreadUseCase;
