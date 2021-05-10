import ExportFuncs from 'app/actions/beambox/export-funcs';
import Modal from 'app/widgets/Modal';
import React, { createRef } from 'react';
import SelectView from 'app/widgets/Select';
import VerticalSlider from 'app/widgets/Vertical-Slider-Control';
import { getSVGAsync } from 'helpers/svg-editor-helper';

let svgCanvas;
let svgEditor;
getSVGAsync((globalSVG) => { svgCanvas = globalSVG.Canvas; svgEditor = globalSVG.Editor; });


const SerialPort = requireNode('serialport');
const LINES_PER_PAGE = 100;
const TAB_GCODE = 0;
const TAB_CONSOLE = 1;
const TAB_MOVE = 2;
//const MockBinding = require('@serialport/binding-mock');
//SerialPort.Binding = MockBinding
//MockBinding.createPort('/dev/ROBOT', { echo: true, record: true });

interface Props {
  onClose?: () => void,
}

interface State {
  selectedPort: string,
  portOptions: { value: string, label: string, selected: boolean }[],
  file: string|File,
  firstIndex: number,
  currentIndex: number,
  connecting: boolean,
  tab: number,
  consoleText: string,
  gcodeList: string[],
  moveDistance: number,
  moveFeedrate: number,
  isDragingScroll: boolean,
}

class TaskInterpreterPanel extends React.Component<Props, State>{
  private serialPort: any;

  private onDataCB: (data?) => void;

  private gcodePlayerCB: () => void;

  private currentLineNumber: number;

  private nonGcodeLineCount: number;

  private maxBufferNumber: number;

  private playerState: 'idle' | 'play';

  private canvas: HTMLCanvasElement;

  private rightPart: React.RefObject<HTMLDivElement>;

  private taskInput: React.RefObject<HTMLInputElement>;

  private commandInput: React.RefObject<HTMLInputElement>;

  private gcodeCanvas: React.RefObject<HTMLCanvasElement>;

  constructor(props) {
    super(props);
    this.state = {
      selectedPort: null,
      portOptions: [],
      file: null,
      firstIndex: 0,
      currentIndex: 0,
      connecting: false,
      tab: TAB_GCODE,
      consoleText: "",
      // GCode Tab
      gcodeList: [],
      // Move Tab
      moveDistance: 10,
      moveFeedrate: 3000,
      isDragingScroll: false,
    };
    // Serial Port
    this.serialPort = null;
    this.onDataCB = () => { };
    // GCode Tab
    this.currentLineNumber = 0;
    this.playerState = 'idle';

    this.canvas = document.createElement('canvas');
    this.rightPart = createRef();
    this.taskInput = createRef();
    this.gcodeCanvas = createRef();
    this.commandInput = createRef();
  }

  componentDidMount() {
    this.updateSerialPortList();
  }

  componentDidUpdate() {
    const rightPart = this.rightPart.current;
    const gcodeCanvas = this.gcodeCanvas.current;
    if (gcodeCanvas) {
      let scale = Math.min((rightPart.offsetWidth - 4) / svgCanvas.contentW, (rightPart.offsetHeight - 4) / svgCanvas.contentH);
      gcodeCanvas.width = svgCanvas.contentW * scale;
      gcodeCanvas.height = svgCanvas.contentH * scale;
      if (this.canvas) {
        let gcodeCtx = gcodeCanvas.getContext('2d');
        gcodeCtx.drawImage(this.canvas, 0, 0);
      }
    }
  }

  componentWillUnmount() {
    this._stop();
    if (this.serialPort) {
      this.serialPort.close();
    }
  }

  async updateSerialPortList() {
    const { selectedPort } = this.state;
    let portsList = await SerialPort.list();
    const portOptions = portsList.map((p) => {
      return ({
        value: p.path,
        label: p.path,
        selected: selectedPort === p.path
      });
    });
    this.setState({
      portOptions,
      selectedPort: portsList[0].path,
    });
  }

