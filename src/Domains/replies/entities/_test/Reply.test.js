const Reply = require('../Reply');

describe('Reply entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      content: 'dicoding',
    };
    expect(() => new Reply(payload)).toThrowError('REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      content: 'dicoding',
      userId: {},
      commentId: true,
      threadId: 'thread-123',
    };
    expect(() => new Reply(payload)).toThrowError('REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create Reply object correctly', () => {
    const payload = {
      content: 'dicoding',
      userId: 'user-123',
      commentId: 'comment-123',
      threadId: 'thread-123',
    };
    const { id, content, owner } = new Reply(payload);

    expect(id).toEqual(payload.id);
    expect(content).toEqual(payload.content);
    expect(owner).toEqual(payload.owner);
  });
});
