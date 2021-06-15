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
        title: "投票H5模板",
        description: "快来支持你心中的最美沧浪人吧！",
        keywords: "",
        share_info: {
          title: "投票H5模板",
          desc: "快来支持你心中的最美沧浪人吧！",
          img: "https://static.cs090.com/global/images/nopic/nopic.jpg",
          url: "http://dws.js2cs.com/4132524/",
        },
        act_rule: "<p>规则000</p>",
        begin_time: "1592440200",
        end_time: "1632412500",
        statistics: { apply: "2", vote: "1", view: "4" },
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
      data: { my_time: "3", can_share: "no", subscribe: "yes" },
    });
    mock.onGet(API.list).reply(200, {
      code: 200,
      data: {
        list: Array(10).fill({
          id: "nbJeVIQ8Q1Kv",
          pic:
            "http://uimg.cs090.com/userup/a/750811/2021/1623H5347-1U1402.jpg",
          name: "测试姓名",
          num: "1",
          rank: "1",
          no: "001",
          voted: "no",
        }),
        page: {
          max: 2,
        },
      },
    });
    mock.onPost(API.vote).reply(200, {
      code: 200,
      msg: "ok",
      // code: 21019,
      // msg: "该分类今天已经投过票了",
    });
    mock.onGet(API.detail).reply(200, {
      code: 200,
      data: {
        id: "elWeMsJ0JEAM",
        pic: "http://uimg.cs090.com/userup/a/750811/2021/1623H5347-1U1402.jpg",
        name: "测试姓名",
        num: "1",
        rank: "1",
        no: "001",
        voted: "no",
        share_url:
          "http://dws.js2cs.com/4132524/main.php?mod=feature&id=elWeMsJ0JEAM",
        desc: "666",
      },
    });
  }
}

export default MockServer;
