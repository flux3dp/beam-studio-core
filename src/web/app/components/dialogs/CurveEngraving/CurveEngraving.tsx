/* eslint-disable react/no-unknown-property */
import Delaunator from 'delaunator';
import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Button, Modal } from 'antd';
import { Stage } from '@react-three/drei';
import { useLoader } from '@react-three/fiber';

import Canvas from 'app/widgets/three/Canvas';
import constant from 'app/actions/beambox/constant';
import previewModeBackgroundDrawer from 'app/actions/beambox/preview-mode-background-drawer';
import { addDialogComponent, isIdExist, popDialogById } from 'app/actions/dialog-controller';

import getCanvasImage from './getCanvasImage';
import styles from './CurveEngraving.module.scss';

interface PlaneProps {
  x: number;
  y: number;
  width: number;
  height: number;
  points: number[][][];
  gap: number[];
  textureSource?: string;
}

const Plane = ({
  x: bboxX,
  y: bboxY,
  width,
  height,
  points,
  gap,
  textureSource = 'core-img/white.jpg',
}: PlaneProps): JSX.Element => {
  const geoMeshRef = useRef<THREE.Mesh>(null);
  const lineRef = useRef();
  const texture = useLoader(THREE.TextureLoader, textureSource);
  const flattened = useMemo(
    // reverse y axis and z axis due to different coordinate system, swift half width and height to keep in the center
    () =>
      points.flat().map((p) => [p[0] - bboxX - 0.5 * width, 0.5 * height - (p[1] - bboxY), -p[2]]),
    [points, bboxX, bboxY, width, height]
  );

  const customGeometry = useMemo(() => {
    const vertices = [];
    const colors = [];
    const indices = [];
    const uvs = []; // UV coordinates
    const delaunay = Delaunator.from(
      flattened,
      (p) => p[0],
      (p) => p[1]
    );

    for (let i = 0; i < delaunay.triangles.length; i += 3) {
      const p1 = flattened[delaunay.triangles[i]];
      vertices.push(p1[0], p1[1], p1[2]);
      uvs.push(p1[0] / width + 0.5, p1[1] / height + 0.5);
      const p2 = flattened[delaunay.triangles[i + 1]];
      vertices.push(p2[0], p2[1], p2[2]);
      uvs.push(p2[0] / width + 0.5, p2[1] / height + 0.5);
      const p3 = flattened[delaunay.triangles[i + 2]];
      vertices.push(p3[0], p3[1], p3[2]);
      uvs.push(p3[0] / width + 0.5, p3[1] / height + 0.5);

      const v1 = new THREE.Vector3(p1[0], p1[1], p1[2]);
      const v2 = new THREE.Vector3(p2[0], p2[1], p2[2]);
      const v3 = new THREE.Vector3(p3[0], p3[1], p3[2]);
      const normal = new THREE.Vector3();
      normal.crossVectors(v2.sub(v1), v3.sub(v1)).normalize();
      let angle = THREE.MathUtils.radToDeg(normal.angleTo(new THREE.Vector3(0, 0, -1))); // deg
      angle = angle > 90 ? 180 - angle : angle;

      if (angle > 45) {
        colors.push(1, 2 / 3, 2 / 3);
        colors.push(1, 2 / 3, 2 / 3);
        colors.push(1, 2 / 3, 2 / 3);
      } else {
        colors.push(1, 1, 1);
        colors.push(1, 1, 1);
        colors.push(1, 1, 1);
      }
      indices.push(i, i + 1, i + 2);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2)); // Set UVs
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    return geometry;
  }, [flattened, width, height]);
  const gridGeometry = useMemo(() => new THREE.EdgesGeometry(customGeometry), [customGeometry]);
  const spheres = useMemo(() => {
    const out = [];
    const size = 0.1 * Math.min(gap[0], gap[1]);
    const color = new THREE.Color(0x494949);
    flattened.forEach(([x, y, z], i) =>
      out.push(
        // eslint-disable-next-line react/no-array-index-key
        <mesh key={i} position={[x, y, z]}>
          <sphereGeometry args={[size, 16, 16]} />
          <meshBasicMaterial transparent color={color} opacity={0.5} />
        </mesh>
      )
    );
    return out;
  }, [flattened, gap]);

  return (
    <>
      <mesh ref={geoMeshRef} geometry={customGeometry}>
        <meshBasicMaterial vertexColors transparent side={THREE.DoubleSide} map={texture} />
      </mesh>
      <lineSegments ref={lineRef} geometry={gridGeometry}>
        <lineBasicMaterial color="black" opacity={0.5} linewidth={1} />
      </lineSegments>
      {spheres}
    </>
  );
};

