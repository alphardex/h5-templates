import { get, post } from "@/utils/request";
import { API } from "@/consts/index";

const getWxShare = () => get(API.wxShare);

const getInfo = () => get(API.info);

const postUploadPic = (body: any) => post(API.uploadPic, body);

const postShare = () => post(API.share);

const getRank = () => get(API.rank);

const getMyInfo = () => get(API.myInfo);

const getStart = () => get(API.start);

const postFinish = (body: any) => post(API.finish, body, true);

export {
  getWxShare,
  getInfo,
  postUploadPic,
  postShare,
  getRank,
  getMyInfo,
  getStart,
  postFinish,
};
