import { get, post } from "@/utils/request";
import { API } from "@/consts/index";

const getWxShare = () => get(API.wxShare);

const getInfo = () => get(API.info);

const postUploadPic = (body: any) => post(API.uploadPic, body);

const postShare = (body: any) => post(API.share, body);

const postSubmit = (body: any) => post(API.submit, body, true);

const postLottery = () => post(API.lottery);

const postApply = (body: any) => post(API.apply, body);

const getMyPrize = () => get(API.myPrize);

const getSecCode = () => get(API.seccode);

const postSendCode = (body: any) => post(API.sendcode, body);

const postExchange = (body: any) => post(API.exchange, body);

export {
  getWxShare,
  getInfo,
  postUploadPic,
  postShare,
  postSubmit,
  postLottery,
  postApply,
  getMyPrize,
  getSecCode,
  postSendCode,
  postExchange,
};
