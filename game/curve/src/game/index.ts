import "phaser";
import ky from "kyouka";
import store from "@/store";
import { last } from "@/utils/dom";
import { Point } from "@/utils/math";
// @ts-ignore
import PathFollower from "phaser3-rex-plugins/plugins/pathfollower.js";
import { resourceUrls } from "@/consts";
import { point2Vector, points2Vectors } from "@/utils/game";

// 曲线路径运动游戏
// 1. 生成曲线，玩家能沿着曲线移动
// 2. 玩家碰到礼物加分，碰到障碍游戏结束
// 3. 点击按钮能左右移动角色
// 4. 镜头能随玩家的移动而移动
// 5. 随机生成曲线
// 6. 生成复杂的曲线
// 7. 随机生成礼物和障碍
// 8. 礼物和障碍物的图片是随机的
class CurveGame extends Phaser.Scene {
  params: any;
  path: Phaser.Curves.Path | null;
  playerStartPoint: Point;
  player: Phaser.Types.Physics.Arcade.ImageWithDynamicBody | null;
  playerLeft: Phaser.Types.Physics.Arcade.ImageWithDynamicBody | null;
  playerRight: Phaser.Types.Physics.Arcade.ImageWithDynamicBody | null;
  currentPlayer: Phaser.Types.Physics.Arcade.ImageWithDynamicBody | null;
  playersContainer: Phaser.GameObjects.Container | null;
  obstacles: Phaser.Types.Physics.Arcade.ImageWithDynamicBody[] | null;
  presents: Phaser.Types.Physics.Arcade.ImageWithDynamicBody[] | null;
  obstaclePoints: Point[];
  presentPoints: Point[];
  isGameover: boolean;
  score: number;
  leftBtn: Phaser.GameObjects.Sprite | null;
  rightBtn: Phaser.GameObjects.Sprite | null;
  isInvincible: boolean;
  tween: Phaser.Tweens.Tween | null;
  constructor() {
    super("curveGame");
    this.params = {
      lineWidth: 4, // 路线宽度
      lineColor: 0xff0000, // 路线颜色
      lineAlpha: 0.31, // 路线透明度
      imageScale: 0.4, // 图片缩放比例
      btnImageScale: 0.6, // 按钮图缩放比例
      playerMoveGap: 100, // 玩家移动间距
      playerMoveVelocity: 0.2, // 玩家移动速度
      presentScore: 20, // 礼物奖励分
      scoreRate: 0.25, // 分数倍率
      timeScaleAcceleration: 0.0001, // 时间幅度加速度
      useCirclePath: false, // 使用圆形路径
      pathCount: 200, // 路径总数
      obstacleTypeCount: 2, // 障碍种类数
      presentTypeCount: 2, // 礼物种类数
    };
    this.path = null; // 路径
    this.playerStartPoint = { x: 0, y: 0 }; // 玩家起点
    this.player = null; // 玩家
    this.playerLeft = null; // 在左边移动的玩家
    this.playerRight = null; // 在右边移动的玩家
    this.currentPlayer = null; // 当前玩家
    this.playersContainer = null; // 玩家组
    this.obstacles = []; // 所有障碍
    this.presents = []; // 所有礼物
    this.obstaclePoints = []; // 所有障碍点
    this.presentPoints = []; // 所有礼物点
    this.isGameover = false; // 游戏结束
    this.score = 0; // 得分
    this.leftBtn = null; // 向左移动按钮
    this.rightBtn = null; // 向右移动按钮
    this.isInvincible = false; // 是否无敌状态
    this.tween = null; // 跟踪动画
  }
  // 预加载
  preload() {
    this.load.image("player", resourceUrls.playerUrl);
    this.load.image("leftBtn", resourceUrls.leftBtnUrl);
    this.load.image("rightBtn", resourceUrls.rightBtnUrl);
    for (let i = 0; i < this.params.obstacleTypeCount; i++) {
      this.load.image(
        `obstacle-${i + 1}`,
        (resourceUrls as any)[`obstacle${i + 1}Url`]
      );
    }
    for (let i = 0; i < this.params.presentTypeCount; i++) {
      this.load.image(
        `present-${i + 1}`,
        (resourceUrls as any)[`present${i + 1}Url`]
      );
    }
  }
  // 创建一切
  create() {
    this.createPath();
    this.createObstacles();
    this.createPresents();
    this.createPlayers();
    this.cameraFocusObject(this.playersContainer);
    this.startFollow();
    this.createPlayerMoveBtns();
  }
  // 游戏进行时
  update() {
    this.syncStatus();
    this.showOnlyCurrentPlayer();
    if (!this.isGameover) {
      this.checkAllOverlap();
      this.addScore();
      this.speedUp();
    }
  }
  // 创建路径
  // https://phaser.io/examples/v3/category/paths/curves
  createPath() {
    const path = new Phaser.Curves.Path(
      this.playerStartPoint.x,
      this.playerStartPoint.y
    );
    this.buildPath(path);
    this.drawPath(path);
    this.path = path;
  }
  // 搭建路径
  buildPath(path: Phaser.Curves.Path) {
    let points = [new Point(0, -50), new Point(0, -100)];
    path.splineTo(points2Vectors(points));
    const isDirectionReversed = ky.sample([-1, 1]);
    let obstaclePoints = [];
    let presentPoints = [];
    for (let i = 0; i < this.params.pathCount; i++) {
      const direction = ky.sample([-1, 1]) * isDirectionReversed;
      let lastPoint = last(points);
      const xOffset = ky.randomIntegerInRange(50, 100) * direction;
      const yOffset = ky.randomIntegerInRange(-50, -25);
      const startPoint = {
        x: lastPoint.x + xOffset,
        y: lastPoint.y + yOffset,
      };
      points = [startPoint];
      path.splineTo(points2Vectors(points));
      if (this.params.useCirclePath) {
        const circlePossibility = ky.randomIntegerInRange(0, 100);
        if (circlePossibility < 30) {
          const radius = ky.randomIntegerInRange(80, 240);
          path.ellipseTo(radius, radius, 0, 360, true);
        }
      }
      const line = new Phaser.Geom.Line(
        lastPoint.x,
        lastPoint.y,
        startPoint.x,
        startPoint.y
      );
      const randPoint = line.getRandomPoint();
      const objectPossibility = ky.randomIntegerInRange(0, 100);
      if (objectPossibility > 0 && objectPossibility < 30) {
        const presentPoint = randPoint;
        const direction = ky.sample([-1, 1]);
        const xOffset = ky.randomIntegerInRange(30, 40) * direction;
        presentPoint.x += xOffset;
        presentPoints.push(presentPoint);
      } else if (objectPossibility > 30 && objectPossibility < 70) {
        const obstaclePoint = randPoint;
        const xOffset = ky.sample([
          0,
          ky.randomIntegerInRange(0, 30),
          ky.randomIntegerInRange(-30, 0),
        ]);
        obstaclePoint.x += xOffset;
        obstaclePoints.push(obstaclePoint);
      }
    }
    this.obstaclePoints = obstaclePoints;
    this.presentPoints = presentPoints;
  }
  // 绘制路径
  drawPath(path: Phaser.Curves.Path) {
    const graphics = this.add.graphics();
    graphics.lineStyle(
      this.params.lineWidth,
      this.params.lineColor,
      this.params.lineAlpha
    );
    path.draw(graphics);
  }
  // 创建玩家
  createPlayer({ x = 0, y = 0, name = "player" }) {
    const player = this.physics.add.image(x, y, "player");
    player.setScale(this.params.imageScale);
    player.setRotation(ky.deg2rad(90));
    player.setName(name);
    return player;
  }
  // 创建所有状态的玩家以及把它们包在一起的容器
  // https://phaser.io/examples/v3/view/game-objects/container/add-array-of-sprites-to-container
  createPlayers() {
    const player = this.createPlayer(this.playerStartPoint);
    this.player = player;
    this.currentPlayer = player;
    const playerLeftStartPoint = {
      x: this.playerStartPoint.x,
      y: this.playerStartPoint.y - this.params.playerMoveGap,
    };
    const playerLeft = this.createPlayer({
      ...playerLeftStartPoint,
      name: "player-left",
    });
    this.playerLeft = playerLeft;
    const playerRightStartPoint = {
      x: this.playerStartPoint.x,
      y: this.playerStartPoint.y + this.params.playerMoveGap,
    };
    const playerRight = this.createPlayer({
      ...playerRightStartPoint,
      name: "player-right",
    });
    this.playerRight = playerRight;
    const container = this.add.container(
      this.playerStartPoint.x,
      this.playerStartPoint.y
    );
    container.add([player!, playerLeft!, playerRight!]);
    this.playersContainer = container;
  }
  // 只显示当前玩家
  // https://phaser.io/examples/v3/view/actions/set-alpha
  showOnlyCurrentPlayer() {
    const players = this.playersContainer!.getAll();
    Phaser.Actions.SetAlpha(players, 0);
    const currentPlayer = this.currentPlayer!;
    Phaser.Actions.SetAlpha([currentPlayer], 1);
  }
  // 相机聚焦某个对象
  // https://phaser.io/examples/v3/view/camera/follow-offset
  cameraFocusObject(object: any) {
    this.cameras.main.startFollow(object);
  }
  // 开始跟踪
  // https://phaser.io/examples/v3/view/paths/followers/rotate-to-path
  // https://phaser.discourse.group/t/how-could-i-let-a-container-to-follow-a-path-as-a-pathfollower-does/1736
  // https://rexrainbow.github.io/phaser3-rex-notes/docs/site/pathfollower/
  startFollow() {
    const that = this;
    const { playersContainer } = this;
    const duration = this.path!.getLength() / this.params.playerMoveVelocity;
    const pathFollower = new PathFollower(playersContainer, {
      path: this.path,
      t: 0,
      rotateToPath: true,
      onComplete() {
        that.endGame();
      },
    });
    const tween = this.tweens.add({
      targets: pathFollower,
      t: 1,
      duration,
    });
    this.tween = tween;
  }
  // 创建障碍物
  createObstacle({ x = 0, y = 0, radius = 0, name = "" }) {
    const obstacleType = ky.randomIntegerInRange(
      1,
      this.params.obstacleTypeCount
    );
    const obstacleUrlName = `obstacle-${obstacleType}`;
    const obstacle = this.physics.add.image(x, y, obstacleUrlName);
    obstacle.setScale(this.params.imageScale);
    obstacle.setRotation(radius);
    obstacle.setName(name);
    return obstacle;
  }
  // 创建所有障碍物
  createObstacles() {
    const obstacles = this.obstaclePoints.map((point, i) => {
      const vector = point2Vector(point);
      const obstacle = this.createObstacle({
        x: vector.x,
        y: vector.y,
        radius: 0,
        name: `obstacle-${i}`,
      });
      return obstacle;
    });
    this.obstacles = obstacles;
  }
  // 创建礼物
  createPresent({ x = 0, y = 0, radius = 0, name = "" }) {
    const presentType = ky.randomIntegerInRange(
      1,
      this.params.presentTypeCount
    );
    const presentUrlName = `present-${presentType}`;
    const present = this.physics.add.image(x, y, presentUrlName);
    present.setScale(this.params.imageScale);
    present.setRotation(radius);
    present.setName(name);
    return present;
  }
  // 创建所有礼物
  createPresents() {
    const presents = this.presentPoints.map((point, i) => {
      const vector = point2Vector(point);
      const present = this.createPresent({
        x: vector.x,
        y: vector.y,
        radius: 0,
        name: `present-${i}`,
      });
      return present;
    });
    this.presents = presents;
  }
  // 重叠检测
  // https://phaser.io/examples/v3/view/geom/intersects/triangle-to-triangle
  detectOverlap(
    player: Phaser.Types.Physics.Arcade.ImageWithDynamicBody,
    object: Phaser.Types.Physics.Arcade.ImageWithDynamicBody
  ) {
    // 已销毁的物体不参与检测
    if (!object.displayList) {
      return false;
    }
    // const playerBounds = player.getBounds();
    // const objectBounds = object.getBounds();
    const playerBounds = this.getTriangleBounds(player);
    const objectBounds = this.getTriangleBounds(object);
    return Phaser.Geom.Intersects.TriangleToTriangle(
      playerBounds,
      objectBounds
    );
  }
  // 获取三角形边界
  getTriangleBounds(sprite: Phaser.Types.Physics.Arcade.ImageWithDynamicBody) {
    const topLeft = sprite.getTopLeft(undefined, true);
    const topRight = sprite.getTopRight(undefined, true);
    const bottomCenter = sprite.getBottomCenter(undefined, true);
    const triangle = new Phaser.Geom.Triangle(
      topLeft.x,
      topLeft.y,
      topRight.x,
      topRight.y,
      bottomCenter.x,
      bottomCenter.y
    );
    return triangle;
  }
  // 检测玩家是否碰到障碍物
  checkObstacleOverlapPlayer() {
    this.obstacles!.forEach((obstacle) => {
      const isOverlap = this.detectOverlap(this.currentPlayer!, obstacle);
      if (isOverlap) {
        this.endGame();
      }
    });
  }
  // 检测玩家是否碰到礼物
  checkPresentOverlapPlayer() {
    this.presents!.forEach((present) => {
      const isOverlap = this.detectOverlap(this.currentPlayer!, present);
      if (isOverlap) {
        this.getPresent(present);
      }
    });
  }
  // 检测所有重叠事件
  checkAllOverlap() {
    this.checkObstacleOverlapPlayer();
    this.checkPresentOverlapPlayer();
  }
  // 获得礼物
  getPresent(present: Phaser.Types.Physics.Arcade.ImageWithDynamicBody) {
    if (present) {
      present.destroy();
      this.score += this.params.presentScore;
    }
  }
  // 加分
  addScore() {
    this.score += this.params.scoreRate;
  }
  // 结束游戏
  endGame() {
    if (this.isInvincible) {
      return;
    }
    this.isGameover = true;
    this.tween!.remove();
  }
  // 创建玩家水平移动按钮
  // https://phaser.io/examples/v3/view/input/mouse/click-sprite
  createPlayerMoveBtns() {
    const leftBtn = this.add
      .sprite(ky.vw2px(22), ky.vh2px(77), "leftBtn")
      .setInteractive()
      .setScrollFactor(0);
    leftBtn.setScale(this.params.btnImageScale);
    leftBtn.on("pointerdown", (e: any) => {
      if (this.isGameover) {
        return;
      }
      this.movePlayerToLeft();
    });
    leftBtn.on("pointerup", (e: any) => {
      if (this.isGameover) {
        return;
      }
      this.movePlayerBack();
    });
    this.leftBtn = leftBtn;
    const rightBtn = this.add
      .sprite(ky.vw2px(78), ky.vh2px(77), "rightBtn")
      .setInteractive()
      .setScrollFactor(0);
    rightBtn.setScale(this.params.btnImageScale);
    rightBtn.on("pointerdown", (e: any) => {
      if (this.isGameover) {
        return;
      }
      this.movePlayerToRight();
    });
    rightBtn.on("pointerup", (e: any) => {
      if (this.isGameover) {
        return;
      }
      this.movePlayerBack();
    });
    this.rightBtn = rightBtn;
  }
  // 玩家向左侧移动
  movePlayerToLeft() {
    this.currentPlayer = this.playerLeft;
  }
  // 玩家向右侧移动
  movePlayerToRight() {
    this.currentPlayer = this.playerRight;
  }
  // 玩家回归原位
  movePlayerBack() {
    this.currentPlayer = this.player;
  }
  // 同步游戏状态
  syncStatus() {
    const gameStatus = {
      isGameover: this.isGameover,
      score: Math.ceil(this.score),
    };
    store.commit("setStatus", gameStatus);
  }
  // 不停加速直至最快
  speedUp() {
    if (this.tween!.timeScale <= 2) {
      this.tween!.timeScale += this.params.timeScaleAcceleration;
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  scene: CurveGame,
  parent: "game",
  transparent: true,
  physics: {
    default: "arcade",
    arcade: { debug: false },
  },
};

const startCurveGame = () => {
  const game = new Phaser.Game(config);
  return game;
};

export default startCurveGame;
