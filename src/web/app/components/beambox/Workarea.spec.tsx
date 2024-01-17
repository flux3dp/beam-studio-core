/* eslint-disable import/first */
import React from 'react';
import { render } from '@testing-library/react';

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

jest.mock('helpers/react-contextmenu', () => ({
  ContextMenu: 'dummy-context-menu',
  ContextMenuTrigger: 'dummy-context-menu-trigger',
  MenuItem: 'dummy-menu-item',
}));

import eventEmitterFactory from 'helpers/eventEmitterFactory';
import Workarea from './Workarea';

describe('test workarea', () => {
  test('should render correctly', async () => {
    const eventEmitter = eventEmitterFactory.createEventEmitter('workarea');
    const { container, getByText, unmount } = render(<Workarea className="mac" />);
    expect(container).toMatchSnapshot();

    const checkState = (state: {
      menuDisabled: boolean;
      select: boolean;
      paste: boolean;
      group: boolean;
      ungroup: boolean;
    }) => {
      const menuDisabled =
        container.querySelector('#canvas-contextmenu').getAttribute('disable') === 'true';
      const select = getByText('Cut').getAttribute('disabled') === 'false';
      const paste = getByText('Paste').getAttribute('disabled') === 'false';
      const group = select
        ? getByText('Group').getAttribute('disabled') === 'false'
        : expect.anything();
      const ungroup = select
        ? getByText('Ungroup').getAttribute('disabled') === 'false'
        : expect.anything();
      expect(state).toEqual({ menuDisabled, select, paste, group, ungroup });
    };

    checkState({
      menuDisabled: false,
      select: false,
      paste: false,
      group: false,
      ungroup: false,
    });
    expect(eventEmitter.eventNames().length).toBe(1);

    eventEmitter.emit('update-context-menu', { select: true, paste: true });
    await new Promise((resolve) => setTimeout(resolve, 0));
    checkState({
      menuDisabled: false,
      select: true,
      paste: true,
      group: false,
      ungroup: false,
    });

    eventEmitter.emit('update-context-menu', { menuDisabled: true });
    await new Promise((resolve) => setTimeout(resolve, 0));
    checkState({
      menuDisabled: true,
      select: true,
      paste: true,
      group: false,
      ungroup: false,
    });
    expect(container).toMatchSnapshot();

    unmount();
    expect(eventEmitter.eventNames().length).toBe(0);
  });
});
