import React from 'react';

import { ContextMenu, ContextMenuTrigger, MenuItem } from 'helpers/react-contextmenu';
import clipboard from 'app/svgedit/operations/clipboard';
import eventEmitterFactory from 'helpers/eventEmitterFactory';
import i18n from 'helpers/i18n';
import svgEditor from 'app/actions/beambox/svg-editor';
import { getSVGAsync } from 'helpers/svg-editor-helper';

let svgCanvas;
getSVGAsync((globalSVG) => { svgCanvas = globalSVG.Canvas; });

const eventEmitter = eventEmitterFactory.createEventEmitter('workarea');

interface State {
  menuDisabled: boolean,
  select: boolean,
  paste: boolean,
  group: boolean,
  ungroup: boolean,
}

export default class Workarea extends React.PureComponent<{ className: string }, State> {
  constructor(props: { className: string }) {
    super(props);
    this.state = {
      menuDisabled: false,
      select: false,
      paste: false,
      group: false,
      ungroup: false,
    };
  }

  componentDidMount(): void {
    eventEmitter.on('update-context-menu', this.updateContextMenu);
  }

  componentWillUnmount(): void {
    eventEmitter.removeListener('update-context-menu', this.updateContextMenu);
  }

  private updateContextMenu = (newValues) => {
    const newState = {
      ...this.state,
      ...newValues,
    };
    this.setState(newState);
  };

  render(): JSX.Element {
    const LANG = i18n.lang.beambox.context_menu;
    const { className } = this.props;
    const {
      menuDisabled, select, paste, group, ungroup,
    } = this.state;

    const isTouchable = navigator.maxTouchPoints >= 1;
    return (
      <>
        <ContextMenuTrigger
          id="canvas-contextmenu"
          holdToDisplay={isTouchable ? 1000 : -1}
          disable={menuDisabled}
        >
          <div id="workarea" className={className}>
            <div
              id="svgcanvas"
              style={{
                position: 'relative',
              }}
            />
          </div>
        </ContextMenuTrigger>
        <ContextMenu id="canvas-contextmenu">
          <MenuItem disabled={!select} onClick={() => svgEditor.cutSelected()}>
            {LANG.cut}
          </MenuItem>
          <MenuItem disabled={!select} onClick={() => svgEditor.copySelected()}>
            {LANG.copy}
          </MenuItem>
          <MenuItem disabled={!paste} onClick={() => clipboard.pasteElements('mouse')}>
            {LANG.paste}
          </MenuItem>
          <MenuItem disabled={!paste} onClick={() => clipboard.pasteElements('in_place')}>
            {LANG.paste_in_place}
          </MenuItem>
          <MenuItem disabled={!select} onClick={() => svgCanvas.cloneSelectedElements(20, 20)}>
            {LANG.duplicate}
          </MenuItem>
          <div className="seperator" />
          <MenuItem disabled={!select} onClick={() => svgEditor.deleteSelected()}>
            {LANG.delete}
          </MenuItem>
          <div className="seperator" />
          <MenuItem disabled={!select || !group} onClick={() => svgCanvas.groupSelectedElements()}>
            {LANG.group}
          </MenuItem>
          <MenuItem
            disabled={!select || !ungroup}
            onClick={() => svgCanvas.ungroupSelectedElement()}
          >
            {LANG.ungroup}
          </MenuItem>
          <div className="seperator" />
          <MenuItem disabled={!select} onClick={() => svgCanvas.moveTopBottomSelected('top')}>
            {LANG.move_front}
          </MenuItem>
          <MenuItem disabled={!select} onClick={() => svgCanvas.moveUpSelectedElement()}>
            {LANG.move_up}
          </MenuItem>
          <MenuItem disabled={!select} onClick={() => svgCanvas.moveDownSelectedElement()}>
            {LANG.move_down}
          </MenuItem>
          <MenuItem disabled={!select} onClick={() => svgCanvas.moveTopBottomSelected('bottom')}>
            {LANG.move_back}
          </MenuItem>
        </ContextMenu>
      </>
    );
  }
}
