import { createStore } from "vuex";
import wx from "./wx";
import game from "./game";

export default createStore({
  modules: {
    wx,
    game,
  },
});
