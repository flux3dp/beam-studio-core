import * as React from 'react';
import * as ReactDOM from 'react-dom';
import BeamboxGlobalInteraction from 'app/actions/beambox/beambox-global-interaction';
import ToolPanels, { ToolPanelType } from 'app/views/beambox/Tool-Panels/Tool-Panels';

class ToolPanelsController {
    isVisible: boolean;
    type: ToolPanelType;
    data: { rowcolumn: { row: number; column: number; }; distance: { dx: number; dy: number; }; };
    constructor() {
        this.isVisible = false;
        this.type = 'unknown';
        this.data = {
            rowcolumn: {
                row: 1, column: 1
            },
            distance: {
                dx: 0, dy: 0
            },
        };
        //bind all
        for (let obj = this; obj; obj = Object.getPrototypeOf(obj)){
            for (let name of Object.getOwnPropertyNames(obj)){
                if (typeof this[name] === 'function'){
                    this[name] = this[name].bind(this);
                }
            }
        }
    }

    setVisibility(isVisible) {
        this.isVisible = isVisible;
        if(isVisible) {
            BeamboxGlobalInteraction.onObjectFocus();
        } else {
            BeamboxGlobalInteraction.onObjectBlur();
        }
    }

    setType(type: ToolPanelType) {
        this.type = type;
    }

    setGridArrayRowColumn(x, y) {
        this.data.rowcolumn.row = x;
        this.data.rowcolumn.column = y;
    }

    render() {
        if(this.isVisible) {
            this._render();
        } else {
            this.unmount();
        }
    }

    unmount() {
        this.isVisible = false;
        ReactDOM.unmountComponentAtNode(document.getElementById('tool-panels-placeholder'));
    }

    _render() {
        ReactDOM.render(
            <ToolPanels
                type={this.type}
                data = {this.data}
                unmount = {this.unmount.bind(this)}
            />, document.getElementById('tool-panels-placeholder')
        );
    }
}

const instance = new ToolPanelsController();

export default instance;
