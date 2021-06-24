const game = {
  state() {
    return {
      status: {
        isGameover: false,
        score: 0,
      },
    };
  },
  mutations: {
    setStatus(state: any, status: any) {
      state.status = status;
    },
    resetStatus(state: any) {
      state.status = {
        isGameover: false,
        score: 0,
      };
    },
  },
};

export default game;
