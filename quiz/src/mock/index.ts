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
        title: "答题H5模板",
        description: "",
        keywords: "",
        share_info: {
          title: "答题H5模板",
          desc: "",
          img: "https://static.cs090.com/global/images/nopic/nopic.jpg",
          url: "http://ai9.happy2cs.com/4104227/",
        },
        startdate: 1622505600,
        enddate: 1823340500,
        rule: "活动规则活动规则活动规则活动规则",
        aff:
          "qOq0EhcE4tqbv9oMQQgLBp1tgJ0oIZobMHcaN7iNtsJBijUPv%2FnrHt3ul6FQZzKODAcu8Maxy1upZ5guMSwAHg%3D%3D",
        sub: "yes",
        firstView: 0,
        canShare: 1,
        statistic: { view: 2 },
        wxinfo: {
          nickname: "alphardex",
          headimgurl:
            "https://thirdwx.qlogo.cn/mmopen/vi_32/IPHMr34vOoV5Fw0s26HXr2pvyj54Re8LZNBl55oEia1vmMWVAA3jToX1f5BhXVeS6bVMzZCbibEOxyxRLr0JQd2g/132",
        },
        isWin: 0,
        remainLotteryChance: 1,
        rightNum: 0,
        datiChance: 1,
        isJoin: 1,
        myScore: 666,
        myRank: 100,
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
    mock.onGet(API.questions).reply(200, {
      code: 200,
      data: [
        {
          id: "2236431",
          ext1: "1.单选，答案A",
          ext2: "A",
          ext3: "7",
          ext4: "8",
          ext5: "9",
          ext6: "10",
          ext7: "",
          ext8: "1",
          types: "danxuan",
        },
        {
          id: "2236430",
          ext1: "2.多选，答案A,B,C",
          ext2: "A,B,C",
          ext3: "1",
          ext4: "2",
          ext5: "8",
          ext6: "9",
          ext7: "",
          ext8: "1",
          types: "duoxuan",
        },
      ],
    });
    mock.onPost(API.submit).reply(200, {
      code: 200,
      data: {
        rightNum: 3,
      },
    });
    mock.onPost(API.lottery).reply(200, {
      code: 200,
      data: {
        iswin: 1,
        recordid: "666",
        prize: "6元",
      },
    });
    mock.onPost(API.apply).reply(200, {
      code: 200,
      msg: "ok",
    });
    mock.onGet(API.myPrize).reply(200, {
      code: 200,
      data: {
        list: [
          {
            id: "9527",
            prize: "红包",
            getstatus: 0,
          },
          {
            id: "9527",
            prize: "红包",
            getstatus: 1,
          },
        ],
        remainTimes: 1,
      },
    });
    mock.onGet(API.seccode).reply(200, {
      code: 200,
      data:
        "data:image/png;base64,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",
    });
    mock.onPost(API.sendcode).reply(200, {
      code: 200,
      msg: "ok",
    });
    mock.onPost(API.exchange).reply(200, {
      code: 200,
      msg: "ok",
    });
  }
}

export default MockServer;