  _handleConnect() {
    const openPort = () => {
      let { selectedPort, consoleText } = this.state;
      this.serialPort = new SerialPort(selectedPort, {
        baudRate: 230400,
        dataBits: 8,
        lock: false
      }, err => {
        if (err) {
          console.log(err);
        } else {
          console.log(`Successfully open port to ${selectedPort}`);
        }
      });

      this.serialPort.on('open', () => {
        console.log('Port Opened');
      });

      this.serialPort.on('close', () => {
        console.log('Port Closed');
      });

      this.serialPort.on('error', err => {
        console.log('Port err:', err);
      });

      this.serialPort.on('drain', () => {
        console.log('drained');
      });

      this.serialPort.on('data', data => {
        console.log('Port:', data.toString());
        consoleText += data.toString();
        if (!data.toString().endsWith('\n')) {
          consoleText += '\n';
        }
        if (this.state.tab === TAB_CONSOLE) {
          this.setState({ consoleText }, () => {
            $('.console').scrollTop(Number.MAX_SAFE_INTEGER);
          });
        }

        this.onDataCB(data.toString());
      });
    }
    if (this.serialPort && this.serialPort.isOpen) {
      this.serialPort.close(err => {
        if (err) {
          console.log('error on closing port', err);
        }
        openPort();
      });
    } else {
      openPort();
    }
    this.setState({ connecting: true });
  }

  handleDisconnect = () => {
    if (this.serialPort && this.serialPort.isOpen) {
      this.serialPort.close(err => {
        if (err) {
          console.log('error on closing port', err);
        }
        this.maxBufferNumber = 0;
      });
    } else {
      console.log('No Current Port');
    }
    this.setState({ connecting: false });
  }

  openFile = () => {
    this.setState({
      file: this.taskInput.current.files[0],
    }, this.importGcode);
  }

  fromScene = async () => {
    let gcodeBlob = await ExportFuncs.getGcode();
    const fileReader = new FileReader();
    fileReader.onloadend = (e) => {
      let gcodeList = (e.target.result as string).split('\n');
      let start = new Date();
      this.renderGcodeCanvas();
      console.log('canvas:', (+new Date()) - (+start));
      this.setState({
        gcodeList,
        file: 'Current Scene',
        firstIndex: 0,
        currentIndex: 0
      });

    }
    fileReader.readAsText(gcodeBlob);
  }

  importGcode = () => {
    const { file } = this.state;
    if (file) {
      let reader = new FileReader();
      reader.onloadend = (e) => {
        let str = e.target.result as string;
        this.setState({
          firstIndex: 0,
          currentIndex: 0,
          gcodeList: str.split('\n'),
        });
        this.renderGcodeCanvas();
      };
      reader.readAsText(file as File);
    } else {
      console.log('No File Read');
    }
  }

  renderGcodeCanvas() {
    const { gcodeList } = this.state;
    const rightPart = this.rightPart.current;
    const gcodeCanvas = this.gcodeCanvas.current;
    let scale = Math.min((rightPart.offsetWidth - 4) / svgCanvas.contentW, (rightPart.offsetHeight - 4) / svgCanvas.contentH);
    const gcodeCtx = gcodeCanvas.getContext("2d");
    this.canvas.width = svgCanvas.contentW * scale;
    this.canvas.height = svgCanvas.contentH * scale;
    gcodeCanvas.width = svgCanvas.contentW * scale;
    gcodeCanvas.height = svgCanvas.contentH * scale;
    gcodeCtx.clearRect(0, 0, gcodeCanvas.width, gcodeCanvas.height);

    let ctx = this.canvas.getContext("2d");
    let [x, y, p1, p2, power] = [0, 0, 0, 0, 0];
    ctx.beginPath();
    ctx.lineWidth = 1;
    scale *= 10;
    for (let i = 0; i < gcodeList.length; i++) {
      if (i % 10000 === 0) {
      }
      let command = gcodeList[i];
      if (command.startsWith('G1 ')) {
        let X = command.match(/(?<=X)[0-9\.]*/);
        let Y = command.match(/(?<=Y)[0-9\.]*/);
        x = X ? scale * parseFloat(X[0]) : x;
        y = Y ? scale * parseFloat(Y[0]) : y;
        if (power > 0) {
          ctx.lineTo(x, y);
        } else {
          ctx.moveTo(x, y);
        }
      } else if(command.indexOf('X2O') >= 0) {
        const res = command.match(/(?<=X2O)[-0-9\.]*/);
        if(res) {
          try {
            let p = parseInt(res[0]);
            if (p >= 0) {
              p1 = p / 255;
            } else {
              p2 = Math.round(-p / 2.55);
            }
            power = p1 * p2;
          } catch (err) {
            console.log(err);
          }
        }
      }
    }

    ctx.stroke();
    ctx.closePath();
    gcodeCtx.drawImage(this.canvas, 0, 0);
  }

