import $ from 'jquery';
import classNames from 'classnames';
import React from 'react';

import Constant from 'app/actions/beambox/constant';
import i18n from 'helpers/i18n';
import IntervalPanel from 'app/views/beambox/Tool-Panels/Interval';
import NestGAPanel from 'app/views/beambox/Tool-Panels/NestGA';
import NestRotationPanel from 'app/views/beambox/Tool-Panels/NestRotation';
import NestSpacingPanel from 'app/views/beambox/Tool-Panels/NestSpacing';
import OffsetCornerPanel from 'app/views/beambox/Tool-Panels/OffsetCorner';
import OffsetDirPanel from 'app/views/beambox/Tool-Panels/OffsetDir';
import OffsetDistPanel from 'app/views/beambox/Tool-Panels/OffsetDist';
import RowColumnPanel from 'app/views/beambox/Tool-Panels/RowColumn';
import storage from 'implementations/storage';
import { getSVGAsync } from 'helpers/svg-editor-helper';

let svgCanvas;
let svgEditor;
getSVGAsync((globalSVG) => { svgCanvas = globalSVG.Canvas; svgEditor = globalSVG.Editor; });

const LANG = i18n.lang.beambox.tool_panels;

let _mm2pixel = function (pixel_input) {
  const dpmm = Constant.dpmm;
  return Number(pixel_input * dpmm);
};

const validPanelsMap = {
  'unknown': [],
  'gridArray': ['rowColumn', 'distance'],
  'offset': ['offsetDir', 'offsetCorner', 'offsetDist'],
  'nest': ['nestOffset', 'nestRotation', 'nestGA'],
};

export type ToolPanelType = 'unknown' | 'gridArray' | 'offset' | 'nest';

interface Props {
  type: ToolPanelType;
  data: any;
  unmount: () => void;
}

class ToolPanel extends React.Component<Props> {
  private offset: {
    dir: number,
    distance: number,
    cornerType: string,
  };

  private nestOptions: {
    spacing: number,
    generations: number,
    population: number,
    rotations: number,
  };

  constructor(props) {
    super(props);
    this._setArrayRowColumn = this._setArrayRowColumn.bind(this);
    this._setArrayDistance = this._setArrayDistance.bind(this);
    this._setOffsetDir = this._setOffsetDir.bind(this);
    this._setOffsetCorner = this._setOffsetCorner.bind(this);
    this._setOffsetDist = this._setOffsetDist.bind(this);
    this.offset = {
      dir: 1, // 1 for outward, 0 for inward
      distance: 5,
      cornerType: 'sharp'
    };
    this.nestOptions = {
      spacing: 0,
      generations: 3,
      population: 10,
      rotations: 1
    }
  }

  _setArrayRowColumn(rowcolumn) {
    this.props.data.rowcolumn = rowcolumn;
    let rc = rowcolumn;
    this.setState({ rowcolumn: rc });
  };

  _setArrayDistance(distance) {
    this.props.data.distance = distance;
    let d = distance;
    this.setState({ distance: d });
  };

  _setOffsetDir(dir) {
    this.offset.dir = dir;
  };

  _setOffsetDist(val) {
    this.offset.distance = val;
  };

  _setOffsetCorner(val) {
    this.offset.cornerType = val;
  }

