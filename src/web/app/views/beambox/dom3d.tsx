/* eslint-disable max-classes-per-file */
// Copyright 2016 Todd Fleming
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

// Includes code from CSS3DRenderer.js:
//      Author mrdoob / http://mrdoob.com/
//      Based on http://www.emagix.net/academic/mscs-project/item/camera-sync-with-css3-and-webgl-threejs

import { mat4 } from 'gl-matrix';
import React from 'react';

function epsilon(value) {
  return Math.abs(value) < Number.EPSILON ? 0 : value;
}

function getCameraCSSMatrix(matrix) {
  const processedMatrix = matrix.map((value: number, i: number) => {
    if (i % 4 === 1) {
      return epsilon(-value);
    }
    return epsilon(value);
  });
  return `matrix3d(${processedMatrix.join(',')})`;
  // return 'matrix3d(' +
  //   epsilon(matrix[0]) + ',' +
  //   epsilon(- matrix[1]) + ',' +
  //   epsilon(matrix[2]) + ',' +
  //   epsilon(matrix[3]) + ',' +

  //   epsilon(matrix[4]) + ',' +
  //   epsilon(-matrix[5]) + ',' +
  //   epsilon(matrix[6]) + ',' +
  //   epsilon(matrix[7]) + ',' +

  //   epsilon(matrix[8]) + ',' +
  //   epsilon(-matrix[9]) + ',' +
  //   epsilon(matrix[10]) + ',' +
  //   epsilon(matrix[11]) + ',' +

  //   epsilon(matrix[12]) + ',' +
  //   epsilon(- matrix[13]) + ',' +
  //   epsilon(matrix[14]) + ',' +
  //   epsilon(matrix[15]) +
  //   ')';
}

interface Dom3dProps {
  camera: any;
  className: string;
  width: number;
  height: number;
}

export class Dom3d extends React.Component<Dom3dProps> {
  private fov: string;

  private transform: string;

  UNSAFE_componentWillUpdate(nextProps: Dom3dProps): void {
    if (!nextProps.camera) return;
    const { camera, width, height } = nextProps;
    if (camera.fovy) {
      this.fov = (0.5 * (nextProps.height / Math.tan(camera.fovy * 0.5))).toString();
      this.transform = `translate3d(0,0,${this.fov}px) ${getCameraCSSMatrix(camera.view)} translate3d(${width / 2}px,${height / 2}px, 0)`;
    } else {
      this.fov = 'none';
      this.transform = `scale(${width / 2},${height / 2}) ${getCameraCSSMatrix(camera.view)} translate3d(${width / 2}px,${height / 2}px, 0)`;
    }
  }

  render(): JSX.Element {
    const {
      className, width, height, children,
    } = this.props;
    return (
      <div
        className={className}
        style={{
          overflow: 'hidden',
          transformStyle: 'preserve-3d',
          perspective: this.fov,
        }}
      >
        <div
          style={{
            position: 'absolute',
            width,
            height,
            transformStyle: 'preserve-3d',
            transform: this.transform,
          }}
        >
          {children}
        </div>
      </div>
    );
  }
}

interface Text3dProps {
  x: number;
  y: number;
  size: number;
  label?: string;
  style: { [key: string]: string };
}

export class Text3d extends React.Component<Text3dProps> {
  shouldComponentUpdate(nextProps: Text3dProps): boolean {
    const {
      x, y, size, label,
    } = this.props;
    return (
      nextProps.x !== x
      || nextProps.y !== y
      || nextProps.size !== size
      || nextProps.label !== label
    );
  }

  render(): JSX.Element {
    const {
      x, y, style, size, label, children,
    } = this.props;
    return (
      <div
        style={{
          position: 'absolute',
          transform: `translate3d(${x}px,${y}px,0) translate3d(-50%,-50%,0) scale(.1,-.1)`,
        }}
      >
        <div
          style={{
            ...style,
            left: 0,
            top: 0,
            fontSize: size * 10,
          }}
        >
          {label || children}
        </div>
      </div>
    );
  }
}
