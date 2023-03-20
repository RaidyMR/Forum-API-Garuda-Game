const NewThread = require('../NewThread');

describe('NewThread entities', () => {
    it('should throw error when payload did not contain needed property', () => {
        const payload = {
            title: 'dicoding',
            body: 'Dicoding Indonesia',
        };
        expect(() => new NewThread(payload)).toThrowError('NEW_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
    });

    it('should throw error when payload did not meet data type specification', () => {
        const payload = {
            title: 'dicoding',
            body: 'Dicoding Indonesia',
            userId: true,
        };
        expect(() => new NewThread(payload)).toThrowError('NEW_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
    });

    it('should create newThread object correctly', () => {
        const payload = {
            title: 'dicoding',
            body: 'Dicoding Indonesia',
            userId: 'user-123',
        };
        const { title, body, userId } = new NewThread(payload);

        expect(title).toEqual(payload.title);
        expect(body).toEqual(payload.body);
        expect(userId).toEqual(payload.userId);
    });
});