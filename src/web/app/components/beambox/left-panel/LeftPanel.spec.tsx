/* eslint-disable import/first */
import * as React from 'react';
import $ from 'jquery';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';

const on = jest.fn();
jest.mock('helpers/shortcuts', () => ({
  on,
}));

const clearSelection = jest.fn();
const useSelectTool = jest.fn();
const importImage = jest.fn();
const insertText = jest.fn();
const insertRectangle = jest.fn();
const insertEllipse = jest.fn();
const insertLine = jest.fn();
const insertPath = jest.fn();
const insertPolygon = jest.fn();
jest.mock('app/actions/beambox/svgeditor-function-wrapper', () => ({
  clearSelection,
  useSelectTool,
  importImage,
  insertText,
  insertRectangle,
  insertEllipse,
  insertLine,
  insertPath,
  insertPolygon,
}));

jest.mock('app/components/beambox/left-panel/DrawingToolButtonGroup', () => function DrawingToolButtonGroup() {
  return (
    <div>
      This is dummy DrawingToolButtonGroup
    </div>
  );
});

jest.mock('app/components/beambox/left-panel/PreviewToolButtonGroup', () => function PreviewToolButtonGroup() {
  return (
    <div>
      This is dummy PreviewToolButtonGroup
    </div>
  );
});

const TopBarLeftPanelContext = React.createContext({});
jest.mock('app/contexts/TopBarLeftPanelContext', () => ({
  TopBarLeftPanelContext,
}));

jest.mock('helpers/i18n', () => ({
  lang: {
    beambox: {
      left_panel: {
        label: {
          end_preview: 'End Preview',
        },
      },
    },
  },
}));

import LeftPanel from './LeftPanel';

describe('should render correctly', () => {
  test('neither in previewing nor in path previewing', () => {
    Object.defineProperty(window, 'os', {
      value: 'MacOS',
    });
    document.body.innerHTML = `
      <div id="layerpanel"></div>
      <div id="layer-laser-panel-placeholder"></div>
      <div id="svg_editor"></div>
    `;

    const wrapper = mount(
      <TopBarLeftPanelContext.Provider value={{
        isPreviewing: false,
        setShouldStartPreviewController: jest.fn(),
        endPreviewMode: jest.fn(),
      }}
      >
        <LeftPanel
          isPathPreviewing={false}
          togglePathPreview={jest.fn()}
        />
      </TopBarLeftPanelContext.Provider>,
    );
    expect(toJson(wrapper)).toMatchSnapshot();
    expect(document.getElementById('svg_editor').className.split(' ').indexOf('color') !== -1).toBeTruthy();

    $('#layerpanel').mouseup();
    expect(clearSelection).toHaveBeenCalledTimes(1);

    $('#layer-laser-panel-placeholder').mouseup();
    expect(clearSelection).toHaveBeenCalledTimes(2);

    wrapper.unmount();
    expect(document.getElementById('svg_editor').className.split(' ').indexOf('color')).toBe(-1);
  });

  test('not in path previewing', () => {
    Object.defineProperty(window, 'os', {
      value: 'Windows',
    });
    document.body.innerHTML = `
      <div id="layerpanel" />
      <div id="layer-laser-panel-placeholder" />
      <div id="svg_editor" />
    `;
    const setShouldStartPreviewController = jest.fn();
    const endPreviewMode = jest.fn();
    const wrapper = mount(
      <TopBarLeftPanelContext.Provider value={{
        isPreviewing: true,
        setShouldStartPreviewController,
        endPreviewMode,
      }}
      >
        <LeftPanel
          isPathPreviewing={false}
          togglePathPreview={jest.fn()}
        />
      </TopBarLeftPanelContext.Provider>,
    );
    expect(toJson(wrapper)).toMatchSnapshot();

    wrapper.find('PreviewToolButtonGroup').props().endPreviewMode();
    expect(endPreviewMode).toHaveBeenCalledTimes(1);

    wrapper.find('PreviewToolButtonGroup').props().setShouldStartPreviewController();
    expect(setShouldStartPreviewController).toHaveBeenCalledTimes(1);
  });

  test('in path previewing', () => {
    Object.defineProperty(window, 'os', {
      value: 'Windows',
    });
    document.body.innerHTML = `
      <div id="layerpanel" />
      <div id="layer-laser-panel-placeholder" />
      <div id="svg_editor" />
    `;
    const togglePathPreview = jest.fn();
    const wrapper = mount(
      <TopBarLeftPanelContext.Provider value={{
        isPreviewing: false,
        setShouldStartPreviewController: jest.fn(),
        endPreviewMode: jest.fn(),
      }}
      >
        <LeftPanel
          isPathPreviewing
          togglePathPreview={togglePathPreview}
        />
      </TopBarLeftPanelContext.Provider>,
    );
    expect(toJson(wrapper)).toMatchSnapshot();

    wrapper.find('div#Exit-Preview').simulate('click');
    expect(togglePathPreview).toHaveBeenCalledTimes(1);
  });
});
