import ky from "kyouka";

const activityID = "";
const publicKey = ``;

const isDevMode = process.env.NODE_ENV === "development";
const isMobile = ky.detectDeviceType() === "Mobile";
const isWeixin = /micromessenger/i.test(navigator.userAgent);
const isWeapp = /miniProgram/i.test(navigator.userAgent);

const statusCode = {
  UNAUTHORIZED: 300,
};

const BASEPATH = "main.php?mod=";

const API = {
  wxShare: "wxShareConfigParameters",
  wxLogin: "wxLogin",
  info: "info",
  uploadPic: "uploadPic",
  share: "share",
  questions: "question",
  submit: "submit",
  lottery: "lottery",
  apply: "fillInfo",
  seccode: "verifyCode",
  sendcode: "sendcode",
  exchange: "writeOff",
  myInfo: "myInfo",
};

Object.entries(API).forEach(([key, value]) => {
  (API as Record<string, string>)[key] = `${BASEPATH}${value}`;
});

console.log(JSON.stringify(API));

const navItems = [
  { to: { name: "Home" }, text: "首页" },
  { to: { name: "Rule" }, text: "活动规则" },
  { to: { name: "Prize" }, text: "我的奖品" },
];

const masonryConfig = {
  sel: ".masonry",
  config: {
    itemSelector: `.masonry-item`,
    columnWidth: ky.vw2px(42),
    fitWidth: true,
    gutter: ky.vw2px(3),
  },
};

const needSubscribe = true;
const needCheckDate = true;
const needCheckChance = true;
const needReceivePrizeSendMsg = true;
const needQuizTimer = false;
const needShowRightOrWrong = true;
const showChoiceDot = true;
const canShareAddChance = true;

const gzh = {
  name: "公众号名",
  keyword: "关键词",
};

export {
  activityID,
  publicKey,
  isDevMode,
  isMobile,
  isWeixin,
  isWeapp,
  API,
  navItems,
  statusCode,
  masonryConfig,
  needSubscribe,
  needCheckDate,
  needCheckChance,
  gzh,
  needReceivePrizeSendMsg,
  needQuizTimer,
  needShowRightOrWrong,
  showChoiceDot,
  canShareAddChance,
};
