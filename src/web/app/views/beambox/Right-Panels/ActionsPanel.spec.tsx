/* eslint-disable import/first */
import * as React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

const mockShowCropPanel = jest.fn();
const showPhotoEditPanel = jest.fn();
jest.mock('app/actions/dialog-caller', () => ({
  showCropPanel: (...args) => mockShowCropPanel(...args),
  showPhotoEditPanel,
}));

const getFileFromDialog = jest.fn();
jest.mock('implementations/dialog', () => ({
  getFileFromDialog,
}));

const toggleUnsavedChangedDialog = jest.fn();
jest.mock('helpers/file-export-helper', () => ({
  toggleUnsavedChangedDialog,
}));

const convertTextToPath = jest.fn();
jest.mock('app/actions/beambox/font-funcs', () => ({
  convertTextToPath,
}));

const mockTraceImage = jest.fn();
const generateStampBevel = jest.fn();
const colorInvert = jest.fn();
const mockRemoveBackground = jest.fn();
const mockPotrace = jest.fn();
jest.mock('helpers/image-edit', () => ({
  generateStampBevel,
  colorInvert,
  potrace: (...args) => mockPotrace(...args),
  traceImage: (...args) => mockTraceImage(...args),
  removeBackground: (...args) => mockRemoveBackground(...args),
}));

const openNonstopProgress = jest.fn();
const popById = jest.fn();
jest.mock('app/actions/progress-caller', () => ({
  openNonstopProgress,
  popById,
}));

const toSelectMode = jest.fn();
jest.mock('app/svgedit/text/textactions', () => ({
  isEditing: true,
  toSelectMode,
}));

jest.mock('helpers/i18n', () => ({
  lang: {
    alert: {
      oops: 'oops',
    },
    beambox: {
      right_panel: {
        object_panel: {
          actions_panel: {
            edit_path: 'edit_path',
            replace_with: 'Replace With...',
            replace_with_short: 'Replace',
            trace: 'Trace',
            grading: 'Grading',
            brightness: 'Brightness',
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
            simplify: 'simplify',
            ai_bg_removal: 'ai_bg_removal',
            ai_bg_removal_short: 'BG Removal',
            outline: 'Outline',
            weld_text: 'weld_text',
          },
        },
      },
    },
  },
}));

const mockCheckConnection = jest.fn();
jest.mock('helpers/api/discover', () => ({
  checkConnection: mockCheckConnection,
}));

const getSVGAsync = jest.fn();
jest.mock('helpers/svg-editor-helper', () => ({
  getSVGAsync,
}));

const isMobile = jest.fn();
jest.mock('helpers/system-helper', () => ({
  isMobile: () => isMobile(),
}));

const calculateTransformedBBox = jest.fn();
const clearSelection = jest.fn();
const convertToPath = jest.fn();
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

const ActionButtonSelector = 'div.btn-container>Button';
const ActionButtonSelectorMobile = 'ObjectPanelItem';

