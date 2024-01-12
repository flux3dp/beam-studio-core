import React from 'react';
import Shape, { Point } from '@doodle3d/clipper-js';
import { DEFAULT_LABEL_COLOR, DEFAULT_STROKE_COLOR } from 'app/constants/boxgen-constants';
import {
  getTopBottomShape,
  getFrontBackShape,
  getLeftRightShape,
} from 'app/components/boxgen/Shape';
import { IController, IExportOptions } from 'interfaces/IBoxgen';

interface ShapeDisplayObject {
  shape: THREE.Shape;
  x: number;
  y: number;
  text: string;
}

interface ShapeRaw {
  shape: THREE.Shape;
  width: number;
  height: number;
  text: string;
}

const shapeToSVG = (shape: Shape, cx: number, cy: number): string =>
  shape.paths[0].map((p) => `${p.X + cx},${p.Y + cy}`).join(' ');

const getBlockDistance = (options: IExportOptions) => (options.joinOutput ? [0, 0] : [5, 5]);

export class OutputPage {
  options: IExportOptions;

  shapes: ShapeDisplayObject[] = [];

  nextX = 0;

  cursorX = 0;

  cursorY = 0;

  maxX = 0;

  maxY = 0;

  constructor(canvasWidth: number, canvasHeight: number, options: IExportOptions) {
    this.maxX = canvasWidth;
    this.maxY = canvasHeight;
    this.options = options;
  }

  addShape(shape: ShapeRaw): boolean {
    const [dx, dy] = getBlockDistance(this.options);
    if (
      this.cursorY + dy + shape.height > this.maxY &&
      this.cursorX + dx + shape.width <= this.maxX
    ) {
      this.cursorX = this.nextX;
      this.cursorY = 0;
    }
    if (this.cursorX + shape.width > this.maxX) return false;
    this.shapes.push({
      shape: shape.shape,
      x: this.cursorX + shape.width / 2,
      y: this.cursorY + shape.height / 2,
      text: shape.text,
    });
    if (this.cursorY + dy + shape.height <= this.maxY) {
      this.cursorY += dy + shape.height;
      this.nextX = Math.max(this.nextX, this.cursorX + shape.width + dx);
    }
    return true;
  }
}

export const getLayouts = (
  canvasWidth: number,
  canvasHeight: number,
  data: IController,
  options: IExportOptions
): { pages: { shape: JSX.Element[]; label: JSX.Element[] }[] } => {
  const color = DEFAULT_STROKE_COLOR;
  const textColor = DEFAULT_LABEL_COLOR;
  const { width, height, depth } = data;

  const topBottomShape = getTopBottomShape({ ...data, width, height: depth });
  const frontBackShape = getFrontBackShape({ ...data, width: depth, height });
  const leftRightShape = getLeftRightShape({ ...data, width, height });

  const shapes = [
    { ...topBottomShape, text: 'Bottom' },
    { ...frontBackShape, text: 'Front' },
    { ...frontBackShape, text: 'Back' },
    { ...leftRightShape, text: 'Left' },
    { ...leftRightShape, text: 'Right' },
  ];

  if (data.cover) {
    shapes.unshift({ ...topBottomShape, text: 'Top' });
  }

  const outputs: OutputPage[] = [new OutputPage(canvasWidth, canvasHeight, options)];

  shapes.forEach((shape) => {
    const success = outputs[outputs.length - 1].addShape(shape);
    if (!success) {
      outputs.push(new OutputPage(canvasWidth, canvasHeight, options));
      outputs[outputs.length - 1].addShape(shape);
    }
  });

  const pages = outputs.map((output) => ({
    shape: output.shapes.map((obj: ShapeDisplayObject) => {
      const path = [obj.shape.getPoints().map((p) => ({ X: p.x, Y: p.y })) as Point[]];
      const sh = new Shape(path, true, false);
      return (
        <polygon
          fill="none"
          stroke={`rgb(${color.r}, ${color.g}, ${color.b})`}
          points={shapeToSVG(sh, obj.x, obj.y)}
        />
      );
    }),
    label: options.textLabel
      ? output.shapes.map((obj: ShapeDisplayObject) => (
          <text
            x={obj.x}
            y={obj.y}
            dominantBaseline="middle"
            textAnchor="middle"
            style={{
              fill: `rgb(${textColor.r}, ${textColor.g}, ${textColor.b})`,
            }}
          >
            {obj.text}
          </text>
        ))
      : [],
  }));

  return { pages };
};
