/* eslint-disable import/first */
import * as React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

const showPhotoEditPanel = jest.fn();
jest.mock('app/actions/dialog-caller', () => ({
  showPhotoEditPanel,
}));

const getFileFromDialog = jest.fn();
jest.mock('implementations/dialog', () => ({
  getFileFromDialog,
}));

const convertTextToPathFluxsvg = jest.fn();
jest.mock('app/actions/beambox/font-funcs', () => ({
  convertTextToPathFluxsvg,
}));

const generateStampBevel = jest.fn();
const colorInvert = jest.fn();
jest.mock('helpers/image-edit', () => ({
  generateStampBevel,
  colorInvert,
}));

const openNonstopProgress = jest.fn();
const popById = jest.fn();
jest.mock('app/actions/progress-caller', () => ({
  openNonstopProgress,
  popById,
}));

const toSelectMode = jest.fn();
jest.mock('app/svgedit/textactions', () => ({
  isEditing: true,
  toSelectMode,
}));

jest.mock('helpers/i18n', () => ({
  lang: {
    beambox: {
      right_panel: {
        object_panel: {
          actions_panel: {
            replace_with: 'Replace With...',
            trace: 'Trace',
            grading: 'Grading',
            sharpen: 'Sharpen',
            crop: 'Crop',
            bevel: 'Bevel',
            invert: 'Invert',
            convert_to_path: 'Convert to Path',
            wait_for_parsing_font: 'Parsing font... Please wait a second',
            offset: 'Offset',
            array: 'Array',
            decompose_path: 'Decompose',
            disassemble_use: 'Disassemble',
            disassembling: 'Disassembling...',
            ungrouping: 'Ungrouping...',
          },
        },
      },
    },
  },
}));

const getSVGAsync = jest.fn();
jest.mock('helpers/svg-editor-helper', () => ({
  getSVGAsync,
}));

const calculateTransformedBBox = jest.fn();
const clearSelection = jest.fn();
const convertToPath = jest.fn();
const imageToSVG = jest.fn();
const decomposePath = jest.fn();
const disassembleUse2Group = jest.fn();
const replaceBitmap = jest.fn();
const triggerGridTool = jest.fn();
const triggerOffsetTool = jest.fn();
const pathActions = {
  toEditMode: jest.fn(),
};

getSVGAsync.mockImplementation((callback) => {
  callback({
    Canvas: {
      calculateTransformedBBox,
      clearSelection,
      convertToPath,
      imageToSVG,
      decomposePath,
      disassembleUse2Group,
      pathActions,
    },
    Editor: {
      replaceBitmap,
      triggerGridTool,
      triggerOffsetTool,
    },
  });
});

