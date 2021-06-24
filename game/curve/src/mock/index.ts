import { API } from "@/consts";
import { service } from "@/utils/request";
import MockAdapter from "axios-mock-adapter";
import Mock from "mockjs";

class MockServer {
  mock: MockAdapter;
  constructor() {
    this.mock = new MockAdapter(service);
  }
  start() {
    const mock = this.mock;
    mock.onGet(API.wxShare).reply(200, {
      code: 200,
      data: {
        appid: "wxf9d0cf801b91d3ed",
        noncestr: "c734d2a39e7a32a757e8083b00cb29ae",
        signature: "96d834bd3c34a0693d7a7fafcaa88051f43392dc",
        timestamp: "1608015196",
      },
    });
    mock.onGet(API.info).reply(200, {
      code: 200,
      data: {
        title: "端午节·激情龙舟抢大礼",
        description: "",
        keywords: "",
        share_info: {
          title: "端午节·激情龙舟抢大礼",
          desc: "",
          img: "https://static.cs090.com/global/images/nopic/nopic.jpg",
          url: "http://wax.wm090.com/4113455/",
        },
        act_rule: "",
        begin_time: "1622427180",
        end_time: "1623744000",
        statistics: { join: "0" },
      },
    });
    mock.onPost(API.uploadPic).reply(200, {
      code: 200,
      msg: "ok",
      data: {
        pic: Mock.Random.image(),
        small: Mock.Random.image(),
      },
    });
    mock.onPost(API.share).reply(200, {
      code: 200,
      msg: "ok",
    });
    mock.onGet(API.rank).reply(200, {
      code: 200,
      data: {
        // list: [],
        list: Array(10).fill({
          rank: "1",
          headimg:
            "https://thirdwx.qlogo.cn/mmopen/vi_32/d4T5qETjEjbXhS4gx3xFEM1x8s7KRz2aXQPdpczViasldUtNKUkz4XM6JCJfBXRiaJgsMPiaKTgr9HibkSPFDTm10Q/132",
          name: "alphardex",
          score: 6666,
        }),
        my: {
          rank: "10",
          headimg:
            "https://thirdwx.qlogo.cn/mmopen/vi_32/d4T5qETjEjbXhS4gx3xFEM1x8s7KRz2aXQPdpczViasldUtNKUkz4XM6JCJfBXRiaJgsMPiaKTgr9HibkSPFDTm10Q/132",
          name: "alphardex",
          score: 0,
        },
      },
    });
    mock.onGet(API.myInfo).reply(200, {
      code: 200,
      data: {
        my_time: "1",
        can_share: "yes",
        headimg:
          "https://thirdwx.qlogo.cn/mmopen/vi_32/d4T5qETjEjbXhS4gx3xFEM1x8s7KRz2aXQPdpczViasldUtNKUkz4XM6JCJfBXRiaJgsMPiaKTgr9HibkSPFDTm10Q/132",
      },
    });
    mock.onGet(API.start).reply(200, {
      code: 200,
      data: { gcode: "koPDTkj4XOR" },
    });
    mock.onPost(API.finish).reply(200, {
      code: 200,
      data: {
        is_win: "no",
        can_share: "no",
      },
    });
  }
}

export default MockServer;