describe('should render correctly', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('no elements', () => {
    const wrapper = shallow(<ActionsPanel elem={null} />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('image', async () => {
    document.body.innerHTML = '<image id="svg_1" />';
    const wrapper = shallow(<ActionsPanel elem={document.getElementById('svg_1')} />);
    expect(toJson(wrapper)).toMatchSnapshot();

    const blob = new Blob();
    getFileFromDialog.mockResolvedValueOnce(blob);
    wrapper.find(ActionButtonSelector).at(0).simulate('click');
    await tick();
    expect(getFileFromDialog).toHaveBeenCalledTimes(1);
    expect(getFileFromDialog).toHaveBeenNthCalledWith(1, {
      filters: [
        {
          name: 'Images',
          extensions: [
            'png',
            'jpg',
            'jpeg',
            'jpe',
            'jif',
            'jfif',
            'jfi',
            'bmp',
            'jp2',
            'j2k',
            'jpf',
            'jpx',
            'jpm',
          ],
        },
      ],
    });
    expect(replaceBitmap).toHaveBeenCalledTimes(1);
    expect(replaceBitmap).toHaveBeenNthCalledWith(1, blob, document.getElementById('svg_1'));

    jest.resetAllMocks();
    getFileFromDialog.mockResolvedValueOnce(null);
    wrapper.find(ActionButtonSelector).at(0).simulate('click');
    await tick();
    expect(replaceBitmap).not.toHaveBeenCalled();

    wrapper.find(ActionButtonSelector).at(1).simulate('click');
    expect(mockRemoveBackground).toHaveBeenCalledTimes(1);
    expect(mockRemoveBackground).toHaveBeenNthCalledWith(1, document.getElementById('svg_1'));

    wrapper.find(ActionButtonSelector).at(2).simulate('click');
    expect(mockTraceImage).toHaveBeenCalledTimes(1);

    wrapper.find(ActionButtonSelector).at(3).simulate('click');
    expect(showPhotoEditPanel).toHaveBeenCalledTimes(1);
    expect(showPhotoEditPanel).toHaveBeenNthCalledWith(1, 'curve');

    wrapper.find(ActionButtonSelector).at(4).simulate('click');
    expect(showPhotoEditPanel).toHaveBeenCalledTimes(2);
    expect(showPhotoEditPanel).toHaveBeenNthCalledWith(2, 'sharpen');

    wrapper.find(ActionButtonSelector).at(5).simulate('click');
    expect(mockShowCropPanel).toHaveBeenCalledTimes(1);

    wrapper.find(ActionButtonSelector).at(6).simulate('click');
    expect(generateStampBevel).toHaveBeenCalledTimes(1);
    expect(generateStampBevel).toHaveBeenNthCalledWith(1, document.getElementById('svg_1'));

    wrapper.find(ActionButtonSelector).at(7).simulate('click');
    expect(colorInvert).toHaveBeenCalledTimes(1);
    expect(colorInvert).toHaveBeenNthCalledWith(1, document.getElementById('svg_1'));

    wrapper.find(ActionButtonSelector).at(8).simulate('click');
    expect(triggerGridTool).toHaveBeenCalledTimes(1);
  });

  test('text', async () => {
    Object.defineProperty(window, 'FLUX', {
      value: {
        version: 'web',
      },
    });
    document.body.innerHTML = '<text id="svg_1" />';
    const wrapper = shallow(<ActionsPanel elem={document.getElementById('svg_1')} />);
    expect(toJson(wrapper)).toMatchSnapshot();
    expect(mockCheckConnection).not.toBeCalled();

    mockCheckConnection.mockReturnValue(true);
    convertTextToPath.mockResolvedValueOnce({});
    calculateTransformedBBox.mockReturnValue({ x: 1, y: 2, width: 3, height: 4 });
    wrapper.find(ActionButtonSelector).at(0).simulate('click');
    await tick();
    expect(mockCheckConnection).toHaveBeenCalledTimes(1);
    expect(calculateTransformedBBox).toHaveBeenCalledTimes(1);
    expect(calculateTransformedBBox).toHaveBeenNthCalledWith(1, document.getElementById('svg_1'));
    expect(toSelectMode).toHaveBeenCalledTimes(1);
    expect(clearSelection).toHaveBeenCalledTimes(1);
    expect(convertTextToPath).toHaveBeenCalledTimes(1);
    expect(convertTextToPath).toHaveBeenNthCalledWith(1, document.getElementById('svg_1'), {
      x: 1,
      y: 2,
      width: 3,
      height: 4,
    });

    wrapper.find(ActionButtonSelector).at(1).simulate('click');
    await tick();
    expect(mockCheckConnection).toHaveBeenCalledTimes(2);
    expect(calculateTransformedBBox).toHaveBeenCalledTimes(2);
    expect(calculateTransformedBBox).toHaveBeenNthCalledWith(2, document.getElementById('svg_1'));
    expect(toSelectMode).toHaveBeenCalledTimes(2);
    expect(clearSelection).toHaveBeenCalledTimes(2);
    expect(convertTextToPath).toHaveBeenCalledTimes(2);
    expect(convertTextToPath).toHaveBeenNthCalledWith(2, document.getElementById('svg_1'), {
      x: 1,
      y: 2,
      width: 3,
      height: 4,
    }, {
      weldingTexts: true,
    });

    wrapper.find(ActionButtonSelector).at(2).simulate('click');
    expect(triggerGridTool).toHaveBeenCalledTimes(1);
  });

  test('path', () => {
    document.body.innerHTML = '<path id="svg_1" />';
    const wrapper = shallow(<ActionsPanel elem={document.getElementById('svg_1')} />);
    expect(toJson(wrapper)).toMatchSnapshot();

    wrapper.find(ActionButtonSelector).at(0).simulate('click');
    expect(pathActions.toEditMode).toHaveBeenCalledTimes(1);

    wrapper.find(ActionButtonSelector).at(1).simulate('click');
    expect(decomposePath).toHaveBeenCalledTimes(1);

    wrapper.find(ActionButtonSelector).at(2).simulate('click');
    expect(triggerOffsetTool).toHaveBeenCalledTimes(1);

    wrapper.find(ActionButtonSelector).at(3).simulate('click');
    expect(triggerGridTool).toHaveBeenCalledTimes(1);
  });

  test('rect', () => {
    document.body.innerHTML = '<rect id="svg_1" />';
    const wrapper = shallow(<ActionsPanel elem={document.getElementById('svg_1')} />);
    expect(toJson(wrapper)).toMatchSnapshot();

    wrapper.find(ActionButtonSelector).at(0).simulate('click');
    expect(convertToPath).toHaveBeenCalledTimes(1);

    wrapper.find(ActionButtonSelector).at(1).simulate('click');
    expect(triggerOffsetTool).toHaveBeenCalledTimes(1);

    wrapper.find(ActionButtonSelector).at(2).simulate('click');
    expect(triggerGridTool).toHaveBeenCalledTimes(1);
  });

  test('ellipse', () => {
    document.body.innerHTML = '<ellipse id="svg_1" />';
    const wrapper = shallow(<ActionsPanel elem={document.getElementById('svg_1')} />);
    expect(toJson(wrapper)).toMatchSnapshot();

    wrapper.find(ActionButtonSelector).at(0).simulate('click');
    expect(convertToPath).toHaveBeenCalledTimes(1);

    wrapper.find(ActionButtonSelector).at(1).simulate('click');
    expect(triggerOffsetTool).toHaveBeenCalledTimes(1);

    wrapper.find(ActionButtonSelector).at(2).simulate('click');
    expect(triggerGridTool).toHaveBeenCalledTimes(1);
  });

  test('polygon', () => {
    document.body.innerHTML = '<polygon id="svg_1" />';
    const wrapper = shallow(<ActionsPanel elem={document.getElementById('svg_1')} />);
    expect(toJson(wrapper)).toMatchSnapshot();

    wrapper.find(ActionButtonSelector).at(0).simulate('click');
    expect(convertToPath).toHaveBeenCalledTimes(1);

    wrapper.find(ActionButtonSelector).at(1).simulate('click');
    expect(triggerOffsetTool).toHaveBeenCalledTimes(1);

    wrapper.find(ActionButtonSelector).at(2).simulate('click');
    expect(triggerGridTool).toHaveBeenCalledTimes(1);
  });

  test('line', () => {
    document.body.innerHTML = '<line id="svg_1" />';
    const wrapper = shallow(<ActionsPanel elem={document.getElementById('svg_1')} />);
    expect(toJson(wrapper)).toMatchSnapshot();

    wrapper.find(ActionButtonSelector).at(0).simulate('click');
    expect(convertToPath).toHaveBeenCalledTimes(1);

    wrapper.find(ActionButtonSelector).at(1).simulate('click');
    expect(triggerOffsetTool).toHaveBeenCalledTimes(1);

    wrapper.find(ActionButtonSelector).at(2).simulate('click');
    expect(triggerGridTool).toHaveBeenCalledTimes(1);
  });

  test('use', () => {
    document.body.innerHTML = '<use id="svg_1" />';
    const wrapper = shallow(<ActionsPanel elem={document.getElementById('svg_1')} />);
    expect(toJson(wrapper)).toMatchSnapshot();

    wrapper.find(ActionButtonSelector).at(0).simulate('click');
    expect(disassembleUse2Group).toHaveBeenCalledTimes(1);

    wrapper.find(ActionButtonSelector).at(1).simulate('click');
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
      const wrapper = shallow(<ActionsPanel elem={document.getElementById('svg_3')} />);
      expect(toJson(wrapper)).toMatchSnapshot();

      wrapper.find(ActionButtonSelector).at(0).simulate('click');
      expect(triggerOffsetTool).toHaveBeenCalledTimes(1);

      wrapper.find(ActionButtonSelector).at(1).simulate('click');
      expect(triggerGridTool).toHaveBeenCalledTimes(1);
    });

    test('single selection', () => {
      document.body.innerHTML = '<g id="svg_1" />';
      const wrapper = shallow(<ActionsPanel elem={document.getElementById('svg_1')} />);
      expect(toJson(wrapper)).toMatchSnapshot();

      wrapper.find(ActionButtonSelector).at(0).simulate('click');
      expect(triggerGridTool).toHaveBeenCalledTimes(1);
    });
  });
});