  renderPanels() {
    const data = this.props.data;
    const validPanels = validPanelsMap[this.props.type] || validPanelsMap['unknown'];
    let panelsToBeRender = [];

    for (let i = 0; i < validPanels.length; ++i) {
      const panelName = validPanels[i];
      let panel;
      switch (panelName) {
        case 'rowColumn':
          panel = <RowColumnPanel
            key={panelName} {...data.rowcolumn} onValueChange={this._setArrayRowColumn}
          />;
          break;
        case 'distance':
          panel = <IntervalPanel
            key={panelName} {...data.distance} onValueChange={this._setArrayDistance}
          />;
          break;
        case 'offsetDir':
          panel = <OffsetDirPanel
            key={panelName} dir={this.offset.dir} onValueChange={this._setOffsetDir}
          />;
          break;
        case 'offsetCorner':
          panel = <OffsetCornerPanel
            key={panelName} cornerType={this.offset.cornerType} onValueChange={this._setOffsetCorner}
          />;
          break;
        case 'offsetDist':
          panel = <OffsetDistPanel
            key={panelName} distance={this.offset.distance} onValueChange={this._setOffsetDist}
          />;
          break;
        case 'nestOffset':
          panel = <NestSpacingPanel
            key={panelName} spacing={this.nestOptions.spacing} onValueChange={(val) => { this.nestOptions.spacing = val; }}
          />;
          break;
        case 'nestGA':
          panel = <NestGAPanel
            key={panelName} nestOptions={this.nestOptions} updateNestOptions={(options) => { this.nestOptions = { ...this.nestOptions, ...options } }}
          />;
          break;
        case 'nestRotation':
          panel = <NestRotationPanel
            key={panelName} rotations={this.nestOptions.rotations} onValueChange={(val) => { this.nestOptions.rotations = val; }}
          />;
          break;
        //case 'button':          panel = <div; break;
      }
      panelsToBeRender.push(panel);
    };
    return panelsToBeRender;
  }

  renderTitle() {
    const type = this.props.type;
    const titleMap = {
      'gridArray': LANG.grid_array,
      'offset': LANG.offset,
    }
    const title = titleMap[type];
    return (
      <div className="tool-panel">
        <label className="controls accordion">
          <input type="checkbox" className="accordion-switcher" defaultChecked={true} />
          <p className="caption">
            <span className="value">{title}</span>
          </p>
        </label>
      </div>
    )
  }

  renderButtons() {
    let _onCancel = () => {
      this.props.unmount();
      svgCanvas.setMode('select');
      $('.tool-btn').removeClass('active');
      $('#left-Cursor').addClass('active');
    };
    let _onYes = () => { this.props.unmount() };
    const type = this.props.type;
    switch (type) {
      case 'gridArray':
        _onYes = () => {
          let data = this.props.data;
          let distance = {
            dx: _mm2pixel(data.distance.dx),
            dy: _mm2pixel(data.distance.dy)
          };
          svgCanvas.gridArraySelectedElement(distance, data.rowcolumn);
          this.props.unmount();
          svgCanvas.setMode('select');
          $('.tool-btn').removeClass('active');
          $('#left-Cursor').addClass('active');
          svgCanvas.setHasUnsavedChange(true);
        }
        break;
      case 'offset':
        _onYes = () => {
          svgCanvas.offsetElements(this.offset.dir, _mm2pixel(this.offset.distance), this.offset.cornerType);

          this.props.unmount();
          svgCanvas.setMode('select');
          $('.tool-btn').removeClass('active');
          $('#left-Cursor').addClass('active');
          svgCanvas.setHasUnsavedChange(true);
        }
        break;
      case 'nest':
        _onYes = () => {
          this.nestOptions.spacing *= 10;//pixel to mm
          svgCanvas.nestElements(null, null, this.nestOptions);

          this.props.unmount();
          svgCanvas.setMode('select');
          $('.tool-btn').removeClass('active');
          $('#left-Cursor').addClass('active');
        }
    }
    return (
      <div className="tool-block">
        <div className="btn-h-group">
          <button className="btn btn-default primary" onClick={() => { _onYes() }}>{LANG.confirm}</button>
          <button className="btn btn-default" onClick={_onCancel}>{LANG.cancel}</button>
        </div>
      </div>
    );
  }

  _findPositionStyle() {
    const positionStyle = {
      position: 'absolute',
      zIndex: 10,
      bottom: 10,
      left: $('.left-toolbar').width(),
    } as React.CSSProperties;
    return positionStyle;
  }

  render() {
    const lang = storage.get('active-lang') || 'en';
    const positionStyle = this._findPositionStyle();
    const classes = classNames('tool-panels', lang);
    return (
      <div id="beamboxToolPanel" className={classes} style={positionStyle}>
        {this.renderTitle()}
        {this.renderPanels()}
        {this.renderButtons()}
      </div>
    );
  }
};

export default ToolPanel;
