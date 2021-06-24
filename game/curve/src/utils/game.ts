import "phaser";
import ky from "kyouka";
import { Point } from "@/utils/math";

// 单个点坐标转为向量
const point2Vector = (point: Point) =>
  new Phaser.Math.Vector2(ky.vw2px(point.x), ky.vh2px(point.y));

// 多个点坐标转为向量
const points2Vectors = (points: Point[]) => points.map((p) => point2Vector(p));

export { point2Vector, points2Vectors };
