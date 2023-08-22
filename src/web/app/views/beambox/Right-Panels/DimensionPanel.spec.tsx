/* eslint-disable import/first */
import * as React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

const createBatchCommand = jest.fn();
jest.mock('app/svgedit/HistoryCommandFactory', () => ({
  createBatchCommand,
}));

const get = jest.fn();
jest.mock('implementations/storage', () => ({
  get,
}));

const reRenderImageSymbol = jest.fn();
const reRenderImageSymbolArray = jest.fn();
jest.mock('helpers/symbol-maker', () => ({
  reRenderImageSymbol,
  reRenderImageSymbolArray,
}));

jest.mock('helpers/i18n', () => ({
  lang: {
    beambox: {
      right_panel: {
        object_panel: {
          flip: 'Flip',
          hflip: 'Horizontal Flip',
          vflip: 'Vertical Flip',
        },
      },
    },
    topbar: {
      menu: {
        rotate: "Rotate",
      },
    },
  },
}));

const getSVGAsync = jest.fn();
jest.mock('helpers/svg-editor-helper', () => ({
  getSVGAsync,
}));

const isMobile = jest.fn();
jest.mock('helpers/system-helper', () => ({
  isMobile: () => isMobile(),
}));

const changeSelectedAttribute = jest.fn();
const setSvgElemPosition = jest.fn();
const setRotationAngle = jest.fn();
const beginUndoableChange = jest.fn();
const changeSelectedAttributeNoUndo = jest.fn();
const finishUndoableChange = jest.fn();
const setSvgElemSize = jest.fn();
const addCommandToHistory = jest.fn();
const flipSelectedElements = jest.fn();
getSVGAsync.mockImplementation((callback) => {
  callback({
    Canvas: {
      changeSelectedAttribute,
      setSvgElemPosition,
      setRotationAngle,
      undoMgr: {
        beginUndoableChange,
        finishUndoableChange,
        addCommandToHistory,
      },
      changeSelectedAttributeNoUndo,
      setSvgElemSize,
      flipSelectedElements,
    },
  });
});

import DimensionPanel from './DimensionPanel';

function tick() {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}

