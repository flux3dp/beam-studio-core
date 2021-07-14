/* eslint-disable no-console */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable max-classes-per-file */
import React from 'react';
import { mat4, vec3 } from 'gl-matrix';

import ExportFuncs from 'app/actions/beambox/export-funcs';
import Pointable from 'app/views/beambox/Pointable';
import { Text3d } from 'app/views/beambox/dom3d';
import { DrawCommands } from 'helpers/path-preview/draw-commands';
import { GcodePreview } from 'helpers/path-preview/draw-commands/GcodePreview';
import { LaserPreview } from 'helpers/path-preview/draw-commands/LaserPreview';
import { parseGcode } from './tmpParseGcode';

const MAJOR_GRID_SPACING = 50;
const MINOR_GRID_SPACING = 10;
const m4Identity = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
const simTimeUnit = 1 / 120;
const speedRatio = [0.5, 1, 2, 4, 8];

//
// 初始化 shader 來告知WebGL怎麼畫
//
function initShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  // 建立 shader 程式

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // 錯誤處理

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
    return null;
  }

  return shaderProgram;
}

//
// creates a shader of the given type, uploads the source and
// compiles it.
//
function loadShader(gl, type, source) {
  const shader = gl.createShader(type);

  // Send the source to the shader object

  gl.shaderSource(shader, source);

  // Compile the shader program

  gl.compileShader(shader);

  // See if it compiled successfully

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function dist(x1, y1, x2, y2) {
  return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
}

function initBuffers(gl, width, height) {
  // 建立一個 buffer 來儲存正方形的座標

  const positionBuffer = gl.createBuffer();

  // Select the positionBuffer as the one to apply buffer
  // operations to from here out.

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Now create an array of positions for the square.

  const positions = [
    0, 0,
    300, 0,
    0, -210,
    300, -210,
  ];

  // Now pass the list of positions into WebGL to build the
  // shape. We do this by creating a Float32Array from the
  // JavaScript array, then use it to fill the current buffer.

  gl.bufferData(gl.ARRAY_BUFFER,
    new Float32Array(positions),
    gl.STATIC_DRAW);

  return {
    position: positionBuffer,
  };
}

// Draw white square
function drawScene(gl, programInfo, buffers, camera, isInverting) {
  // gl.clearColor(0.0, 0.0, 0.0, 1.0);  // 設定為全黑
  // gl.clearDepth(1.0);                 // 清除所有東西
  gl.enable(gl.DEPTH_TEST); // Enable 深度測試
  gl.depthFunc(gl.ALWAYS); // Near things obscure far things

  // 開始前先初始化畫布

  // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Tell WebGL how to pull out the positions from the position
  // buffer into the vertexPosition attribute.
  {
    const numComponents = 2; // pull out 2 values per iteration
    const type = gl.FLOAT; // the data in the buffer is 32bit floats
    const normalize = false; // don't normalize
    const stride = 0; // how many bytes to get from one set of values to the next
    // 0 = use type and numComponents above
    const offset = 0; // how many bytes inside the buffer to start from
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(
      programInfo.attribLocations.vertexPosition,
      numComponents,
      type,
      normalize,
      stride,
      offset,
    );
    gl.enableVertexAttribArray(
      programInfo.attribLocations.vertexPosition,
    );
  }

  // Tell WebGL to use our program when drawing

  gl.useProgram(programInfo.program);

  gl.uniformMatrix4fv(
    programInfo.uniformLocations.projectionMatrix,
    false,
    camera.perspective,
  );
  gl.uniformMatrix4fv(
    programInfo.uniformLocations.modelViewMatrix,
    false,
    camera.view,
  );
  gl.uniform1i(
    programInfo.uniformLocations.isInverting,
    isInverting,
  );

  {
    const offset = 0;
    const vertexCount = 4;
    gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
  }
}

const settings = {
  showMachine: false,
  machineWidth: 300,
  machineHeight: 200,
  machineBeamDiameter: 0.2,
  machineBottomLeftX: 0,
  machineBottomLeftY: 0,

  machineFeedRange: {
    XY: { min: 1, max: 50000 },
    Z: { min: 1, max: 50000 },
    A: { min: 1, max: 50000 },
    S: { min: 0, max: 30000 },
  },

  machineXYProbeOffset: 0,

  machineZEnabled: false,
  machineZMatThickness: 0,
  machineZToolOffset: 0,
  machineZStartHeight: '',
  machineZProbeOffset: 0,

  machineAEnabled: false,

  machineBlowerEnabled: false,
  machineBlowerGcodeOn: '',
  machineBlowerGcodeOff: '',

  pxPerInch: 96,
  forcePxPerInch: false,
  dpiBitmap: 300,

  toolGridWidth: 500,
  toolGridHeight: 500,
  toolGridMinorSpacing: 10,
  toolGridMajorSpacing: 50,
  toolSafetyLockDisabled: true,
  toolCncMode: false,
  toolImagePosition: 'BL',
  toolUseNumpad: false,
  toolDisplayCache: false,
  toolUseGamepad: false,
  toolCreateEmptyOps: false,

  toolVideoDevice: null,
  toolVideoPerspective: { enabled: false },
  toolVideoLens: {
    a: 1, b: 1, F: 1, scale: 1,
  },
  toolVideoFov: { x: 1, y: 1 },
  toolVideoResolution: '720p(HD)',

  toolVideoOMR: false,
  toolVideoOMROffsetX: 0,
  toolVideoOMROffsetY: 0,
  toolVideoOMRMarkerSize: 20,

  toolWebcamUrl: '""',
  toolFeedUnits: 'mm/min',
  toolTestSValue: 1,
  toolTestDuration: 0,

  gcodeStart: 'G21         ; Set units to mm\r\nG90         ; Absolute positioning\r\n',
  gcodeEnd: 'M5          ; Switch tool offEnd\r\n',
  gcodeHoming: '',
  gcodeGenerator: 'default',
  gcodeToolOn: '',
  gcodeToolOff: '',
  gcodeLaserIntensity: 'S',
  gcodeLaserIntensitySeparateLine: false,
  gcodeSMinValue: 0,
  gcodeSMaxValue: 1,
  gcodeCheckSizePower: 0,
  gcodeToolTestPower: 0,
  gcodeToolTestDuration: 0,
  gcodeConcurrency: 2,
  gcodeCurvePrecision: 0.1,

  comServerVersion: 'not connected',
  comServerIP: 'localhost:8000',
  comServerConnect: false,
  comInterfaces: [],
  comPorts: [],
  comAccumulatedJobTime: 0,

  connectVia: '',
  connectPort: '',
  connectBaud: '115200',
  connectIP: '',

  jogStepsize: 1,
  jogFeedXY: 1800,
  jogFeedZ: 300,

  uiFcDrag: null,
};

const defaultWorkspace = {
  width: 300,
  height: 210,
  g0Rate: 7500,
  rotaryDiameter: 10,
  simTime: 0,
  cursorPos: [0, 0, 0],
  showGcode: true,
  showLaser: false,
  showDocuments: true,
  showRotary: false,
  showCursor: true,
  showWebcam: false,
  showRasterPreview: false,
  workOffsetX: 0,
  workOffsetY: 0,
  initialZoom: false,
};

const defaultCamera = {
  eye: [150, -105, 300],
  center: [150, -105, 0],
  up: [0, 1, 0],
  fovy: Math.PI / 2.6,
  showPerspective: false,
};

const dimensions = {
  width: 400,
  height: 400,
};

function calcCamera({
  viewportWidth, viewportHeight, fovy, near, far, eye, center, up, showPerspective, machineX, machineY,
}) {
  let perspective;
  // @ts-ignore
  let view = mat4.lookAt([], eye, center, up);
  // @ts-ignore
  view = mat4.translate([], view, [-machineX, -machineY, 0]);
  if (showPerspective) {
    perspective = mat4.perspective(
      new Float32Array(),
      fovy,
      viewportWidth / viewportHeight,
      near,
      far,
    );
  } else {
    const yBound = vec3.distance(eye, center) * Math.tan(fovy / 2);
    // @ts-ignore
    perspective = mat4.identity([]);
    // @ts-ignore
    view = mat4.mul([], mat4.ortho([],
      //-viewportWidth , viewportWidth, -viewportHeight, viewportHeight, near, far),
      -yBound * viewportWidth / viewportHeight, yBound * viewportWidth / viewportHeight, -yBound, yBound, near, far),
      view);
    fovy = 0;
  }
  // @ts-ignore
  const viewInv = mat4.invert([], view);
  return {
    fovy, perspective, view, viewInv,
  };
}

function objectHasMatchingFields(obj, fields) {
  for (const key in fields) if (fields.hasOwnProperty(key) && obj[key] !== fields[key]) return false;
  return true;
}

function sameArrayContent(a, b) {
  return a.length === b.length && a.every((v, i) => v === b[i])
}

function cacheDrawing(fn, state, args) {
  const { drawCommands, width, height } = args;
  if (!objectHasMatchingFields(state, args)) {
    for (const key in args) if (args.hasOwnProperty(key)) state[key] = args[key];
    if (!state.frameBuffer) state.frameBuffer = drawCommands.createFrameBuffer(width, height);
    else state.frameBuffer.resize(width, height);
    drawCommands.useFrameBuffer(state.frameBuffer, () => {
      drawCommands.gl.clearColor(1, 1, 1, 0);
      drawCommands.gl.clear(drawCommands.gl.COLOR_BUFFER_BIT | drawCommands.gl.DEPTH_BUFFER_BIT);
      fn(args);
    });
  }
  drawCommands.image({
    perspective: m4Identity, view: m4Identity, texture: state.frameBuffer.texture, selected: false,
    transform2d: [2 / width, 0, 0, -2 / height, -1, 1],
  });
}

class Grid {
  private maingrid: any;
  private origin: any;
  private background: any;
  private width: any;
  private height: any;
  private origincount: any;
  draw(drawCommands, { perspective, view, width, height, major = MAJOR_GRID_SPACING, minor = MINOR_GRID_SPACING }) {
    if (!this.maingrid || !this.origin || this.width !== width || this.height !== height) {
      this.width = width;
      this.height = height;

      const c = [];

      c.push(0, 0, 0, this.width, 0, 0);
      c.push(0, -this.height, 0, this.width, -this.height, 0);
      c.push(0, -this.height, 0, 0, 0, 0);
      c.push(this.width, -this.height, 0, this.width, 0, 0);

      this.origin = new Float32Array(c);
      this.origincount = c.length / 3;
    }

    drawCommands.basic({ perspective, view, position: this.origin, offset: 0, count: this.origincount, color: [0, 0, 0, 1], scale: [1, 1, 1], translate: [0, 0, 0], primitive: drawCommands.gl.LINES }); // Red
    //drawCommands.basic({ perspective, view, position: this.origin, offset: 2, count: 2, color: [0, 0, 0, 1], scale: [1, 1, 1], translate: [0, 0, 0], primitive: drawCommands.gl.LINES }); // Green
  }
};

function GridText(props) {
  const { minor = MINOR_GRID_SPACING, major = MAJOR_GRID_SPACING, width, height } = props;
  const size = Math.min(major / 3, 10)
  const a = [];
  for (let x = major; x <= width; x += major) {
    a.push(<Text3d key={'x' + x} x={x} y={-5} size={size} style={{ color: '#CC0000' }} label={String(x)} />);
    a.push(<Text3d key={'x' + -x} x={-x} y={-5} size={size} style={{ color: '#CC0000' }} label={String(-x)} />);
  }
  a.push(<Text3d key="x-label" x={width + 15} y={0} size={size} style={{ color: '#CC0000' }}>X</Text3d>);
  for (let y = major; y <= height; y += major) {
    a.push(<Text3d key={'y' + y} x={-10} y={y} size={size} style={{ color: '#00CC00' }} label={String(y)} />);
    a.push(<Text3d key={'y' + -y} x={-10} y={-y} size={size} style={{ color: '#00CC00' }} label={String(-y)} />);
  }
  a.push(<Text3d key="y-label" x={0} y={height + 15} size={size} style={{ color: '#00CC00' }}>Y</Text3d>);
  return <div>{a}</div>;
}

interface State {
  width: number,
  height: number,
  speedLevel: number,
  isInverting: boolean,
  camera: {
    eye: number[],
    center: number[],
    up: number[],
    fovy: number,
    showPerspective: boolean,
  },
  workspace: {
    width: number,
    height: number,
    g0Rate: number,
    rotaryDiameter: number,
    simTime: number,
    cursorPos: number[],
    showGcode: boolean,
    showLaser: boolean,
    showDocuments: boolean,
    showRotary: boolean,
    showCursor: boolean,
    showWebcam: boolean,
    showRasterPreview: boolean,
    workOffsetX: number,
    workOffsetY: number,
    initialZoom: boolean,
  }
}

class PathPreview extends React.Component<{}, State> {
  private camera: any;
  private canvas: any;
  private drawCommands: any;
  private hitTestFrameBuffer: any;
  private grid: any;
  private fingers: any;
  private pointers: any;
  private position: any;
  private moveStarted: boolean;
  private adjustingCamera: boolean;
  private gcodePreview: any;
  private laserPreview: any;
  private simTimeMax: number;
  private simInterval: any;
  private drawGcodeState: object;
  private drawLaserState: object;

  private gcodeString: string;

  private isUpdating: boolean;

  constructor(props) {
    super(props);
    // TODO: make config interface
    this.canvas = null;
    this.position = [0, 0];
    this.grid = new Grid();
    this.camera = calcCamera({
      viewportWidth: dimensions.width,
      viewportHeight: dimensions.height,
      fovy: defaultCamera.fovy,
      near: 0.1,
      far: 2000,
      eye: defaultCamera.eye,
      center: defaultCamera.center,
      up: defaultCamera.up,
      showPerspective: defaultCamera.showPerspective,
      machineX: settings.machineBottomLeftX - defaultWorkspace.workOffsetX,
      machineY: settings.machineBottomLeftY - defaultWorkspace.workOffsetY,
    });
    this.pointers = [];
    this.moveStarted = false;
    this.adjustingCamera = false;
    this.gcodePreview = new GcodePreview();
    this.laserPreview = new LaserPreview();
    this.simTimeMax = 1;

    this.drawGcodeState = {};
    this.drawLaserState = {};

    this.state = {
      width: window.document.getElementById('svg_editor').offsetWidth,
      height: Math.max(dimensions.height, window.document.getElementById('svg_editor').offsetHeight - 200),
      camera: defaultCamera,
      workspace: defaultWorkspace,
      isInverting: false,
      speedLevel: 1,
    };
  }

  componentDidMount() {
    window.addEventListener('resize', this.resetView);
    const { camera } = this.state;
    // @ts-ignore
    const n = vec3.normalize([], vec3.cross([], camera.up, vec3.sub([], camera.eye, camera.center)));
    const dx = 0;
    const dy = 0;
    this.setCameraAttrs({
      // @ts-ignore
      eye: vec3.add([], camera.eye,
        // @ts-ignore
        vec3.add([], vec3.scale([], n, -dx), vec3.scale([], camera.up, -dy))),
      // @ts-ignore
      center: vec3.add([], camera.center,
        // @ts-ignore
        vec3.add([], vec3.scale([], n, -dx), vec3.scale([], camera.up, -dy))),
    });
    let parsedGcode;
    ExportFuncs.getGcode().then((gcodeBlob) => {
      const fileReader = new FileReader();
      fileReader.onloadend = (e) => {
        const result = (e.target.result as string).split('\n');
        result.splice(6, 0, 'G1 X0 Y0');
        console.log(result);
        this.gcodeString = result.join('\n');
        console.log(this.gcodeString);

        if (this.gcodeString.length > 83) {
          parsedGcode = parseGcode(this.gcodeString);

          console.log('parsedGcode: \n', parsedGcode);

          this.gcodePreview.setParsedGcode(parsedGcode);
          this.laserPreview.setParsedGcode(parsedGcode);
          this.simTimeMax = Math.ceil((this.gcodePreview.g1Time + this.gcodePreview.g0Time) / simTimeUnit) * (simTimeUnit) + simTimeUnit / 2;
          console.log(this.simTimeMax, this.gcodePreview.g1Time, this.gcodePreview.g0Time, this.gcodePreview.g0Dist / this.state.workspace.g0Rate);
          this.forceUpdate();
        }

        // this.renderGcodeCanvas();
      };
      fileReader.readAsText(gcodeBlob);
    });

    // this.gcode = gcode;
    // let parsedGcode = parseGcode(gcode);
  }

  shouldComponentUpdate(nextProps, nextState): boolean {
    const {
      width, height, workspace, camera, speedLevel, isInverting,
    } = this.state;
    return (
      nextState.width !== width
      || nextState.height !== height
      || nextState.workspace.workOffsetX !== workspace.workOffsetX
      || nextState.workspace.workOffsetY !== workspace.workOffsetY
      || nextState.workspace.cursorPos !== workspace.cursorPos
      || nextState.workspace.simTime !== workspace.simTime
      || nextState.workspace.showLaser !== workspace.showLaser
      || nextState.camera !== camera
      || nextState.speedLevel !== speedLevel
      || nextState.isInverting !== isInverting
    );
  }

  componentDidUpdate() {
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resetView);
  }

  setWorkspaceAttrs = (attrs) => {
    const { workspace } = this.state;
    this.setState({
      workspace: {
        ...workspace,
        ...attrs,
      },
    });
  };

  setCameraAttrs = (attrs) => {
    const { camera } = this.state;

    this.setState({
      camera: {
        ...camera,
        ...attrs,
      },
    }, this.setCamera);
  };

  // fixed
  setCamera() {
    const {
      width, height, camera, workspace,
    } = this.state;
    const newCamera = calcCamera({
      viewportWidth: width,
      viewportHeight: height,
      fovy: camera.fovy,
      near: 0.1,
      far: 2000,
      eye: camera.eye,
      center: camera.center,
      up: camera.up,
      showPerspective: camera.showPerspective,
      machineX: settings.machineBottomLeftX - workspace.workOffsetX,
      machineY: settings.machineBottomLeftY - workspace.workOffsetY,
    });

    if (this.camera) {
      if (sameArrayContent(this.camera.perspective, newCamera.perspective)) {
        newCamera.perspective = this.camera.perspective;
      }
      if (sameArrayContent(this.camera.view, newCamera.view)) {
        newCamera.view = this.camera.view;
      }
    }

    this.camera = newCamera;
  }

  drawFlat = (canvas, gl) => {
    const {
      width, height, workspace, isInverting,
    } = this.state;

    const vsSource = `
      attribute vec4 aVertexPosition;

      uniform mat4 uModelViewMatrix;
      uniform mat4 uProjectionMatrix;

      void main() {
        gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      }
    `;
    const fsSource = `
      precision mediump float;
      uniform bool isInverting;
      void main() {
        if (isInverting) {
          gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
        } else {
          gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
        }
      }
    `;

    const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
    const programInfo = {
      program: shaderProgram,
      attribLocations: {
        vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
      },
      uniformLocations: {
        projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
        modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
        isInverting: gl.getUniformLocation(shaderProgram, 'isInverting'),
      },
    };
    const buffer = initBuffers(gl, width, height);
    drawScene(gl, programInfo, buffer, this.camera, isInverting);

    this.grid.draw(this.drawCommands, {
      perspective: this.camera.perspective,
      view: this.camera.view,
      width: 300,
      height: 210,
      minor: Math.max(settings.toolGridMinorSpacing, 0.1),
      major: Math.max(settings.toolGridMajorSpacing, 1),
    });

    if (workspace.showLaser) {
      const draw = () => {
        this.laserPreview.draw(
          this.drawCommands, this.camera.perspective, this.camera.view,
          workspace.g0Rate, workspace.simTime, workspace.rotaryDiameter, isInverting,
        );
      };
      cacheDrawing(draw, this.drawLaserState, {
        drawCommands: this.drawCommands,
        width: canvas.width,
        height: canvas.height,
        perspective: this.camera.perspective,
        view: this.camera.view,
        g0Rate: workspace.g0Rate,
        simTime: workspace.simTime,
        rotaryDiameter: workspace.rotaryDiameter,
        isInverting,
        arrayVersion: this.laserPreview.arrayVersion,
      });
    } else {
      const draw = () => {
        this.gcodePreview.draw(
          this.drawCommands, this.camera.perspective, this.camera.view,
          workspace.g0Rate, workspace.simTime, workspace.rotaryDiameter, isInverting,
        );
      };
      cacheDrawing(draw, this.drawGcodeState, {
        drawCommands: this.drawCommands,
        width: canvas.width,
        height: canvas.height,
        perspective: this.camera.perspective,
        view: this.camera.view,
        g0Rate: workspace.g0Rate,
        simTime: workspace.simTime,
        rotaryDiameter: workspace.rotaryDiameter,
        isInverting,
        arrayVersion: this.gcodePreview.arrayVersion,
      });
    }

    if (this.position[0] !== 0 && this.position[1] !== 0) {
      const crossPoints = [];
      const crossValue = 5;

      crossPoints.push(
        this.position[0] - crossValue,
        -this.position[1],
        0,
        this.position[0] + crossValue,
        -this.position[1],
        0,
      );
      crossPoints.push(
        this.position[0],
        -this.position[1] - crossValue,
        0,
        this.position[0],
        -this.position[1] + crossValue,
        0,
      );

      const crossPosition = new Float32Array(crossPoints);
      this.drawCommands.basic({
        perspective: this.camera.perspective,
        view: this.camera.view,
        position: crossPosition,
        offset: 0,
        count: 4,
        color: [0, 0.7, 0, 1],
        scale: [1, 1, 1],
        translate: [0, 0, 0],
        primitive: this.drawCommands.gl.LINES,
      });
    }
  };

  private zoomArea = (x1, y1, x2, y2) => {
    const { workspace } = this.state;
    const d = 300;
    const cx = (x1 + x2) / 2 - settings.machineBottomLeftX + workspace.workOffsetX;
    const cy = (y1 + y2) / 2 - settings.machineBottomLeftY + workspace.workOffsetY;
    const fovy = 2 * Math.atan2(Math.max(Math.abs(y2 - y1), Math.abs(x2 - x1) * (workspace.height / workspace.width)) / 2, d);
    this.setState({
      camera: {
        eye: [cx, cy, d],
        center: [cx, cy, 0],
        up: [0, 1, 0],
        fovy,
        showPerspective: false,
      },
    });
  };

  resetView = () => {
    const { workspace } = this.state;
    if (workspace.width !== window.document.getElementById('svg_editor').offsetWidth || workspace.height !== Math.max(dimensions.height, window.document.getElementById('svg_editor').offsetHeight - 200)) {
      this.setState({
        width: window.document.getElementById('svg_editor').offsetWidth,
        height: Math.max(dimensions.height, window.document.getElementById('svg_editor').offsetHeight - 200),
        workspace: {
          ...workspace,
          width: window.document.getElementById('svg_editor').offsetWidth,
          height: Math.max(dimensions.height, window.document.getElementById('svg_editor').offsetHeight - 200),
        },
      }, this.setCamera);
    }
  };

  setCanvas = (canvas) => {
    if (this.canvas === canvas) return;
    this.canvas = canvas;
    if (this.drawCommands) {
      this.drawCommands.destroy();
      this.drawCommands = null;
    }
    if (!canvas) return;
    if (!this.camera) return;

    const gl = canvas.getContext('webgl', { alpha: true, depth: true, preserveDrawingBuffer: true });

    // gl.clearColor(0.0, 0.0, 0.0, 1.0);
    // 透過清除色來清除色彩緩衝區
    // gl.clear(gl.COLOR_BUFFER_BIT);

    this.drawCommands = new DrawCommands(gl);
    // this.props.documentCacheHolder.drawCommands = this.drawCommands;
    this.hitTestFrameBuffer = this.drawCommands.createFrameBuffer(600, 400);

    const draw = () => {
      const { workspace, width, height } = this.state;

      if (!this.canvas) {
        return;
      }

      if (settings.toolDisplayCache) {
        if (this.isUpdating) {
          this.isUpdating = false;
        } else {
          requestAnimationFrame(draw);
          return;
        }
      }

      if (width > 1 && height > 1 && (workspace.width !== width || workspace.height !== height)) {
        this.setWorkspaceAttrs({ width, height });
        if (!workspace.initialZoom) {
          let x = settings.machineBottomLeftX;
          let y = settings.machineBottomLeftY;
          if (!settings.showMachine) {
            x = 0;
            y = 0;
          }
          this.setWorkspaceAttrs({ initialZoom: true });
          this.zoomArea(
            x - 10,
            y - 10,
            x + settings.machineWidth + 10,
            y + settings.machineHeight + 10,
          );
        }
      }

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0.94, 0.94, 0.94, 1);

      // eslint-disable-next-line no-bitwise
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.enable(gl.BLEND);

      this.drawFlat(canvas, gl);

      window.requestAnimationFrame(draw);
    };
    draw();
  };

  private handleStopSim = () => {
    if (this.simInterval) {
      window.clearInterval(this.simInterval);
      this.simInterval = null;
    }
  };

  private handleSimToggle = () => {
    if (this.simInterval) {
      window.clearInterval(this.simInterval);
      this.simInterval = null;
    } else {
      this.simInterval = setInterval(() => {
        const { speedLevel, workspace } = this.state;
        if (workspace.simTime >= this.simTimeMax) {
          window.clearInterval(this.simInterval);
          this.simInterval = null;
          this.forceUpdate();
        } else {
          this.handleSimTimeChange(workspace.simTime + (simTimeUnit / 5) * speedRatio[speedLevel]);
        }
      }, 100);
    }
  };

  private handleSimTimeChange = (value) => {
    const { workspace } = this.state;
    this.position = this.gcodePreview.getSimTimeInfo(Number(value)).position;
    this.setState({
      workspace: {
        ...workspace,
        simTime: Number(value),
      },
    });
  };

  private handleSpeedLevelChange = (speedLevel) => {
    this.setState({ speedLevel });
  };

  onPointerCancel = (e) => {
    e.preventDefault();
    this.pointers = this.pointers.filter((x) => x.pointerId !== e.pointerId);
    this.fingers = null;
  };

  onPointerUp = (e) => {
    e.preventDefault();
    if (!this.pointers.length || e.pointerType !== this.pointers[0].pointerType) return;
    this.pointers = this.pointers.filter((x) => x.pointerId !== e.pointerId);
    this.fingers = null;
  };

  onPointerDown = (e) => {
    e.preventDefault();
    e.target.setPointerCapture(e.pointerId);
    // @ts-ignore
    const p = { left: document.getElementsByClassName('path-preview-panel')[0].offsetLeft, top: document.getElementsByClassName('path-preview-panel')[0].offsetTop };

    if (this.pointers.length && e.pointerType !== this.pointers[0].pointerType) this.pointers = [];

    this.pointers.push({
      pointerId: e.pointerId,
      pointerType: e.pointerType,
      button: e.button,
      pageX: e.pageX - p.left,
      pageY: e.pageY - p.top,
      origPageX: e.pageX - p.left,
      origPageY: e.pageY - p.top,
    });
    // this.movingObjects = false;
    this.moveStarted = false;
    this.fingers = null;

    this.adjustingCamera = true;
  };

  onPointerMove = (e) => {
    // @ts-ignore
    const p = { left: document.getElementsByClassName('path-preview-panel')[0].offsetLeft, top: document.getElementsByClassName('path-preview-panel')[0].offsetTop };
    e.preventDefault();
    const pointer = this.pointers.find((x) => x.pointerId === e.pointerId);
    if (!pointer) return;
    const dx = e.pageX - p.left - pointer.pageX;
    const dy = pointer.pageY - e.pageY + p.top;
    if (Math.abs(dx) >= 10 || Math.abs(dy) >= 10) this.moveStarted = true;
    if (!this.moveStarted) return;
    if (this.adjustingCamera) {
      const { camera } = this.state;
      // @ts-ignore
      pointer.pageX = e.pageX - p.left;
      pointer.pageY = e.pageY - p.top;
      if (e.pointerType === 'touch' && this.pointers.length >= 2) {
        const centerX = this.pointers.reduce((acc, o) => acc + o.pageX, 0) / this.pointers.length;
        const centerY = this.pointers.reduce((acc, o) => acc + o.pageY, 0) / this.pointers.length;
        const distance = dist(
          this.pointers[0].pageX, this.pointers[0].pageY,
          this.pointers[1].pageX, this.pointers[1].pageY,
        );
        if (this.fingers && this.fingers.num === this.pointers.length) {
          if (this.pointers.length === 2) {
            const d = distance - this.fingers.distance;
            const origCenterX = this.pointers.reduce((acc, o) => acc + o.origPageX, 0) / this.pointers.length;
            const origCenterY = this.pointers.reduce((acc, o) => acc + o.origPageY, 0) / this.pointers.length;
            this.zoom(origCenterX, origCenterY, Math.exp(-d / 200));
          } else if (this.pointers.length === 3) {
            const dx = centerX - this.fingers.centerX;
            const dy = centerY - this.fingers.centerY;
            // @ts-ignore
            const rot = mat4.mul([],
              // @ts-ignore
              mat4.fromRotation([], -dy / 100, vec3.cross([], camera.up, vec3.sub([], camera.eye, camera.center))),
              // @ts-ignore
              mat4.fromRotation([], -dx / 100, camera.up));
            this.setCameraAttrs({
              // @ts-ignore
              eye: vec3.add([], vec3.transformMat4([], vec3.sub([], camera.eye, camera.center), rot), camera.center),
              // @ts-ignore
              up: vec3.normalize([], vec3.transformMat4([], camera.up, rot)),
            });
          }
        }
        this.fingers = {
          num: this.pointers.length,
          centerX,
          centerY,
          distance,
        };
      } else {
        this.fingers = null;
        // Rotate not used
        // if (pointer.button === 2) {
        //   // @ts-ignore
        //   const rot = mat4.mul([],
        //     // @ts-ignore
        //     mat4.fromRotation([], dy / 200, vec3.cross([], camera.up, vec3.sub([], camera.eye, camera.center))),
        //     // @ts-ignore
        //     mat4.fromRotation([], -dx / 200, camera.up));
        //   this.setCameraAttrs({
        //     // @ts-ignore
        //     eye: vec3.add([], vec3.transformMat4([], vec3.sub([], camera.eye, camera.center), rot), camera.center),
        //     // @ts-ignore
        //     up: vec3.normalize([], vec3.transformMat4([], camera.up, rot)),
        //   });
        // }
        if (pointer.button === 1) {
          this.zoom(pointer.origPageX, pointer.origPageY, Math.exp(-dy / 200));
        } else if (pointer.button === 0) {
          this.pan(dx / 2, dy / 2);
        }
      }
    }
  };

  wheel = (e) => {
    // @ts-ignore
    const p = { left: document.getElementsByClassName('path-preview-panel')[0].offsetLeft, top: document.getElementsByClassName('path-preview-panel')[0].offsetTop };
    if (e.ctrlKey) {
      this.zoom(e.pageX - p.left, e.pageY - p.top, Math.exp(e.deltaY / 200));
    } else {
      this.pan(-e.deltaX, e.deltaY);
    }
  };

  transferTime = (time) => {
    let h = 0;
    let m = 0;
    let s = 0;
    let restTime = time;

    if (restTime > 60) {
      h = Math.floor(restTime / 60);
      restTime %= 60;
    }

    if (restTime > 1) {
      m = Math.floor(restTime);
      s = Math.floor((restTime - m) * 60);
    } else {
      s = Math.round(restTime * 60);
    }

    let str = '';

    if (h > 0) {
      str += `${h} h `;
    }

    if (m > 0) {
      str += `${m} m `;
    }

    str += `${s} s`;

    return str;
  };

  showSimTime = () => {
    const { workspace } = this.state;
    return this.transferTime(workspace.simTime);
  };

  private renderPlayButtons = () => {
    if (this.simInterval) {
      return (
        <>
          <div style={{ width: '28px', marginLeft: '5px' }} onClick={this.handleSimToggle}>
            <img style={{ width: '28px' }} src="img/Pause.svg" />
          </div>
          <div style={{ width: '28px' }} onClick={this.handleStopSim}>
            <img style={{ width: '28px' }} src="img/Stop.svg" />
          </div>
        </>
      );
    }
    return (
      <div style={{ width: '28px', marginLeft: '5px' }} onClick={this.handleSimToggle}>
        <img style={{ width: '28px' }} src="img/Play.svg" />
      </div>
    );
  };

  private renderPosition = () => {
    if (this.position === -1) {
      return '0, 0 mm';
    }
    return `${Math.round(this.position[0])}, ${Math.round(this.position[1])} mm`;
  };

  private renderSize = () => {
    if (Number.isNaN(this.gcodePreview.maxX)
      || (this.gcodePreview.maxX - this.gcodePreview.minX) < 0
      || (this.gcodePreview.maxY - this.gcodePreview.minY) < 0
    ) {
      return '0 x 0 mm';
    }

    return `${Math.ceil(this.gcodePreview.maxX - this.gcodePreview.minX)} x ${Math.ceil(this.gcodePreview.maxY - this.gcodePreview.minY)} mm`;
  };

  private renderSpeed = () => {
    const { speedLevel } = this.state;
    return `x ${speedRatio[speedLevel]}`;
  };

  handleStartHere = () => {
    const { workspace } = this.state;

    let modifiedGcodeList;

    if (workspace.simTime > 0 && workspace.simTime < this.simTimeMax - simTimeUnit / 2) {
      const simTimeInfo = this.gcodePreview.getSimTimeInfo(Number(workspace.simTime));

      const gcodeList = this.gcodeString.split('\n');
      let target = 0;
      let count = -1;

      for (let i = 0; i < gcodeList.length; i += 1) {
        if (gcodeList[i].indexOf('G1') > -1) {
          count += 1;
        }

        if (count === simTimeInfo.index) {
          target = i;
          break;
        }
      }

      const preparation = [';FLUX Laser Svgeditor Tool', '$H', 'G1S0', 'M25', 'G1 U150', 'G1 X0 Y0', 'G1 F7500.0000'];

      let isEngraving = false;
      let laserDetected = false;
      let U = -1;
      let F = -1;
      for (let i = target; i > 0; i -= 1) {
        if (U < 0 && gcodeList[i].indexOf('G1 U') > -1) {
          const res = gcodeList[i].match(/(?<=G1 U)[-0-9\.]*/);

          U = parseInt(res[0], 10);
        }

        if (F < 0 && gcodeList[i].indexOf('G1 F') > -1) {
          const res = gcodeList[i].match(/(?<=G1 F)[-0-9\.]*/);

          F = parseInt(res[0], 10);
        }

        if (!laserDetected && gcodeList[i].indexOf('G1S0') > -1) {
          isEngraving = false;
          laserDetected = true;
        }

        if (!laserDetected && gcodeList[i].indexOf('G1V0') > -1) {
          isEngraving = true;
          laserDetected = true;
        }

        if (F > 0 && U > 0 && laserDetected) {
          break;
        }
      }

      preparation.push(`G1 U${U}`);
      preparation.push(`G1 X${simTimeInfo.position[0].toFixed(4)} Y${simTimeInfo.position[1].toFixed(4)}`);
      preparation.push(`G1 F${F}`);
      preparation.push(`G1${isEngraving ? 'V' : 'S'}0`);

      modifiedGcodeList = preparation.concat(gcodeList.slice(target));

      console.log('target: ', target, gcodeList);
      console.log('modified', modifiedGcodeList);
      console.log(modifiedGcodeList.join('\n'), '123123');

      ExportFuncs.gcodeToFcode(modifiedGcodeList.join('\n'));
    }
  };

  private toggleIsInverting = () => {
    const { isInverting } = this.state;
    this.setState({ isInverting: !isInverting });
  };

  private toggleTraversalMoves = () => {
    const { workspace } = this.state;
    this.setState({ workspace: { ...workspace, showLaser: !workspace.showLaser } });
  };

  zoom(pageX, pageY, amount) {
    if (!this.canvas) return;
    const r = this.canvas.getBoundingClientRect();
    const { camera } = this.state;
    const newFovy = Math.max(0.1, Math.min(Math.PI - 0.1, camera.fovy * amount));
    // @ts-ignore
    const oldScale = (vec3.distance(camera.eye, camera.center) * Math.tan(camera.fovy / 2)) / (r.height / 2);
    // @ts-ignore
    const newScale = (vec3.distance(camera.eye, camera.center) * Math.tan(newFovy / 2)) / (r.height / 2);
    const dx = Math.round(pageX - (r.left + r.right) / 2) * (newScale - oldScale);
    const dy = Math.round(-pageY + (r.top + r.bottom) / 2) * (newScale - oldScale);
    // @ts-ignore
    const adjX = vec3.scale([], vec3.cross([], vec3.normalize([], vec3.sub([], camera.center, camera.eye)), camera.up), -dx);
    // @ts-ignore
    const adjY = vec3.scale([], camera.up, -dy);
    // @ts-ignore
    const adj = vec3.add([], adjX, adjY);
    // @ts-ignore
    const newEye = vec3.add([], camera.eye, adj);

    this.setCameraAttrs({
      // @ts-ignore
      eye: newEye, // vec3.add([], camera.eye, adj),
      // @ts-ignore
      center: vec3.add([], camera.center, adj),
      fovy: newFovy,
    });
  }

  private pan(dx, dy) {
    const {
      camera, width, height, workspace,
    } = this.state;
    const { view } = calcCamera({
      viewportWidth: width,
      viewportHeight: height,
      fovy: camera.fovy,
      near: 0.1,
      far: 2000,
      // @ts-ignore
      eye: [0, 0, vec3.distance(camera.eye, camera.center)],
      center: [0, 0, 0],
      up: [0, 1, 0],
      showPerspective: false,
      machineX: settings.machineBottomLeftX - workspace.workOffsetX,
      machineY: settings.machineBottomLeftY - workspace.workOffsetY,
    });
    console.log(view, width);
    const scale = 2 / width / view[0];
    dx *= scale;
    dy *= scale;
    // @ts-ignore
    const n = vec3.normalize([], vec3.cross([], camera.up, vec3.sub([], camera.eye, camera.center)));
    console.log(camera);
    this.setCameraAttrs({
      // @ts-ignore
      eye: vec3.add([], camera.eye,
        // @ts-ignore
        vec3.add([], vec3.scale([], n, -dx), vec3.scale([], camera.up, -dy))),
      // @ts-ignore
      center: vec3.add([], camera.center,
        // @ts-ignore
        vec3.add([], vec3.scale([], n, -dx), vec3.scale([], camera.up, -dy))),
    });
  }

  render() {
    const {
      width, height, speedLevel, workspace, isInverting,
    } = this.state;
    const progressBar = () => {
      const percentage = `${Math.round(10000 * (workspace.simTime / this.simTimeMax)) / 100}%`;
      return (
        <input
          className="slider"
          type="range"
          min={0}
          max={this.simTimeMax}
          step={simTimeUnit}
          value={workspace.simTime}
          style={{
            // @ts-ignore Set variable for css to use
            '--percentage': percentage,
          }}
          onChange={(e) => this.handleSimTimeChange(e.target.value)}
        />
      );
    };

    return (
      <div className="path-preview-panel" style={{ touchAction: 'none', userSelect: 'none' }}>
        <Pointable
          touchAction="none"
          onWheel={this.wheel}
          onPointerCancel={this.onPointerCancel}
          onPointerDown={this.onPointerDown}
          onPointerMove={this.onPointerMove}
          onPointerUp={this.onPointerUp}
        >
          <div>
            <canvas
              style={{ width, height }}
              width={Math.round(width * window.devicePixelRatio)}
              height={Math.round(height * window.devicePixelRatio)}
              ref={this.setCanvas}
            />
          </div>
        </Pointable>
        <div style={{ height: '200px', paddingTop: '20px' }}>
          <div>Tools Panel</div>
          <div>
            <div className="label pull-left" />
            <div className="path-preview-slider-container" style={{ height: '60px' }}>
              {progressBar()}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'row' }}>
            {this.renderPlayButtons()}
            <div style={{ display: 'flex' }}>
              <div style={{ padding: '5px 10px', lineHeight: '18px' }}>
                Speed
              </div>
              <div style={{ padding: '5px 10px' }}>
                <input
                  type="range"
                  min={0}
                  max={4}
                  step="1"
                  value={speedLevel}
                  onChange={(e) => this.handleSpeedLevelChange(e.target.value)}
                />
              </div>
              <div style={{ paddingTop: '5px', paddingBottom: '5px', lineHeight: '18px' }}>{this.renderSpeed()}</div>
            </div>
            <div className="switch-control">
              <div className="control" style={{ paddingLeft: '5px' }}>
                <div className="switch-container">
                  <div className="onoffswitch">
                    <input
                      type="checkbox"
                      id="onoffswitch"
                      name="onoffswitch"
                      className="onoffswitch-checkbox"
                      onChange={this.toggleTraversalMoves}
                      checked={workspace.showLaser}
                    />
                    <label className="onoffswitch-label" htmlFor="onoffswitch">
                      <span className="onoffswitch-inner" />
                      <span className="onoffswitch-switch" />
                    </label>
                  </div>
                </div>
              </div>
              <div className="label">Traversal Moves</div>
            </div>
            <div className="switch-control">
              <div className="control" style={{ paddingLeft: '5px' }}>
                <div className="switch-container">
                  <div className="onoffswitch">
                    <input
                      type="checkbox"
                      id="onoffswitch-is-invert"
                      name="onoffswitch-is-invert"
                      className="onoffswitch-checkbox"
                      onChange={this.toggleIsInverting}
                      checked={isInverting}
                    />
                    <label className="onoffswitch-label" htmlFor="onoffswitch-is-invert">
                      <span className="onoffswitch-inner" />
                      <span className="onoffswitch-switch" />
                    </label>
                  </div>
                </div>
              </div>
              <div className="label">Invert</div>
            </div>
            <div style={{ padding: '5px 10px', marginLeft: '5px' }}>
              {this.showSimTime()}
            </div>
            <div />
          </div>
        </div>
        <div id="path-preview-side-panel">
          <div className="title">Preview Data</div>
          <div style={{ marginTop: '10px' }}>
            <div className="data-block">
              <div className="item">Size</div>
              <div className="value">{this.renderSize()}</div>
            </div>
            <div className="data-block">
              <div className="item">Estimated Time</div>
              <div className="value">{this.transferTime(this.simTimeMax)}</div>
            </div>
            <div className="data-block">
              <div className="item">Light Time</div>
              <div className="value">{this.transferTime(this.gcodePreview.g1TimeReal)}</div>
            </div>
            <div className="data-block">
              <div className="item">Rapid Time</div>
              <div className="value">{this.transferTime(this.gcodePreview.g0TimeReal)}</div>
            </div>
            <div className="data-block">
              <div className="item">Cut Distance</div>
              <div className="value">{`${Math.round(this.gcodePreview.g1DistReal)} mm`}</div>
            </div>
            <div className="data-block">
              <div className="item">Rapid Distance</div>
              <div className="value">{`${Math.round(this.gcodePreview.g0DistReal)} mm`}</div>
            </div>
            <div className="data-block">
              <div className="item">Current Position</div>
              <div className="value">{this.renderPosition()}</div>
            </div>
          </div>
          <div className="buttons">
            <div
              className="button start-button"
              onClick={this.handleStartHere}
            >
              Start Here
            </div>
            <div className="button end-button">
              End Preview
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default PathPreview;