describe('should render correctly in mobile', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    isMobile.mockReturnValue(true);
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
    wrapper.find(ActionButtonSelectorMobile).at(0).simulate('click');
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
    wrapper.find(ActionButtonSelectorMobile).at(0).simulate('click');
    await tick();
    expect(replaceBitmap).not.toHaveBeenCalled();

    wrapper.find(ActionButtonSelectorMobile).at(1).simulate('click');
    expect(mockPotrace).toHaveBeenCalledTimes(1);
    expect(mockPotrace).toHaveBeenNthCalledWith(1, document.getElementById('svg_1'));

    wrapper.find(ActionButtonSelectorMobile).at(2).simulate('click');
    expect(showPhotoEditPanel).toHaveBeenCalledTimes(1);
    expect(showPhotoEditPanel).toHaveBeenNthCalledWith(1, 'curve');

    mockCheckConnection.mockReturnValueOnce(true);
    wrapper.find(ActionButtonSelectorMobile).at(3).simulate('click');
    expect(showPhotoEditPanel).toHaveBeenCalledTimes(2);
    expect(showPhotoEditPanel).toHaveBeenNthCalledWith(2, 'sharpen');

    wrapper.find(ActionButtonSelectorMobile).at(4).simulate('click');
    expect(mockShowCropPanel).toHaveBeenCalledTimes(1);

    wrapper.find(ActionButtonSelectorMobile).at(5).simulate('click');
    expect(generateStampBevel).toHaveBeenCalledTimes(1);
    expect(generateStampBevel).toHaveBeenNthCalledWith(1, document.getElementById('svg_1'));

    wrapper.find(ActionButtonSelectorMobile).at(6).simulate('click');
    expect(colorInvert).toHaveBeenCalledTimes(1);
    expect(colorInvert).toHaveBeenNthCalledWith(1, document.getElementById('svg_1'));

    wrapper.find(ActionButtonSelectorMobile).at(7).simulate('click');
    expect(triggerGridTool).toHaveBeenCalledTimes(1);

    wrapper.find(ActionButtonSelectorMobile).at(8).simulate('click');
    expect(mockTraceImage).toHaveBeenCalledTimes(1);

    wrapper.find(ActionButtonSelectorMobile).at(9).simulate('click');
    expect(mockRemoveBackground).toHaveBeenCalledTimes(1);
    expect(mockRemoveBackground).toHaveBeenNthCalledWith(1, document.getElementById('svg_1'));
  });

  test('text', async () => {
    Object.defineProperty(window, 'FLUX', {
      value: {
        version: 'web',
      },
    });
    document.body.innerHTML = '<text id="svg_1" />';
    const wrapper = shallow(<ActionsPanel
      elem={document.getElementById('svg_1')}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();
    expect(mockCheckConnection).not.toBeCalled();

    mockCheckConnection.mockReturnValue(true);
    convertTextToPath.mockResolvedValueOnce({});
    calculateTransformedBBox.mockReturnValue({ x: 1, y: 2, width: 3, height: 4 });
    wrapper.find(ActionButtonSelectorMobile).at(0).simulate('click');
    await tick();
    expect(mockCheckConnection).toHaveBeenCalledTimes(1);
    expect(calculateTransformedBBox).toHaveBeenCalledTimes(1);
    expect(calculateTransformedBBox).toHaveBeenNthCalledWith(1, document.getElementById('svg_1'));
    expect(toSelectMode).toHaveBeenCalledTimes(1);
    expect(clearSelection).toHaveBeenCalledTimes(1);
    expect(convertTextToPath).toHaveBeenCalledTimes(1);
    expect(convertTextToPath).toHaveBeenNthCalledWith(1, document.getElementById('svg_1'), {
      x: 1,
      y: 2,
      width: 3,
      height: 4,
    });

    wrapper.find(ActionButtonSelectorMobile).at(1).simulate('click');
    await tick();
    expect(mockCheckConnection).toHaveBeenCalledTimes(2);
    expect(calculateTransformedBBox).toHaveBeenCalledTimes(2);
    expect(calculateTransformedBBox).toHaveBeenNthCalledWith(2, document.getElementById('svg_1'));
    expect(toSelectMode).toHaveBeenCalledTimes(2);
    expect(clearSelection).toHaveBeenCalledTimes(2);
    expect(convertTextToPath).toHaveBeenCalledTimes(2);
    expect(convertTextToPath).toHaveBeenNthCalledWith(2, document.getElementById('svg_1'), {
      x: 1,
      y: 2,
      width: 3,
      height: 4,
    }, {
      weldingTexts: true,
    });

    wrapper.find(ActionButtonSelectorMobile).at(2).simulate('click');
    expect(triggerGridTool).toHaveBeenCalledTimes(1);
  });

  test('path', () => {
    document.body.innerHTML = '<path id="svg_1" />';
    const wrapper = shallow(<ActionsPanel
      elem={document.getElementById('svg_1')}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();

    wrapper.find(ActionButtonSelectorMobile).at(0).simulate('click');
    expect(pathActions.toEditMode).toHaveBeenCalledTimes(1);

    wrapper.find(ActionButtonSelectorMobile).at(1).simulate('click');
    expect(decomposePath).toHaveBeenCalledTimes(1);

    wrapper.find(ActionButtonSelectorMobile).at(2).simulate('click');
    expect(triggerOffsetTool).toHaveBeenCalledTimes(1);

    wrapper.find(ActionButtonSelectorMobile).at(3).simulate('click');
    expect(triggerGridTool).toHaveBeenCalledTimes(1);
  });

  test('rect', () => {
    document.body.innerHTML = '<rect id="svg_1" />';
    const wrapper = shallow(<ActionsPanel
      elem={document.getElementById('svg_1')}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();

    wrapper.find(ActionButtonSelectorMobile).at(0).simulate('click');
    expect(convertToPath).toHaveBeenCalledTimes(1);

    wrapper.find(ActionButtonSelectorMobile).at(1).simulate('click');
    expect(triggerOffsetTool).toHaveBeenCalledTimes(1);

    wrapper.find(ActionButtonSelectorMobile).at(2).simulate('click');
    expect(triggerGridTool).toHaveBeenCalledTimes(1);
  });

  test('ellipse', () => {
    document.body.innerHTML = '<ellipse id="svg_1" />';
    const wrapper = shallow(<ActionsPanel
      elem={document.getElementById('svg_1')}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();

    wrapper.find(ActionButtonSelectorMobile).at(0).simulate('click');
    expect(convertToPath).toHaveBeenCalledTimes(1);

    wrapper.find(ActionButtonSelectorMobile).at(1).simulate('click');
    expect(triggerOffsetTool).toHaveBeenCalledTimes(1);

    wrapper.find(ActionButtonSelectorMobile).at(2).simulate('click');
    expect(triggerGridTool).toHaveBeenCalledTimes(1);
  });

  test('polygon', () => {
    document.body.innerHTML = '<polygon id="svg_1" />';
    const wrapper = shallow(<ActionsPanel
      elem={document.getElementById('svg_1')}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();

    wrapper.find(ActionButtonSelectorMobile).at(0).simulate('click');
    expect(convertToPath).toHaveBeenCalledTimes(1);

    wrapper.find(ActionButtonSelectorMobile).at(1).simulate('click');
    expect(triggerOffsetTool).toHaveBeenCalledTimes(1);

    wrapper.find(ActionButtonSelectorMobile).at(2).simulate('click');
    expect(triggerGridTool).toHaveBeenCalledTimes(1);
  });

  test('line', () => {
    document.body.innerHTML = '<line id="svg_1" />';
    const wrapper = shallow(<ActionsPanel
      elem={document.getElementById('svg_1')}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();

    wrapper.find(ActionButtonSelectorMobile).at(0).simulate('click');
    expect(convertToPath).toHaveBeenCalledTimes(1);

    wrapper.find(ActionButtonSelectorMobile).at(1).simulate('click');
    expect(triggerOffsetTool).toHaveBeenCalledTimes(1);

    wrapper.find(ActionButtonSelectorMobile).at(2).simulate('click');
    expect(triggerGridTool).toHaveBeenCalledTimes(1);
  });

  test('use', () => {
    document.body.innerHTML = '<use id="svg_1" />';
    const wrapper = shallow(<ActionsPanel
      elem={document.getElementById('svg_1')}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();

    wrapper.find(ActionButtonSelectorMobile).at(0).simulate('click');
    expect(disassembleUse2Group).toHaveBeenCalledTimes(1);

    wrapper.find(ActionButtonSelectorMobile).at(1).simulate('click');
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

      wrapper.find(ActionButtonSelectorMobile).at(0).simulate('click');
      expect(triggerOffsetTool).toHaveBeenCalledTimes(1);

      wrapper.find(ActionButtonSelectorMobile).at(1).simulate('click');
      expect(triggerGridTool).toHaveBeenCalledTimes(1);
    });

    test('single selection', () => {
      document.body.innerHTML = '<g id="svg_1" />';
      const wrapper = shallow(<ActionsPanel
        elem={document.getElementById('svg_1')}
      />);
      expect(toJson(wrapper)).toMatchSnapshot();

      wrapper.find(ActionButtonSelectorMobile).at(0).simulate('click');
      expect(triggerGridTool).toHaveBeenCalledTimes(1);
    });
  });
});
