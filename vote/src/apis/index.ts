import { get, post } from "@/utils/request";
import { API } from "@/consts/index";

const getWxShare = () => get(API.wxShare);

const getInfo = () => get(API.info);

const postUploadPic = (body: any) => post(API.uploadPic, body);

const postShare = () => post(API.share);

const getMyInfo = () => get(API.myInfo);

const getList = (query: any) => get(API.list, query);

const postVote = (body: any) => post(API.vote, body, false, [300, 301, 21019]);

const getDetail = (query: any) => get(API.detail, query);

export {
  getWxShare,
  getInfo,
  postUploadPic,
  postShare,
  getMyInfo,
  getList,
  postVote,
  getDetail,
};
