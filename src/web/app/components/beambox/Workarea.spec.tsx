/* eslint-disable import/first */
import * as React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

jest.mock('app/svgedit/operations/clipboard', () => ({
  pasteElements: jest.fn(),
}));

jest.mock('helpers/i18n', () => ({
  lang: {
    beambox: {
      context_menu: {
        cut: 'Cut',
        copy: 'Copy',
        paste: 'Paste',
        paste_in_place: 'Paste in Place',
        delete: 'Delete',
        group: 'Group',
        ungroup: 'Ungroup',
        move_front: 'Bring to Front',
        move_up: 'Bring Forward',
        move_down: 'Send Backward',
        move_back: 'Send to Back',
      },
    },
  },
}));

jest.mock('app/actions/beambox/svg-editor', () => ({
  cutSelected: jest.fn(),
  copySelected: jest.fn(),
  deleteSelected: jest.fn(),
}));

const getSVGAsync = jest.fn();
jest.mock('helpers/svg-editor-helper', () => ({
  getSVGAsync,
}));

const cloneSelectedElements = jest.fn();
const groupSelectedElements = jest.fn();
const ungroupSelectedElement = jest.fn();
const moveTopBottomSelected = jest.fn();
const moveUpSelectedElement = jest.fn();
const moveDownSelectedElement = jest.fn();

getSVGAsync.mockImplementation((callback) => {
  callback({
    Canvas: {
      cloneSelectedElements,
      groupSelectedElements,
      ungroupSelectedElement,
      moveTopBottomSelected,
      moveUpSelectedElement,
      moveDownSelectedElement,
    },
  });
});

function DummyContextMenu() {
  return (
    <div>
      This is dummy ContextMenu
    </div>
  );
}

function DummyContextMenuTrigger() {
  return (
    <div>
      This is dummy ContextMenuTrigger
    </div>
  );
}

function DummyMenuItem() {
  return (
    <div>
      This is dummy MenuItem
    </div>
  );
}

jest.mock('helpers/react-contextmenu', () => ({
  ContextMenu: DummyContextMenu,
  ContextMenuTrigger: DummyContextMenuTrigger,
  MenuItem: DummyMenuItem,
}));

import eventEmitterFactory from 'helpers/eventEmitterFactory';
import Workarea from './Workarea';

describe('test workarea', () => {
  test('should render correctly', () => {
    const eventEmitter = eventEmitterFactory.createEventEmitter('workarea');
    const wrapper = shallow(<Workarea className="mac" />);
    expect(toJson(wrapper)).toMatchSnapshot();
    expect(wrapper.state()).toEqual({
      menuDisabled: false,
      select: false,
      paste: false,
      group: false,
      ungroup: false,
    });
    expect(eventEmitter.eventNames().length).toBe(1);

    eventEmitter.emit('update-context-menu', { select: true, paste: true });
    expect(wrapper.state()).toEqual({
      menuDisabled: false,
      select: true,
      paste: true,
      group: false,
      ungroup: false,
    });

    eventEmitter.emit('update-context-menu', { menuDisabled: true });
    expect(wrapper.state()).toEqual({
      menuDisabled: true,
      select: true,
      paste: true,
      group: false,
      ungroup: false,
    });
    expect(toJson(wrapper)).toMatchSnapshot();

    wrapper.unmount();
    expect(eventEmitter.eventNames().length).toBe(0);
  });
});