import ActionsPanel from './ActionsPanel';

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
    const wrapper = shallow(<ActionsPanel
      elem={null}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('image', async () => {
    document.body.innerHTML = '<image id="svg_1" />';
    const wrapper = shallow(<ActionsPanel
      elem={document.getElementById('svg_1')}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();

    const blob = new Blob();
    getFileFromDialog.mockResolvedValueOnce(blob);
    wrapper.find('div.btn-container').at(0).simulate('click');
    await tick();
    expect(getFileFromDialog).toHaveBeenCalledTimes(1);
    expect(getFileFromDialog).toHaveBeenNthCalledWith(1, {
      filters: [
        {
          name: 'Images',
          extensions: ['png', 'jpg', 'jpeg', 'jpe', 'jif', 'jfif', 'jfi', 'bmp', 'jp2', 'j2k', 'jpf', 'jpx', 'jpm'],
        },
      ],
    });
    expect(replaceBitmap).toHaveBeenCalledTimes(1);
    expect(replaceBitmap).toHaveBeenNthCalledWith(1, blob, document.getElementById('svg_1'));

    jest.resetAllMocks();
    getFileFromDialog.mockResolvedValueOnce(null);
    wrapper.find('div.btn-container').at(0).simulate('click');
    await tick();
    expect(replaceBitmap).not.toHaveBeenCalled();

    wrapper.find('div.btn-container').at(1).simulate('click');
    expect(imageToSVG).toHaveBeenCalledTimes(1);

    wrapper.find('div.btn-container').at(2).simulate('click');
    expect(showPhotoEditPanel).toHaveBeenCalledTimes(1);
    expect(showPhotoEditPanel).toHaveBeenNthCalledWith(1, 'curve');

    wrapper.find('div.btn-container').at(3).simulate('click');
    expect(showPhotoEditPanel).toHaveBeenCalledTimes(2);
    expect(showPhotoEditPanel).toHaveBeenNthCalledWith(2, 'sharpen');

    wrapper.find('div.btn-container').at(4).simulate('click');
    expect(showPhotoEditPanel).toHaveBeenCalledTimes(3);
    expect(showPhotoEditPanel).toHaveBeenNthCalledWith(3, 'crop');

    wrapper.find('div.btn-container').at(5).simulate('click');
    expect(generateStampBevel).toHaveBeenCalledTimes(1);
    expect(generateStampBevel).toHaveBeenNthCalledWith(1, document.getElementById('svg_1'));

    wrapper.find('div.btn-container').at(6).simulate('click');
    expect(colorInvert).toHaveBeenCalledTimes(1);
    expect(colorInvert).toHaveBeenNthCalledWith(1, document.getElementById('svg_1'));

    wrapper.find('div.btn-container').at(7).simulate('click');
    expect(triggerGridTool).toHaveBeenCalledTimes(1);
  });

  test('text', async () => {
    document.body.innerHTML = '<text id="svg_1" />';
    const wrapper = shallow(<ActionsPanel
      elem={document.getElementById('svg_1')}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();

    convertTextToPathFluxsvg.mockResolvedValueOnce({});
    calculateTransformedBBox.mockReturnValue({ x: 1, y: 2 });
    wrapper.find('div.btn-container').at(0).simulate('click');
    await tick();
    expect(openNonstopProgress).toHaveBeenCalledTimes(1);
    expect(openNonstopProgress).toHaveBeenNthCalledWith(1, { id: 'convert-font', message: 'Parsing font... Please wait a second' });
    expect(calculateTransformedBBox).toHaveBeenCalledTimes(1);
    expect(calculateTransformedBBox).toHaveBeenNthCalledWith(1, document.getElementById('svg_1'));
    expect(toSelectMode).toHaveBeenCalledTimes(1);
    expect(clearSelection).toHaveBeenCalledTimes(1);
    expect(convertTextToPathFluxsvg).toHaveBeenCalledTimes(1);
    expect(convertTextToPathFluxsvg).toHaveBeenNthCalledWith(1, document.getElementById('svg_1'), { x: 1, y: 2 });
    expect(popById).toHaveBeenCalledTimes(1);
    expect(popById).toHaveBeenNthCalledWith(1, 'convert-font');

    wrapper.find('div.btn-container').at(1).simulate('click');
    expect(triggerGridTool).toHaveBeenCalledTimes(1);
  });

  test('path', () => {
    document.body.innerHTML = '<path id="svg_1" />';
    const wrapper = shallow(<ActionsPanel
      elem={document.getElementById('svg_1')}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();

    wrapper.find('div.btn-container').at(0).simulate('click');
    expect(pathActions.toEditMode).toHaveBeenCalledTimes(1);

    wrapper.find('div.btn-container').at(1).simulate('click');
    expect(decomposePath).toHaveBeenCalledTimes(1);

    wrapper.find('div.btn-container').at(2).simulate('click');
    expect(triggerOffsetTool).toHaveBeenCalledTimes(1);

    wrapper.find('div.btn-container').at(3).simulate('click');
    expect(triggerGridTool).toHaveBeenCalledTimes(1);
  });

  test('rect', () => {
    document.body.innerHTML = '<rect id="svg_1" />';
    const wrapper = shallow(<ActionsPanel
      elem={document.getElementById('svg_1')}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();

    wrapper.find('div.btn-container').at(0).simulate('click');
    expect(convertToPath).toHaveBeenCalledTimes(1);

    wrapper.find('div.btn-container').at(1).simulate('click');
    expect(triggerOffsetTool).toHaveBeenCalledTimes(1);

    wrapper.find('div.btn-container').at(2).simulate('click');
    expect(triggerGridTool).toHaveBeenCalledTimes(1);
  });

  test('ellipse', () => {
    document.body.innerHTML = '<ellipse id="svg_1" />';
    const wrapper = shallow(<ActionsPanel
      elem={document.getElementById('svg_1')}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();

    wrapper.find('div.btn-container').at(0).simulate('click');
    expect(convertToPath).toHaveBeenCalledTimes(1);

    wrapper.find('div.btn-container').at(1).simulate('click');
    expect(triggerOffsetTool).toHaveBeenCalledTimes(1);

    wrapper.find('div.btn-container').at(2).simulate('click');
    expect(triggerGridTool).toHaveBeenCalledTimes(1);
  });

  test('polygon', () => {
    document.body.innerHTML = '<polygon id="svg_1" />';
    const wrapper = shallow(<ActionsPanel
      elem={document.getElementById('svg_1')}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();

    wrapper.find('div.btn-container').at(0).simulate('click');
    expect(convertToPath).toHaveBeenCalledTimes(1);

    wrapper.find('div.btn-container').at(1).simulate('click');
    expect(triggerOffsetTool).toHaveBeenCalledTimes(1);

    wrapper.find('div.btn-container').at(2).simulate('click');
    expect(triggerGridTool).toHaveBeenCalledTimes(1);
  });

  test('line', () => {
    document.body.innerHTML = '<line id="svg_1" />';
    const wrapper = shallow(<ActionsPanel
      elem={document.getElementById('svg_1')}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();

    wrapper.find('div.btn-container').at(0).simulate('click');
    expect(convertToPath).toHaveBeenCalledTimes(1);

    wrapper.find('div.btn-container').at(1).simulate('click');
    expect(triggerOffsetTool).toHaveBeenCalledTimes(1);

    wrapper.find('div.btn-container').at(2).simulate('click');
    expect(triggerGridTool).toHaveBeenCalledTimes(1);
  });

  test('use', () => {
    document.body.innerHTML = '<use id="svg_1" />';
    const wrapper = shallow(<ActionsPanel
      elem={document.getElementById('svg_1')}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();

    wrapper.find('div.btn-container').at(0).simulate('click');
    expect(disassembleUse2Group).toHaveBeenCalledTimes(1);

    wrapper.find('div.btn-container').at(1).simulate('click');
    expect(triggerGridTool).toHaveBeenCalledTimes(1);
  });

  describe('g', () => {
    test('multiple selection', () => {
      document.body.innerHTML = `
        <g id="svg_3" data-tempgroup="true">
          <rect id="svg_1 />
          <ellipse id="svg_2" />
        </g>
      `;
      const wrapper = shallow(<ActionsPanel
        elem={document.getElementById('svg_3')}
      />);
      expect(toJson(wrapper)).toMatchSnapshot();

      wrapper.find('div.btn-container').at(0).simulate('click');
      expect(triggerOffsetTool).toHaveBeenCalledTimes(1);

      wrapper.find('div.btn-container').at(1).simulate('click');
      expect(triggerGridTool).toHaveBeenCalledTimes(1);
    });

    test('single selection', () => {
      document.body.innerHTML = '<g id="svg_1" />';
      const wrapper = shallow(<ActionsPanel
        elem={document.getElementById('svg_1')}
      />);
      expect(toJson(wrapper)).toMatchSnapshot();

      wrapper.find('div.btn-container').at(0).simulate('click');
      expect(triggerGridTool).toHaveBeenCalledTimes(1);
    });
  });
});
