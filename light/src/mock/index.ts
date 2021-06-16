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
        title: "点亮H5模板",
        description: "",
        keywords: "",
        share_info: {
          title: "点亮H5模板",
          desc: "",
          img: "https://static.cs090.com/global/images/nopic/nopic.jpg",
          url: "http://163.wm090.com/4094850/",
        },
        act_rule: "规则000".repeat(60),
        begin_time: "1621301100",
        end_time: "1622476500",
        prize_left: "1000",
        prize_rule: "奖品规则".repeat(20),
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
    mock.onGet(API.myInfo).reply(200, {
      code: 200,
      data: {
        subscribe: "yes",
        my_share_url: "http://163.wm090.com/4094850/?mod=share&aff=e4lNRBNrmo",
        my_time: 3,
        my_num: 0,
        target_num: 12,
        // 未集满
        is_full: "no",
        prize_id: "",
        // 集满但未领取
        // is_full: "yes",
        // prize_id: "666",
        // 集满且已领取
        // is_full: "yes",
        // prize_id: "",
      },
    });
    mock.onPost(API.light).reply(200, {
      code: 200,
      data: {
        is_full: "no",
        prize_id: "666",
      },
    });
    mock.onPost(API.help).reply(200, {
      code: 200,
      data: "",
      msg: "",
    });
    // mock.onPost(API.help).reply(200, {
    //   code: 21019,
    //   data: "",
    //   msg: "你已经帮过TA了",
    // });
    mock.onPost(API.pickup).reply(200, {
      code: 200,
      data: "",
    });
    mock.onGet(API.myPrize).reply(200, {
      code: 200,
      data: [
        // 核销状态
        { id: "666", title: "奖品", havGet: "no" },
        // 已核销状态
        { id: "666", title: "奖品", havGet: "yes" },
      ],
    });
    mock.onPost(API.exchange).reply(200, {
      code: 200,
      data: "",
    });
    mock.onPost(API.friendInfo).reply(200, {
      code: 200,
      data: {
        target_num: 12,
        my_num: 2,
        is_full: "no",
      },
    });
  }
}

export default MockServer;