  _onListWheel(e) {
    //console.log(e.deltaY);
    const maxScrollTop = $('.gcode-command-container').outerHeight() * LINES_PER_PAGE - $('.gcode-command-list').height();
    const currentScrollTop = $('.gcode-command-list').scrollTop();
    if (e.deltaY > 0 && currentScrollTop === maxScrollTop) {
      this.setState({ firstIndex: this.state.firstIndex + LINES_PER_PAGE / 2 }, () => {
        $('.gcode-command-list').scrollTop(currentScrollTop - $('.gcode-command-container').outerHeight() * (LINES_PER_PAGE / 2));
      });
    } else if (e.deltaY < 0 && currentScrollTop === 0) {
      if (this.state.firstIndex === 0) {
        return;
      } else {
        this.setState({ firstIndex: Math.max(0, this.state.firstIndex - LINES_PER_PAGE / 2) }, () => {
          $('.gcode-command-list').scrollTop(currentScrollTop + $('.gcode-command-container').outerHeight() * (LINES_PER_PAGE / 2));
        });
      }
    }
  }

  _onListScroll(e) {
    const { gcodeList } = this.state;
    let position = (e.target.scrollTop / 20 + this.state.firstIndex) / gcodeList.length * $('.scroll-bar').height(); // 20 = $('.gcode-command-container').outerHeight()
    $('.slider').css({ top: `${position}px` });
  }

  onScrollbarMouseDown = (e: React.MouseEvent) => {
    this.scrollToTargetY(e.clientY);
    this.setState({
      isDragingScroll: true,
    });
  }

  onScrollbarMouseMove = (e: React.MouseEvent) => {
    const { isDragingScroll } = this.state;
    if (isDragingScroll) {
      this.scrollToTargetY(e.clientY);
    }
  }

  onScrollbarMouseUp = (e: React.MouseEvent) => {
    this.setState({
      isDragingScroll: false,
    });
  }

  scrollToTargetY = (clientY: number) => {
    const { gcodeList } = this.state;
    let targetIndex = gcodeList.length * (clientY - $('.scroll-bar').position().top) / $('.scroll-bar').height();
    targetIndex = Math.max(0, Math.min(gcodeList.length - 10, targetIndex));
    //console.log(targetIndex);
    let firstIndex = Math.floor(targetIndex / (LINES_PER_PAGE / 2)) * (LINES_PER_PAGE / 2);
    let scrollTop = targetIndex % (LINES_PER_PAGE / 2) * 20; //20: $('gcode-command-container').outerHeight();
    this.setState({ firstIndex: firstIndex }, () => {
      $('.gcode-command-list').scrollTop(scrollTop);
    });
  }

  scrollToTargetIndex(targetIndex) {
    let firstIndex = Math.floor(targetIndex / (LINES_PER_PAGE / 2)) * (LINES_PER_PAGE / 2);
    let scrollTop = targetIndex % (LINES_PER_PAGE / 2) * 20;
    this.setState({ firstIndex: firstIndex }, () => {
      $('.gcode-command-list').scrollTop(scrollTop);
    });
  }

  sendCommand() {
    let { consoleText } = this.state;
    const command = this.commandInput.current.value;
    if (this.serialPort && this.serialPort.isOpen) {
      let suc = this.serialPort.write(`${command}\n`);
      consoleText += `> ${command}\n`;
      this.setState({ consoleText }, () => {
        $('.console').scrollTop(Number.MAX_SAFE_INTEGER);
      });
      if (suc) {
        console.log(`Successfully write:\n${command}`)
      }
      this.commandInput.current.value = '';
    }
  }

  onConsoleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'x') {
      this._sendCtrlX();
    } else if (e.key === 'Enter') {
      this.sendCommand();
    }
  }

  _sendCtrlX() {
    if (this.serialPort && this.serialPort.isOpen) {
      let suc = this.serialPort.write('\x18');
    }
  }

  _play() {
    if (this.playerState !== 'play') {
      this.playerState = 'play';
      this.gcodePlayerCB = this.playGcodeCurrentLine.bind(this);
      /*
      this.gcodePlayerCB = () => {
          this.playGcodeCurrentLine.bind(this)());
      }*/
      this.playGcodeCurrentLine();
    }
  }

  _nextStep() {
    console.log(this.playerState);
    if (this.playerState !== 'play') {
      this.playerState = 'play';
      this.gcodePlayerCB = () => {
        this.playerState = 'idle';
      }
      this.playGcodeCurrentLine();
    }
  }

  _pause() {
    this.gcodePlayerCB = () => {
      console.log('gcode player paused');
      this.playerState = 'idle';
    }
  }

  _stop() {
    if (this.playerState === 'play') {
      this.playerState = 'idle';
      this.gcodePlayerCB = () => {
        console.log('gcode player stoped');
        this.maxBufferNumber = 20;
        let suc = this.serialPort.write('\x18');
        this.setState({ currentIndex: 0 });
      }
    } else {
      this.setState({ currentIndex: 0 });
    }
  }

  async _waitForHoming() {
    if (this.serialPort && this.serialPort.isOpen) {
      this.serialPort.write('$H\n');
      let res = await this._waitForResponse('ok');
      if (res) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  _waitForResponse(res) {
    return new Promise((resolve, reject) => {
      let suc = false;
      if (this.serialPort && this.serialPort.isOpen) {
        this.onDataCB = (data) => {
          if (res) {
            if (data.startsWith(res)) {
              this.onDataCB = () => { };
              suc = true;
              resolve(data);
            }
          } else {
            this.onDataCB = () => { };
            suc = true;
            resolve(data);
          }
        }
        setTimeout(() => {
          if (!suc) {
            this.playerState = 'idle';
            console.log('Err: Wait for response time out');
            resolve(false);
          }
        }, 3000);
      } else {
        resolve(false);
      }
    });
  }

  _waitForBuffer(n) {
    return new Promise((resolve, reject) => {
      if (this.maxBufferNumber > n) {
        resolve(true);
      } else {
        let interval = window.setInterval(() => {
          if (this.maxBufferNumber > n) {
            resolve(true);
            window.clearInterval(interval);
          } else if (this.playerState === 'idle') {
            resolve(false);
          }
        }, 50);
      }
    });
  }

  async _handleLineModeCommand(cmd, id) {
    if (cmd.startsWith('G')) {
      this.currentLineNumber += 1;
      cmd = `N${this.currentLineNumber} ${cmd}`;
      let c = 0;
      for (let i = 0; i < cmd.length; i++) {
        if (cmd[i] != ' ') {
          let ch = cmd[i].charCodeAt();
          c ^= ch;
          c += ch;
        }
      }
      c %= 65536;
      await this._waitForBuffer(this.currentLineNumber);
      //console.log(`l${this.currentLineNumber + this.nonGcodeLineCount -1}`, cmd);
      this.serialPort.write(`${cmd} *${c}\n`);
      this.onDataCB = (data) => {
        if (data.startsWith('L')) {
          data = data.substring(1).split(' ');
          this.maxBufferNumber = parseInt(data[0]) + 12 - data[1];
        }
        // this._executedIndex = data[0] - data[1] + this.nonGcodeLineCount - 1;
        // console.log(this._executedIndex);
      }
    } else {
      this.nonGcodeLineCount += 1;
    }
  }

  async playGcodeCurrentLine() {
    const { gcodeList } = this.state;
    let { currentIndex } = this.state;
    if (currentIndex === 0) {
      let homeResult = await this._waitForHoming();
      if (!homeResult) {
        return;
      }
      this.serialPort.write('$@\n');
      await this._waitForResponse('CTRL LINECHECK_ENABLED');
      this.currentLineNumber = 0;
      this.nonGcodeLineCount = 0;
      this.maxBufferNumber = 20;
    }
    if (currentIndex < gcodeList.length) {
      let cmd = gcodeList[currentIndex]
      await this._handleLineModeCommand(cmd, currentIndex);
      currentIndex += 1;

      if (currentIndex === gcodeList.length) {
        this.playerState = 'idle';
        this.gcodePlayerCB = () => {
          this.setState({ currentIndex: 0 });
          this.maxBufferNumber = 20;
          console.log('gcode play end');
          //this.serialPort.write('\x18');
        }
      } else {
        this.setState({ currentIndex });
        this.scrollToTargetIndex(currentIndex);
      }
    } else {
      this.playerState = 'idle';
      this.gcodePlayerCB = () => {
        this.setState({ currentIndex: 0 });
        console.log('gcode play end');
      }
    }
    this.gcodePlayerCB();
  }

  _renderConnectButton() {
    if (this.state.connecting) {
      return this.renderButton('pull-right', this.handleDisconnect, '斷');
    } else {
      return this.renderButton('pull-right', () => this._handleConnect(), 'Connect');
    }
  }

  _renderLeftPart() {
    let tabContent;
    switch (this.state.tab) {
      case TAB_GCODE:
        tabContent = this.renderGCodeTab();
        break;
      case TAB_CONSOLE:
        tabContent = this.renderConsoleTab();
        break;
      case TAB_MOVE:
        tabContent = this.renderMoveTab();
        break;
      default:
        break;
    }
    return (
      <div className="left-part">
        {this.renderTabControl()}
        {tabContent}
      </div>
    );
  }

  renderTabControl() {
    return (
      <div className="tab-control">
        {this.renderTabButton(TAB_GCODE, 'GCODE')}
        {this.renderTabButton(TAB_CONSOLE, 'CONSOLE')}
        {this.renderTabButton(TAB_MOVE, 'MOVE')}
      </div>
    );
  }

  renderTabButton(tab, label) {
    let className = tab === this.state.tab ? 'selected pull-left tab-button' : 'pull-left tab-button';
    return this.renderButton(className, () => { this.setState({ tab }) }, label)
  }

  renderGCodeTab() {
    const { gcodeList } = this.state;
    let sliderHeight = Math.max($('.scroll-bar').height() * ((gcodeList.length > 10) ? (10 / gcodeList.length) : 1), 1);
    let ret = [
      <div className="gcode-command-list" onWheel={e => { this._onListWheel(e) }} onScroll={e => { this._onListScroll(e) }} key={'list'}>
        {this.renderGCodeList()}
      </div>,
      <div className="scroll-bar"
        key={'scroll-bar'}
        onMouseDown={this.onScrollbarMouseDown}
        onMouseMove={this.onScrollbarMouseMove}
        onMouseUp={this.onScrollbarMouseUp}
        onMouseLeave={this.onScrollbarMouseUp}>
        <div className="slider" style={{ height: sliderHeight }}>
        </div>
      </div>
    ];
    return ret;
  }

  renderGCodeList() {
    const { gcodeList } = this.state;
    let cmds = [];
    for (let i = this.state.firstIndex; i < Math.min(gcodeList.length, this.state.firstIndex + LINES_PER_PAGE); i++) {
      let current = this.state.currentIndex === i ? 'current' : '';
      cmds.push(
        <div className={`gcode-command-container ${current}`} key={i}>
          <div className="line-index">
            {i}
          </div>
          <div className="gcode-command">
            {gcodeList[i]}
          </div>
        </div>
      )
    }
    return cmds;
  }

  renderConsoleTab() {
    let { connecting, consoleText } = this.state;
    return (
      <div className="console-tab">
        <textarea className="console" disabled value={consoleText} />
        <input type="text"
          className={connecting ? "console-input" : "console-input disabled"}
          disabled={!connecting}
          ref={this.commandInput}
          maxLength={255}
          onKeyDown={this.onConsoleKeyDown}
          placeholder={connecting ? "Type command here" : "Waiting for connection"}
        />
      </div>
    );
  }

  renderMoveTab() {
    let { connecting, moveDistance, moveFeedrate } = this.state;
    return (
      <div className="move-tab">
        <div className="speed-container">
          <div className="title">
            Feedrate
          </div>
          <VerticalSlider
            id="feedrate"
            max={7500}
            min={500}
            step={100}
            defaultValue={moveFeedrate}
            onChange={this.onFeedrateChange}
          />
        </div>
        <div className="move-buttons">
          <div className="row">
            {this.renderButton("pull-left", () => { this.handleMoveButtonClick() }, '1', !connecting)}
            {this.renderButton("pull-left", () => { this.handleMoveButtonClick('up') }, '2', !connecting)}
            {this.renderButton("pull-left", () => { this.handleMoveButtonClick() }, '3', !connecting)}
          </div >
          <div className="row">
            {this.renderButton("pull-left", () => { this.handleMoveButtonClick('left') }, '4', !connecting)}
            {this.renderButton("pull-left", () => { this.handleMoveButtonClick('home') }, '5', !connecting)}
            {this.renderButton("pull-left", () => { this.handleMoveButtonClick('right') }, '6', !connecting)}
          </div>
          <div className="row">
            {this.renderButton("pull-left", () => { this.handleMoveButtonClick() }, '7', !connecting)}
            {this.renderButton("pull-left", () => { this.handleMoveButtonClick('down') }, '8', !connecting)}
            {this.renderButton("pull-left", () => { this.handleMoveButtonClick() }, '9', !connecting)}
          </div>
        </div>
        <div className="distance-container">
          <div className="title">
            Distance
          </div>
          <VerticalSlider
            id="distance"
            max={50}
            min={1}
            step={1}
            defaultValue={moveDistance}
            onChange={this.onDistanceChange}
          />
        </div>
      </div>
    );
  }

  onFeedrateChange = (val: number) => {
    this.setState({ moveFeedrate: val });
  }

  onDistanceChange = (val: number) => {
    this.setState({ moveDistance: val });
  }

  handleMoveButtonClick = (dir?: string) => {
    const { moveDistance, moveFeedrate } = this.state;
    switch (dir) {
      case 'up':
        console.log(`TODO: Send G1 F${moveFeedrate} V${-moveDistance}`);
        break;
      case 'down':
        console.log(`TODO: Send G1 F${moveFeedrate} V${moveDistance}`);
        break;
      case 'left':
        console.log(`TODO: Send G1 F${moveFeedrate} U${-moveDistance}`);
        break;
      case 'right':
        console.log(`TODO: Send G1 F${moveFeedrate} U${moveDistance}`);
        break;
      case 'home':
        console.log(`TODO: Send G28 (does it work?) maybe $H`);
        break;
      default:
        console.warn("Unsupported direction");
    }
  }

  renderButton(className, onClick, label, disabled?: boolean) {
    className = `btn btn-default ${className}`;
    if (disabled) {
      className += ' disabled';
    }
    return (
      <button
        className={className}
        onClick={onClick}
        disabled={disabled}
      >{label}
      </button>
    )
  }

  render() {
    const { onClose } = this.props;
    let leftPart = this._renderLeftPart();
    let { connecting, portOptions } = this.state;
    return (
      <Modal onClose={onClose}>
        <div className='task-interpreter-panel'>
          <div className='select-port'>
            <SelectView
              className={connecting ? 'disabled' : ''}
              disabled={connecting}
              options={portOptions}
              onChange={e => this.setState({ selectedPort: e.target.value })}
            />
            {this._renderConnectButton()}
          </div>
          <div className='file-input'>
            <input type="file" accept=".gcode,.fc,.g" maxLength={255} ref={this.taskInput} />
            {this.renderButton('pull-right', this.openFile, 'Open')}
            {this.renderButton('pull-right', this.fromScene, 'Scene')}
          </div>
          <div className="main-content">
            {leftPart}
            <div ref={this.rightPart} className="right-part">
              <canvas ref="gcodeCanvas" />
            </div>
          </div>
          <div className="footer">
            {this.renderButton('pull-left', () => this._play(), 'Play')}
            {this.renderButton('pull-left', () => this._nextStep(), 'Next Step')}
            {this.renderButton('pull-left', () => this._pause(), 'Pause')}
            {this.renderButton('pull-left', () => this._stop(), 'Stop')}
            {this.renderButton('pull-right', onClose, 'Close')}
          </div>
        </div>
      </Modal>
    );
  }
};

export default TaskInterpreterPanel;
