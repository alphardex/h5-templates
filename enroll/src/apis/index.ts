import { get, post } from "@/utils/request";
import { API } from "@/consts/index";

const getWxShare = () => get(API.wxShare);

const getInfo = () => get(API.info);

const postUploadPic = (body: any) => post(API.uploadPic, body);

const postShare = () => post(API.share);

const postApply = (body: any) => post(API.apply, body);

export { getWxShare, getInfo, postUploadPic, postShare, postApply };