interface Props {
  x: number;
  y: number;
  width: number;
  height: number;
  points: number[][][];
  gap: number[];
  onClose: () => void;
}

const CurveEngraving = ({ x, y, width, height, points, gap, onClose }: Props): JSX.Element => {
  const [firstRender, setFirstRender] = useState(true);
  const [image, setImage] = useState<string | undefined>(undefined);
  useEffect(() => {
    // Wait for modal animation finish, should have better way to do this
    setTimeout(() => setFirstRender(false), 1000);
  }, []);

  const renderCanvas = useCallback(async () => {
    const { dpmm } = constant;
    const res = await getCanvasImage(x * dpmm, y * dpmm, width * dpmm, height * dpmm);
    // console.log(res);
    setImage(res);
  }, [x, y, width, height]);

  const renderCamera = useCallback(async () => {
    const { dpmm } = constant;
    const canvasUrl = previewModeBackgroundDrawer.getCameraCanvasUrl();
    const i = new Image();
    await new Promise((resolve) => {
      i.onload = resolve;
      i.src = canvasUrl;
    });

    const outCanvas = document.createElement('canvas');
    outCanvas.width = Math.round(width * dpmm);
    outCanvas.height = Math.round(height * dpmm);
    const ctx = outCanvas.getContext('2d');
    ctx.drawImage(
      i,
      x * dpmm,
      y * dpmm,
      width * dpmm,
      height * dpmm,
      0,
      0,
      width * dpmm,
      height * dpmm
    );
    ctx.globalCompositeOperation = 'destination-over';
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, outCanvas.width, outCanvas.height);
    const base64 = outCanvas.toDataURL('image/jpeg', 1);
    // console.log(base64);
    setImage(base64);
  }, [x, y, width, height]);

  return (
    <Modal
      title="Curve Engraving"
      open
      centered
      width={540}
      maskClosable={false}
      onCancel={onClose}
      footer={[
        <Button key="close" type="primary" onClick={onClose}>
          tDone
        </Button>,
      ]}
    >
      <div className={styles.container}>
        {!firstRender && (
          <Canvas
            camera={{
              fov: 55,
              near: 0.1,
              far: 1000,
              position: [0, 0, Math.max(width, height)],
            }}
            gl={{ antialias: true, toneMapping: THREE.NoToneMapping }}
            linear
          >
            <Stage adjustCamera={1} shadows={false} environment={null}>
              <Suspense fallback={null}>
                <Plane
                  x={x}
                  y={y}
                  width={width}
                  height={height}
                  points={points}
                  gap={gap}
                  textureSource={image}
                />
              </Suspense>
            </Stage>
          </Canvas>
        )}
      </div>
      <div className={styles.buttons}>
        <Button shape="round" onClick={renderCanvas}>
          tApply Artwork on 3D Curve
        </Button>
        <Button shape="round" onClick={renderCamera}>
          tRenderCamera
        </Button>
      </div>
    </Modal>
  );
};

export default CurveEngraving;

export const showCurveEngraving = async (
  x: number,
  y: number,
  width: number,
  height: number,
  points: number[][][],
  gap: number[]
): Promise<void> => {
  if (!isIdExist('curve-engraving')) {
    addDialogComponent(
      'curve-engraving',
      <CurveEngraving
        x={x}
        y={y}
        width={width}
        height={height}
        points={points}
        gap={gap}
        onClose={() => popDialogById('curve-engraving')}
      />
    );
  }
};
