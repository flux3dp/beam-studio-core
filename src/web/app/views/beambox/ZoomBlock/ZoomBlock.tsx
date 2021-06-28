import * as React from 'react';
import { ContextMenu, ContextMenuTrigger, MenuItem } from 'react-contextmenu';

import Constant from 'app/actions/beambox/constant';
import i18n from 'helpers/i18n';
import macOSWindowSize from 'app/constants/macOS-Window-Size';
import os from 'implementations/os';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import { ZoomBlockContext } from 'app/views/beambox/ZoomBlock/contexts/ZoomBlockContext';

let svgCanvas;
let svgEditor;
getSVGAsync((globalSVG) => { svgCanvas = globalSVG.Canvas; svgEditor = globalSVG.Editor; });
const LANG = i18n.lang.beambox.zoom_block;

export class ZoomBlock extends React.Component<{}, { dpmm: number }> {
  constructor(props) {
    super(props);
    this.state = {
      dpmm: 96 / 25.4,
    };
  }

  componentDidMount() {
    this.getDpmm();
  }

  getDpmm = async () => {
    try {
      if (window.os === 'MacOS') {
        const res = await os.process.exec('/usr/sbin/system_profiler SPHardwareDataType | grep Identifier');
        if (!res.stderr) {
          const match = res.stdout.match(/(?<=Model Identifier: ).+\b/);
          if (match) {
            const modelId = match[0];
            const monitorSize = macOSWindowSize[modelId];
            if (monitorSize) {
              const dpi = Math.hypot(screen.width, screen.height) / monitorSize;
              const dpmm = dpi / 25.4;
              this.setState({ dpmm });
              return;
            }
          }
        }
      } else if (window.os === 'Windows') {
        const res = await os.process.exec('powershell "Get-WmiObject -Namespace root\\wmi -Class WmiMonitorBasicDisplayParams"');
        if (!res.stderr) {
          const matchWidth = res.stdout.match(/(?<=MaxHorizontalImageSize[\ ]*: )\d+\b/);
          const matchHeight = res.stdout.match(/(?<=MaxVerticalImageSize[\ ]*: )\d+\b/);
          if (matchWidth && matchHeight) {
            const width = Number(matchWidth);
            const height = Number(matchHeight);
            if (!isNaN(width) && !isNaN(height)) {
              const dpmm = (screen.width / (width * 10) + screen.height / (height * 10)) / 2;
              this.setState({ dpmm });
              return;
            }
          } else if (matchWidth) {
            const width = Number(matchWidth);
            if (!isNaN(width)) {
              const dpmm = screen.width / (width * 10);
              this.setState({ dpmm });
              return;
            }
          } else if (matchHeight) {
            const height = Number(matchHeight);
            if (!isNaN(height)) {
              const dpmm = screen.height / (height * 10);
              this.setState({ dpmm });
              return;
            }
          }
        }
      } else if (window.os === 'Linux') {
        const res = await os.process.exec('xrandr | grep \' connected\'');
        if (!res.stderr) {
          const matches = res.stdout.match(/\d+x\d+\+\d+\+\d+ \d+mm x \d+mm\b/g);
          if (matches && matches.length > 0) {
            for (let i = 0; i < matches.length; i++) {
              const match = matches[i].match(/(\d+)x(\d+)\+\d+\+\d+ (\d+)mm x (\d+)mm\b/);
              if (match) {
                const [q, resW, resH, width, height] = match;
                if (Number(resW) === screen.width && Number(resH) === screen.height && width > 0 && height > 0) {
                  const dpmm = (screen.width / width + screen.height / height) / 2;
                  this.setState({ dpmm });
                  return;
                }
              }
            }
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
    const dpmm = 96 / 25.4;
    this.setState({ dpmm });
  }

  calculatCurrentRatio() {
    const { dpmm } = this.state;
    if (!svgCanvas || !dpmm) {
      return 1;
    }
    const ratio = svgCanvas.getZoom() * Constant.dpmm / dpmm;
    return ratio;
  }

  setRatio = (ratio) => {
    const { dpmm } = this.state;
    ratio /= 100;
    const targetZoom = ratio * dpmm / Constant.dpmm;
    svgEditor.zoomChanged(window, { zoomLevel: targetZoom })
  }

  zoomIn = (currentRatio) => {
    const ratioInPercent = Math.round(currentRatio * 100);
    let targetRatio;
    if (ratioInPercent < 500) {
      targetRatio = ratioInPercent + ((10 - ratioInPercent % 10) || 10);
    } else {
      targetRatio = ratioInPercent + ((100 - ratioInPercent % 100) || 100);
    }
    this.setRatio(targetRatio);
  }

  zoomOut = (currentRatio) => {
    const ratioInPercent = Math.round(currentRatio * 100);
    let targetRatio;
    if (ratioInPercent <= 500) {
      targetRatio = ratioInPercent - (ratioInPercent % 10 || 10);
    } else {
      targetRatio = ratioInPercent - (ratioInPercent % 100 || 100);
    }
    this.setRatio(targetRatio);
  }

  render() {
    const ratio = this.calculatCurrentRatio();
    const ratioInPercent = Math.round(ratio * 100);
    return (
      <div className='zoom-block'>
        <ContextMenuTrigger id='zoom-block-contextmenu' holdToDisplay={-1}>
          <div className='zoom-btn zoom-out' onClick={() => this.zoomOut(ratio)}>
            <img src='img/icon-minus.svg' />
          </div>
          <ContextMenuTrigger id='zoom-block-contextmenu' holdToDisplay={0}>
            <div className='zoom-ratio'>
              {`${ratioInPercent}%`}
            </div>
          </ContextMenuTrigger>
          <div className='zoom-btn zoom-in' onClick={() => this.zoomIn(ratio)}>
            <img src='img/icon-plus.svg' />
          </div>
        </ContextMenuTrigger>
        <ContextMenu id='zoom-block-contextmenu'>
          <MenuItem attributes={{ id:"fit_to_window" }} onClick={() => svgEditor.resetView()}>{LANG.fit_to_window}</MenuItem>
          <MenuItem attributes={{ id:"ratio_25%" }} onClick={() => this.setRatio(25)}>{'25 %'}</MenuItem>
          <MenuItem attributes={{ id:"ratio_50%" }} onClick={() => this.setRatio(50)}>{'50 %'}</MenuItem>
          <MenuItem attributes={{ id:"ratio_75%" }} onClick={() => this.setRatio(75)}>{'75 %'}</MenuItem>
          <MenuItem attributes={{ id:"ratio_100%" }} onClick={() => this.setRatio(100)}>{'100 %'}</MenuItem>
          <MenuItem attributes={{ id:"ratio_150%" }} onClick={() => this.setRatio(150)}>{'150 %'}</MenuItem>
          <MenuItem attributes={{ id:"ratio_200%" }} onClick={() => this.setRatio(200)}>{'200 %'}</MenuItem>
        </ContextMenu>
      </div>
    );
  }
};

ZoomBlock.contextType = ZoomBlockContext;
