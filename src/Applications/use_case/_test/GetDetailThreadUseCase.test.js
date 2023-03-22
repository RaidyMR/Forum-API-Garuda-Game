const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const GetDetailThreadUseCase = require('../GetDetailThreadUseCase');

describe('GetDetailThreadUseCase', () => {
    it('should orchestrating the get detail thread action correctly', async () => {
        //arrange
        const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
        const date = [];
        date.push(new Date().toISOString());
        await sleep(1000);
        date.push(new Date().toISOString());
        const useCasePayload = {
            threadId: 'thread-123',
        };

        const expectedDetailThread = {
            id: 'thread-123',
            title: 'sebuah title',
            body: 'sebuah body',
            date: date[0],
            username: 'dicoding',
            comments: [
                {
                    id: 'comment-123',
                    username: 'dicoding',
                    date: date[0],
                    content: 'sebuah comment',
                    replies: [
                        {
                            id: 'reply-123',
                            username: 'dicoding',
                            date: date[0],
                            content: '**balasan telah dihapus**',
                        },
                    ],
                },
                {
                    id: 'comment-456',
                    username: 'dicoding',
                    date: date[1],
                    content: '**komentar telah dihapus**',
                    replies: [],
                },
            ],
        };

        const mockThreadRepository = new ThreadRepository();
        mockThreadRepository.getDetailThread = jest.fn()
        .mockImplementation(() => Promise.resolve({
                id: 'thread-123',
                title: 'sebuah title',
                body: 'sebuah body',
                date: date[0],
                username: 'dicoding',
                comments: [
                    {
                        id: 'comment-123',
                        username: 'dicoding',
                        date: date[0],
                        content: 'sebuah comment',
                        deleted: false,
                        replies: [
                            {
                                id: 'reply-123',
                                username: 'dicoding',
                                date: date[0],
                                content: 'sebuah balasan',
                                deleted: true,
                            },
                        ],
                    },
                    {
                        id: 'comment-456',
                        username: 'dicoding',
                        date: date[1],
                        content: 'sebuah comment',
                        deleted: true,
                        replies: [],
                    },
                ],
            }));

        const getDetailThreadUseCase = new GetDetailThreadUseCase({
            threadRepository: mockThreadRepository,
        });

        //action
        const detailThread = await getDetailThreadUseCase.execute(useCasePayload);

        //assert
        expect(mockThreadRepository.getDetailThread).toBeCalledWith(useCasePayload.threadId);
        expect(mockThreadRepository.getDetailThread).toBeCalledTimes(1);
        expect(detailThread).toStrictEqual(expectedDetailThread);
    });
});