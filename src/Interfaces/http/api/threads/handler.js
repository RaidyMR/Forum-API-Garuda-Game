const AddThreadUseCase = require('../../../../Applications/use_case/AddThreadUseCase');
// const GetThreadDetailsUseCase = require('../../../../Applications/use_case/GetThreadDetailsUseCase');

class ThreadHandler {
  constructor(container) {
    this._container = container;

    this.postThreadHandler = this.postThreadHandler.bind(this);
    // this.getThreadDetailsHandler = this.getThreadDetailsHandler.bind(this);
  }

  async postThreadHandler({ auth, payload }, h) {
    const addThreadUseCase = this._container.getInstance(AddThreadUseCase.name);
    const addedThread = await addThreadUseCase.execute(payload, auth.credentials.id);

    return h.response({
      status: 'success',
      data: {
        addedThread,
      },
    }).code(201);
  }

//   async getThreadDetailsHandler({ params }) {
//     const getThreadDetailsUseCase = this._container.getInstance(GetThreadDetailsUseCase.name);
//     const thread = await getThreadDetailsUseCase.execute(params);
//     return {
//       status: 'success',
//       data: {
//         thread,
//       },
//     };
//   }
}

module.exports = ThreadHandler;