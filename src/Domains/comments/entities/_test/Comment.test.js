const Comment = require('../Comment');

describe('Comment entities', () => {
    it('should throw error when payload did not contain needed property', () => {
        // Arrange
        const payload = {
            content: 'dicoding',
            userId: 'user-1',
        };

        // Action and Assert
        expect(() => new Comment(payload)).toThrowError('COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    });

    it('should throw error when payload did not meet data type specification', () => {
        //arrange
        const payload = {
            content: 123,
            userId: 'user-1',
            threadId: 'thread-1',
        };

        //action and assert
        expect(() => new Comment(payload)).toThrowError('COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    });

    it('should create comment object correctly', () => {
        //arrange
        const payload = {
            content: 'dicoding',
            userId: 'user-1',
            threadId: 'thread-1',
        };

        //action
        const comment = new Comment(payload);

        //assert
        expect(comment.content).toEqual(payload.content);
        expect(comment.userId).toEqual(payload.userId);
        expect(comment.threadId).toEqual(payload.threadId);
    });
});