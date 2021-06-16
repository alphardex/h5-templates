import { get, post } from "@/utils/request";
import { API } from "@/consts/index";

const getWxShare = () => get(API.wxShare);

const getInfo = () => get(API.info);

const postUploadPic = (body: any) => post(API.uploadPic, body);

const postShare = () => post(API.share);

const getMyInfo = () => get(API.myInfo);

const postLight = () => post(API.light);

const postHelp = (body: any) => post(API.help, body, false, [300, 301, 21019]);

const postPickup = (body: any) => post(API.pickup, body, true);

const getMyPrize = () => get(API.myPrize);

const postExchange = (body: any) => post(API.exchange, body, true);

const postFriendInfo = (body: any) => post(API.friendInfo, body);

export {
  getWxShare,
  getInfo,
  postUploadPic,
  postShare,
  getMyInfo,
  postLight,
  postHelp,
  postPickup,
  getMyPrize,
  postExchange,
  postFriendInfo,
};