describe('should render correctly', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('no elements', () => {
    const wrapper = shallow(<DimensionPanel
      elem={null}
      getDimensionValues={jest.fn()}
      updateDimensionValues={jest.fn()}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('unsupported element', () => {
    document.body.innerHTML = '<unsupported id="svg_1" />';
    const wrapper = shallow(<DimensionPanel
      elem={document.getElementById('svg_1')}
      getDimensionValues={jest.fn()}
      updateDimensionValues={jest.fn()}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('image', async () => {
    const getDimensionValues = jest.fn().mockImplementation((response) => {
      response.dimensionValues = {
        isRatioFixed: true,
        x: 0,
        y: 0,
        width: 1080,
        height: 1526,
        rotation: 0,
      };
    });
    const updateDimensionValues = jest.fn();
    document.body.innerHTML = '<image id="svg_1" />';
    const wrapper = shallow(<DimensionPanel
      elem={document.getElementById('svg_1')}
      getDimensionValues={getDimensionValues}
      updateDimensionValues={updateDimensionValues}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();
    expect(getDimensionValues).toHaveBeenCalledTimes(6);

    const forceUpdate = jest.spyOn(wrapper.instance(), 'forceUpdate');
    wrapper.find('UnitInput').at(0).props().getValue(1);
    expect(changeSelectedAttribute).toHaveBeenCalledTimes(1);
    expect(changeSelectedAttribute).toHaveBeenNthCalledWith(1, 'x', 10, [document.getElementById('svg_1')]);
    expect(setSvgElemPosition).not.toHaveBeenCalled();
    expect(updateDimensionValues).toHaveBeenCalledTimes(1);
    expect(updateDimensionValues).toHaveBeenNthCalledWith(1, {
      x: 10,
    });
    expect(forceUpdate).toHaveBeenCalledTimes(1);

    jest.resetAllMocks();

    wrapper.find('UnitInput').at(1).props().getValue(2);
    expect(changeSelectedAttribute).toHaveBeenCalledTimes(1);
    expect(changeSelectedAttribute).toHaveBeenNthCalledWith(1, 'y', 20, [document.getElementById('svg_1')]);
    expect(setSvgElemPosition).not.toHaveBeenCalled();
    expect(updateDimensionValues).toHaveBeenCalledTimes(1);
    expect(updateDimensionValues).toHaveBeenNthCalledWith(1, {
      y: 20,
    });
    expect(forceUpdate).toHaveBeenCalledTimes(1);

    jest.resetAllMocks();

    wrapper.find('UnitInput').at(2).props().getValue(90);
    expect(setRotationAngle).toHaveBeenCalledTimes(1);
    expect(setRotationAngle).toHaveBeenNthCalledWith(1, 90, false, document.getElementById('svg_1'));
    expect(updateDimensionValues).toHaveBeenCalledTimes(1);
    expect(updateDimensionValues).toHaveBeenNthCalledWith(1, {
      rotation: 90,
    });
    expect(forceUpdate).toHaveBeenCalledTimes(1);

    jest.resetAllMocks();

    wrapper.find('UnitInput').at(3).props().onBlur();
    await tick();
    expect(reRenderImageSymbol).not.toHaveBeenCalled();
    expect(reRenderImageSymbolArray).not.toHaveBeenCalled();
    expect(forceUpdate).not.toHaveBeenCalled();

    jest.resetAllMocks();

    wrapper.find('UnitInput').at(3).props().onKeyUp();
    expect(reRenderImageSymbol).not.toHaveBeenCalled();
    expect(forceUpdate).not.toHaveBeenCalled();

    jest.resetAllMocks();

    const addSubCommand = jest.fn();
    const isEmpty = jest.fn();
    createBatchCommand.mockReturnValue({
      addSubCommand,
      isEmpty,
    });
    wrapper.find('UnitInput').at(3).props().getValue(1240);
    expect(createBatchCommand).toHaveBeenCalledTimes(1);
    expect(createBatchCommand).toHaveBeenNthCalledWith(1, 'Object Panel Size Change');
  });
});

describe('should render correctly in mobile', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    isMobile.mockReturnValue(true);
  });

  test('no elements', () => {
    const wrapper = shallow(<DimensionPanel
      elem={null}
      getDimensionValues={jest.fn()}
      updateDimensionValues={jest.fn()}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('unsupported element', () => {
    document.body.innerHTML = '<unsupported id="svg_1" />';
    const wrapper = shallow(<DimensionPanel
      elem={document.getElementById('svg_1')}
      getDimensionValues={jest.fn()}
      updateDimensionValues={jest.fn()}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('image', async () => {
    const getDimensionValues = jest.fn().mockImplementation((response) => {
      response.dimensionValues = {
        isRatioFixed: true,
        x: 0,
        y: 0,
        width: 1080,
        height: 1526,
        rotation: 0,
      };
    });
    const updateDimensionValues = jest.fn();
    document.body.innerHTML = '<image id="svg_1" />';
    const wrapper = shallow(<DimensionPanel
      elem={document.getElementById('svg_1')}
      getDimensionValues={getDimensionValues}
      updateDimensionValues={updateDimensionValues}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();
    expect(getDimensionValues).toHaveBeenCalledTimes(6);

    const forceUpdate = jest.spyOn(wrapper.instance(), 'forceUpdate');
    wrapper.find('ObjectPanelNumber').at(3).props().updateValue(1);
    expect(changeSelectedAttribute).toHaveBeenCalledTimes(1);
    expect(changeSelectedAttribute).toHaveBeenNthCalledWith(1, 'x', 10, [document.getElementById('svg_1')]);
    expect(setSvgElemPosition).not.toHaveBeenCalled();
    expect(updateDimensionValues).toHaveBeenCalledTimes(1);
    expect(updateDimensionValues).toHaveBeenNthCalledWith(1, {
      x: 10,
    });
    expect(forceUpdate).toHaveBeenCalledTimes(1);

    jest.resetAllMocks();
    isMobile.mockReturnValue(true);

    wrapper.find('ObjectPanelNumber').at(4).props().updateValue(2);
    expect(changeSelectedAttribute).toHaveBeenCalledTimes(1);
    expect(changeSelectedAttribute).toHaveBeenNthCalledWith(1, 'y', 20, [document.getElementById('svg_1')]);
    expect(setSvgElemPosition).not.toHaveBeenCalled();
    expect(updateDimensionValues).toHaveBeenCalledTimes(1);
    expect(updateDimensionValues).toHaveBeenNthCalledWith(1, {
      y: 20,
    });
    expect(forceUpdate).toHaveBeenCalledTimes(1);

    jest.resetAllMocks();
    isMobile.mockReturnValue(true);

    wrapper.find('ObjectPanelNumber').at(2).props().updateValue(90);
    expect(setRotationAngle).toHaveBeenCalledTimes(1);
    expect(setRotationAngle).toHaveBeenNthCalledWith(1, 90, false, document.getElementById('svg_1'));
    expect(updateDimensionValues).toHaveBeenCalledTimes(1);
    expect(updateDimensionValues).toHaveBeenNthCalledWith(1, {
      rotation: 90,
    });
    expect(forceUpdate).toHaveBeenCalledTimes(1);

    const addSubCommand = jest.fn();
    const isEmpty = jest.fn();
    createBatchCommand.mockReturnValue({
      addSubCommand,
      isEmpty,
    });
    wrapper.find('ObjectPanelNumber').at(0).props().updateValue(1240);
    expect(createBatchCommand).toHaveBeenCalledTimes(1);
    expect(createBatchCommand).toHaveBeenNthCalledWith(1, 'Object Panel Size Change');
  });
});
