import { get, post } from "@/utils/request";
import { API } from "@/consts/index";

const getWxShare = () => get(API.wxShare);

const getInfo = () => get(API.info);

const postUploadPic = (body: any) => post(API.uploadPic, body);

const postShare = () => post(API.share);

const getQuestions = () => get(API.questions);

const postSubmit = (body: any) => post(API.submit, body, true);

const postLottery = () => post(API.lottery);

const postApply = (body: any) => post(API.apply, body, true);

const getSecCode = () => get(API.seccode);

const postSendCode = (body: any) => post(API.sendcode, body, true);

const postExchange = (body: any) => post(API.exchange, body, true);

const getMyInfo = () => get(API.myInfo);

export {
  getWxShare,
  getInfo,
  postUploadPic,
  postShare,
  getQuestions,
  postSubmit,
  postLottery,
  postApply,
  getSecCode,
  postSendCode,
  postExchange,
  getMyInfo,
};
