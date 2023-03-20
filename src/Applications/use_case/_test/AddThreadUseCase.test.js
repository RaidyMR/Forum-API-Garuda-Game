const AddThreadUseCase = require('../AddThreadUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const NewThread = require('../../../Domains/threads/entities/NewThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');

describe('AddThreadUseCase', () => {
    it('should orchestrating the add thread action correctly', async () => {
        // Arrange
        const userId = 'user-123';
        const useCasePayload = {
            title: 'dicoding',
            body: 'Dicoding Indonesia',
        };
        const expectedAddedThread = new AddedThread({
            id: 'thread-123',
            title: useCasePayload.title,
            owner: userId,
        });
    
        /** creating dependency of use case */
        const mockThreadRepository = new ThreadRepository();
    
        /** mocking needed function */
        mockThreadRepository.addThread = jest.fn()
        .mockImplementation(() => Promise.resolve(new AddedThread({
            id: 'thread-123',
            title: useCasePayload.title,
            owner: userId,
        })));
    
        /** creating use case instance */
        const addThreadUseCase = new AddThreadUseCase({
            threadRepository: mockThreadRepository,
        });
    
        // Action
        const addedThread = await addThreadUseCase.execute(useCasePayload, userId);
    
        // Assert
        expect(addedThread).toStrictEqual(expectedAddedThread);
        expect(mockThreadRepository.addThread).toBeCalledWith(new NewThread({
            title: useCasePayload.title,
            body: useCasePayload.body,
            userId,
        }));
    });
});
