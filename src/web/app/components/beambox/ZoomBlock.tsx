import * as React from 'react';
import { ContextMenu, ContextMenuTrigger, MenuItem } from 'react-contextmenu';

import constant from 'app/actions/beambox/constant';
import eventEmitterFactory from 'helpers/eventEmitterFactory';
import i18n from 'helpers/i18n';
import macOSWindowSize from 'app/constants/macOS-Window-Size';
import os from 'implementations/os';
import { getSVGAsync } from 'helpers/svg-editor-helper';

let svgCanvas;
getSVGAsync((globalSVG) => { svgCanvas = globalSVG.Canvas; });
const LANG = i18n.lang.beambox.zoom_block;

const eventEmitter = eventEmitterFactory.createEventEmitter('zoom-block');

interface Props {
  getZoom?: () => number;
  setZoom: (zoom: number) => void;
  resetView: () => void;
}

export default class ZoomBlock extends React.Component<Props, { dpmm: number }> {
  constructor(props: Props) {
    super(props);
    this.state = {
      dpmm: 96 / 25.4,
    };
  }

  componentDidMount(): void {
    this.getDpmm();
    eventEmitter.on('UPDATE_ZOOM_BLOCK', this.update);
  }

  componentWillUnmount(): void {
    eventEmitter.removeListener('UPDATE_ZOOM_BLOCK', this.update);
  }

  private update = () => this.forceUpdate();

  private getDpmm = async () => {
    try {
      if (window.os === 'MacOS') {
        const res = await os.process.exec('/usr/sbin/system_profiler SPHardwareDataType | grep Identifier');
        if (!res.stderr) {
          const match = res.stdout.match(/Model Identifier: (.+\b)/);
          if (match) {
            const modelId = match[1];
            const monitorSize = macOSWindowSize[modelId];
            if (monitorSize) {
              const dpi = Math.hypot(window.screen.width, window.screen.height) / monitorSize;
              const dpmm = dpi / 25.4;
              this.setState({ dpmm });
              return;
            }
          }
        }
      } else if (window.os === 'Windows') {
        const res = await os.process.exec('powershell "Get-WmiObject -Namespace root\\wmi -Class WmiMonitorBasicDisplayParams"');
        if (!res.stderr) {
          const matchWidth = res.stdout.match(/MaxHorizontalImageSize[ ]*: (\d+)\b/);
          const matchHeight = res.stdout.match(/MaxVerticalImageSize[ ]*: (\d+)\b/);
          if (matchWidth && matchHeight) {
            const width = Number(matchWidth[1]);
            const height = Number(matchHeight[1]);
            if (!Number.isNaN(width) && !Number.isNaN(height)) {
              const dpmmW = window.screen.width / (width * 10);
              const dpmmH = window.screen.height / (height * 10);
              const avgDpmm = (dpmmW + dpmmH) / 2;
              this.setState({ dpmm: avgDpmm });
              return;
            }
          } else if (matchWidth) {
            const width = Number(matchWidth[1]);
            if (!Number.isNaN(width)) {
              const dpmm = window.screen.width / (width * 10);
              this.setState({ dpmm });
              return;
            }
          } else if (matchHeight) {
            const height = Number(matchHeight[1]);
            if (!Number.isNaN(height)) {
              const dpmm = window.screen.height / (height * 10);
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
            for (let i = 0; i < matches.length; i += 1) {
              const match = matches[i].match(/(\d+)x(\d+)\+\d+\+\d+ (\d+)mm x (\d+)mm\b/);
              if (match) {
                const [q, resW, resH, width, height] = match;
                if (Number(resW) === window.screen.width
                  && Number(resH) === window.screen.height
                  && width > 0
                  && height > 0) {
                  const dpmm = (window.screen.width / width + window.screen.height / height) / 2;
                  this.setState({ dpmm });
                  return;
                }
              }
            }
          }
        }
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }
    const dpmm = 96 / 25.4;
    this.setState({ dpmm });
  };

  private setRatio = (ratioPercentage) => {
    const { setZoom } = this.props;
    const { dpmm } = this.state;
    const ratio = ratioPercentage / 100;
    const targetZoom = ratio * dpmm;
    setZoom(targetZoom);
  };

  private zoomIn = (currentRatio) => {
    const ratioInPercent = Math.round(currentRatio * 100);
    let targetRatio;
    if (ratioInPercent < 500) {
      targetRatio = ratioInPercent + ((10 - (ratioInPercent % 10)) || 10);
    } else {
      targetRatio = ratioInPercent + ((100 - (ratioInPercent % 100)) || 100);
    }
    this.setRatio(targetRatio);
  };

  private zoomOut = (currentRatio) => {
    const ratioInPercent = Math.round(currentRatio * 100);
    let targetRatio;
    if (ratioInPercent <= 500) {
      targetRatio = ratioInPercent - (ratioInPercent % 10 || 10);
    } else {
      targetRatio = ratioInPercent - (ratioInPercent % 100 || 100);
    }
    this.setRatio(targetRatio);
  };

  private calculateCurrentRatio() {
    const { getZoom } = this.props;
    const { dpmm } = this.state;
    if ((!getZoom && !svgCanvas) || !dpmm) {
      return 1;
    }
    const zoom = getZoom ? getZoom() : (svgCanvas.getZoom() * constant.dpmm);
    const ratio = zoom / dpmm;
    return ratio;
  }

  render(): JSX.Element {
    const { resetView } = this.props;
    const ratio = this.calculateCurrentRatio();
    const ratioInPercent = Math.round(ratio * 100);
    return (
      <div className="zoom-block">
        <ContextMenuTrigger id="zoom-block-contextmenu" holdToDisplay={-1}>
          <div className="zoom-btn zoom-out" onClick={() => this.zoomOut(ratio)}>
            <img src="img/icon-minus.svg" />
          </div>
          <ContextMenuTrigger id="zoom-block-contextmenu" holdToDisplay={0}>
            <div className="zoom-ratio">
              {`${ratioInPercent}%`}
            </div>
          </ContextMenuTrigger>
          <div className="zoom-btn zoom-in" onClick={() => this.zoomIn(ratio)}>
            <img src="img/icon-plus.svg" />
          </div>
        </ContextMenuTrigger>
        <ContextMenu id="zoom-block-contextmenu">
          <MenuItem onClick={resetView}>{LANG.fit_to_window}</MenuItem>
          <MenuItem onClick={() => this.setRatio(25)}>25 %</MenuItem>
          <MenuItem onClick={() => this.setRatio(50)}>50 %</MenuItem>
          <MenuItem onClick={() => this.setRatio(75)}>75 %</MenuItem>
          <MenuItem onClick={() => this.setRatio(100)}>100 %</MenuItem>
          <MenuItem onClick={() => this.setRatio(150)}>150 %</MenuItem>
          <MenuItem onClick={() => this.setRatio(200)}>200 %</MenuItem>
        </ContextMenu>
      </div>
    );
  }
}
