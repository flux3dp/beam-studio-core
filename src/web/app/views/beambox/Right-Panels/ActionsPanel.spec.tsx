/* eslint-disable import/first */
import React from 'react';
import { fireEvent, render } from '@testing-library/react';

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

const mockUpdateElementColor = jest.fn();
jest.mock(
  'helpers/color/updateElementColor',
  () =>
    (...args) =>
      mockUpdateElementColor(...args)
);

function tick() {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}

const ActionButtonSelector = 'div.btn-container>button';
const ActionButtonSelectorMobile = 'div.object-panel-item';

describe('should render correctly', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('no elements', () => {
    const { container } = render(<ActionsPanel elem={null} />);
    expect(container).toMatchSnapshot();
  });

  test('image', async () => {
    document.body.innerHTML = '<image id="svg_1" />';
    const { container } = render(<ActionsPanel elem={document.getElementById('svg_1')} />);
    expect(container).toMatchSnapshot();

    const blob = new Blob();
    getFileFromDialog.mockResolvedValueOnce(blob);

    const actionButtons = container.querySelectorAll(ActionButtonSelector);
    fireEvent.click(actionButtons[0]);
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
    fireEvent.click(actionButtons[0]);
    await tick();
    expect(replaceBitmap).not.toHaveBeenCalled();

    fireEvent.click(actionButtons[1]);
    expect(mockRemoveBackground).toHaveBeenCalledTimes(1);
    expect(mockRemoveBackground).toHaveBeenNthCalledWith(1, document.getElementById('svg_1'));

    fireEvent.click(actionButtons[2]);
    expect(mockTraceImage).toHaveBeenCalledTimes(1);

    fireEvent.click(actionButtons[3]);
    expect(showPhotoEditPanel).toHaveBeenCalledTimes(1);
    expect(showPhotoEditPanel).toHaveBeenNthCalledWith(1, 'curve');

    fireEvent.click(actionButtons[4]);
    expect(showPhotoEditPanel).toHaveBeenCalledTimes(2);
    expect(showPhotoEditPanel).toHaveBeenNthCalledWith(2, 'sharpen');

    fireEvent.click(actionButtons[5]);
    expect(mockShowCropPanel).toHaveBeenCalledTimes(1);

    fireEvent.click(actionButtons[6]);
    expect(generateStampBevel).toHaveBeenCalledTimes(1);
    expect(generateStampBevel).toHaveBeenNthCalledWith(1, document.getElementById('svg_1'));

    fireEvent.click(actionButtons[7]);
    expect(colorInvert).toHaveBeenCalledTimes(1);
    expect(colorInvert).toHaveBeenNthCalledWith(1, document.getElementById('svg_1'));

    fireEvent.click(actionButtons[8]);
    expect(triggerGridTool).toHaveBeenCalledTimes(1);
  });

  test('text', async () => {
    Object.defineProperty(window, 'FLUX', {
      value: {
        version: 'web',
      },
    });
    document.body.innerHTML = '<text id="svg_1" />';
    const { container } = render(<ActionsPanel elem={document.getElementById('svg_1')} />);
    expect(container).toMatchSnapshot();

    convertTextToPath.mockResolvedValueOnce({});
    const actionButtons = container.querySelectorAll(ActionButtonSelector);
    fireEvent.click(actionButtons[0]);
    await tick();
    expect(toSelectMode).toHaveBeenCalledTimes(1);
    expect(clearSelection).toHaveBeenCalledTimes(1);
    expect(convertTextToPath).toHaveBeenCalledTimes(1);
    expect(convertTextToPath).toHaveBeenNthCalledWith(1, document.getElementById('svg_1'));

    fireEvent.click(actionButtons[1]);
    await tick();
    expect(toSelectMode).toHaveBeenCalledTimes(2);
    expect(clearSelection).toHaveBeenCalledTimes(2);
    expect(convertTextToPath).toHaveBeenCalledTimes(2);
    expect(convertTextToPath).toHaveBeenNthCalledWith(2, document.getElementById('svg_1'), {
      weldingTexts: true,
    });

    fireEvent.click(actionButtons[2]);
    expect(triggerGridTool).toHaveBeenCalledTimes(1);
  });

  test('path', () => {
    document.body.innerHTML = '<path id="svg_1" />';
    const { container } = render(<ActionsPanel elem={document.getElementById('svg_1')} />);
    expect(container).toMatchSnapshot();

    const actionButtons = container.querySelectorAll(ActionButtonSelector);
    fireEvent.click(actionButtons[0]);
    expect(pathActions.toEditMode).toHaveBeenCalledTimes(1);

    fireEvent.click(actionButtons[1]);
    expect(decomposePath).toHaveBeenCalledTimes(1);

    fireEvent.click(actionButtons[2]);
    expect(triggerOffsetTool).toHaveBeenCalledTimes(1);

    fireEvent.click(actionButtons[3]);
    expect(triggerGridTool).toHaveBeenCalledTimes(1);
  });

  test('rect', () => {
    document.body.innerHTML = '<rect id="svg_1" />';
    const { container } = render(<ActionsPanel elem={document.getElementById('svg_1')} />);
    expect(container).toMatchSnapshot();

    const actionButtons = container.querySelectorAll(ActionButtonSelector);
    fireEvent.click(actionButtons[0]);
    expect(convertToPath).toHaveBeenCalledTimes(1);

    fireEvent.click(actionButtons[1]);
    expect(triggerOffsetTool).toHaveBeenCalledTimes(1);

    fireEvent.click(actionButtons[2]);
    expect(triggerGridTool).toHaveBeenCalledTimes(1);
  });

  test('ellipse', () => {
    document.body.innerHTML = '<ellipse id="svg_1" />';
    const { container } = render(<ActionsPanel elem={document.getElementById('svg_1')} />);
    expect(container).toMatchSnapshot();

    const actionButtons = container.querySelectorAll(ActionButtonSelector);
    fireEvent.click(actionButtons[0]);
    expect(convertToPath).toHaveBeenCalledTimes(1);

    fireEvent.click(actionButtons[1]);
    expect(triggerOffsetTool).toHaveBeenCalledTimes(1);

    fireEvent.click(actionButtons[2]);
    expect(triggerGridTool).toHaveBeenCalledTimes(1);
  });

  test('polygon', () => {
    document.body.innerHTML = '<polygon id="svg_1" />';
    const { container } = render(<ActionsPanel elem={document.getElementById('svg_1')} />);
    expect(container).toMatchSnapshot();

    const actionButtons = container.querySelectorAll(ActionButtonSelector);
    fireEvent.click(actionButtons[0]);
    expect(convertToPath).toHaveBeenCalledTimes(1);

    fireEvent.click(actionButtons[1]);
    expect(triggerOffsetTool).toHaveBeenCalledTimes(1);

    fireEvent.click(actionButtons[2]);
    expect(triggerGridTool).toHaveBeenCalledTimes(1);
  });

  test('line', () => {
    document.body.innerHTML = '<line id="svg_1" />';
    const { container } = render(<ActionsPanel elem={document.getElementById('svg_1')} />);
    expect(container).toMatchSnapshot();

    const actionButtons = container.querySelectorAll(ActionButtonSelector);
    fireEvent.click(actionButtons[0]);
    expect(convertToPath).toHaveBeenCalledTimes(1);

    fireEvent.click(actionButtons[1]);
    expect(triggerOffsetTool).toHaveBeenCalledTimes(1);

    fireEvent.click(actionButtons[2]);
    expect(triggerGridTool).toHaveBeenCalledTimes(1);
  });

  test('use', () => {
    document.body.innerHTML = '<use id="svg_1" />';
    const { container } = render(<ActionsPanel elem={document.getElementById('svg_1')} />);
    expect(container).toMatchSnapshot();

    const actionButtons = container.querySelectorAll(ActionButtonSelector);
    fireEvent.click(actionButtons[0]);
    expect(disassembleUse2Group).toHaveBeenCalledTimes(1);

    fireEvent.click(actionButtons[1]);
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
      const { container } = render(<ActionsPanel elem={document.getElementById('svg_3')} />);
      expect(container).toMatchSnapshot();

      const actionButtons = container.querySelectorAll(ActionButtonSelector);
      fireEvent.click(actionButtons[0]);
      expect(triggerOffsetTool).toHaveBeenCalledTimes(1);

      fireEvent.click(actionButtons[1]);
      expect(triggerGridTool).toHaveBeenCalledTimes(1);
    });

    test('single selection', () => {
      document.body.innerHTML = '<g id="svg_1" />';
      const { container } = render(<ActionsPanel elem={document.getElementById('svg_1')} />);
      expect(container).toMatchSnapshot();

      const actionButtons = container.querySelectorAll(ActionButtonSelector);
      fireEvent.click(actionButtons[0]);
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
    const { container } = render(<ActionsPanel elem={null} />);
    expect(container).toMatchSnapshot();
  });

  test('image', async () => {
    document.body.innerHTML = '<image id="svg_1" />';
    const { container } = render(<ActionsPanel elem={document.getElementById('svg_1')} />);
    expect(container).toMatchSnapshot();

    const blob = new Blob();
    getFileFromDialog.mockResolvedValueOnce(blob);
    const actionButtons = container.querySelectorAll(ActionButtonSelectorMobile);
    fireEvent.click(actionButtons[0]);
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
    fireEvent.click(actionButtons[0]);
    await tick();
    expect(replaceBitmap).not.toHaveBeenCalled();

    fireEvent.click(actionButtons[1]);
    expect(mockPotrace).toHaveBeenCalledTimes(1);
    expect(mockPotrace).toHaveBeenNthCalledWith(1, document.getElementById('svg_1'));

    fireEvent.click(actionButtons[2]);
    expect(showPhotoEditPanel).toHaveBeenCalledTimes(1);
    expect(showPhotoEditPanel).toHaveBeenNthCalledWith(1, 'curve');

    mockCheckConnection.mockReturnValueOnce(true);
    fireEvent.click(actionButtons[3]);
    expect(showPhotoEditPanel).toHaveBeenCalledTimes(2);
    expect(showPhotoEditPanel).toHaveBeenNthCalledWith(2, 'sharpen');

    fireEvent.click(actionButtons[4]);
    expect(mockShowCropPanel).toHaveBeenCalledTimes(1);

    fireEvent.click(actionButtons[5]);
    expect(generateStampBevel).toHaveBeenCalledTimes(1);
    expect(generateStampBevel).toHaveBeenNthCalledWith(1, document.getElementById('svg_1'));

    fireEvent.click(actionButtons[6]);
    expect(colorInvert).toHaveBeenCalledTimes(1);
    expect(colorInvert).toHaveBeenNthCalledWith(1, document.getElementById('svg_1'));

    fireEvent.click(actionButtons[7]);
    expect(triggerGridTool).toHaveBeenCalledTimes(1);

    fireEvent.click(actionButtons[8]);
    expect(mockTraceImage).toHaveBeenCalledTimes(1);

    fireEvent.click(actionButtons[9]);
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
    const { container } = render(<ActionsPanel elem={document.getElementById('svg_1')} />);
    expect(container).toMatchSnapshot();

    convertTextToPath.mockResolvedValueOnce({});
    const actionButtons = container.querySelectorAll(ActionButtonSelectorMobile);
    fireEvent.click(actionButtons[0]);
    await tick();
    expect(toSelectMode).toHaveBeenCalledTimes(1);
    expect(clearSelection).toHaveBeenCalledTimes(1);
    expect(convertTextToPath).toHaveBeenCalledTimes(1);
    expect(convertTextToPath).toHaveBeenNthCalledWith(1, document.getElementById('svg_1'));

    fireEvent.click(actionButtons[1]);
    await tick();
    expect(toSelectMode).toHaveBeenCalledTimes(2);
    expect(clearSelection).toHaveBeenCalledTimes(2);
    expect(convertTextToPath).toHaveBeenCalledTimes(2);
    expect(convertTextToPath).toHaveBeenNthCalledWith(2, document.getElementById('svg_1'), {
      weldingTexts: true,
    });

    fireEvent.click(actionButtons[2]);
    expect(triggerGridTool).toHaveBeenCalledTimes(1);
  });

  test('path', () => {
    document.body.innerHTML = '<path id="svg_1" />';
    const { container } = render(<ActionsPanel elem={document.getElementById('svg_1')} />);
    expect(container).toMatchSnapshot();

    const actionButtons = container.querySelectorAll(ActionButtonSelectorMobile);
    fireEvent.click(actionButtons[0]);
    expect(pathActions.toEditMode).toHaveBeenCalledTimes(1);

    fireEvent.click(actionButtons[1]);
    expect(decomposePath).toHaveBeenCalledTimes(1);

    fireEvent.click(actionButtons[2]);
    expect(triggerOffsetTool).toHaveBeenCalledTimes(1);

    fireEvent.click(actionButtons[3]);
    expect(triggerGridTool).toHaveBeenCalledTimes(1);
  });

  test('rect', () => {
    document.body.innerHTML = '<rect id="svg_1" />';
    const { container } = render(<ActionsPanel elem={document.getElementById('svg_1')} />);
    expect(container).toMatchSnapshot();

    const actionButtons = container.querySelectorAll(ActionButtonSelectorMobile);
    fireEvent.click(actionButtons[0]);
    expect(convertToPath).toHaveBeenCalledTimes(1);

    fireEvent.click(actionButtons[1]);
    expect(triggerOffsetTool).toHaveBeenCalledTimes(1);

    fireEvent.click(actionButtons[2]);
    expect(triggerGridTool).toHaveBeenCalledTimes(1);
  });

  test('ellipse', () => {
    document.body.innerHTML = '<ellipse id="svg_1" />';
    const { container } = render(<ActionsPanel elem={document.getElementById('svg_1')} />);
    expect(container).toMatchSnapshot();

    const actionButtons = container.querySelectorAll(ActionButtonSelectorMobile);
    fireEvent.click(actionButtons[0]);
    expect(convertToPath).toHaveBeenCalledTimes(1);

    fireEvent.click(actionButtons[1]);
    expect(triggerOffsetTool).toHaveBeenCalledTimes(1);

    fireEvent.click(actionButtons[2]);
    expect(triggerGridTool).toHaveBeenCalledTimes(1);
  });

  test('polygon', () => {
    document.body.innerHTML = '<polygon id="svg_1" />';
    const { container } = render(<ActionsPanel elem={document.getElementById('svg_1')} />);
    expect(container).toMatchSnapshot();

    const actionButtons = container.querySelectorAll(ActionButtonSelectorMobile);
    fireEvent.click(actionButtons[0]);
    expect(convertToPath).toHaveBeenCalledTimes(1);

    fireEvent.click(actionButtons[1]);
    expect(triggerOffsetTool).toHaveBeenCalledTimes(1);

    fireEvent.click(actionButtons[2]);
    expect(triggerGridTool).toHaveBeenCalledTimes(1);
  });

  test('line', () => {
    document.body.innerHTML = '<line id="svg_1" />';
    const { container } = render(<ActionsPanel elem={document.getElementById('svg_1')} />);
    expect(container).toMatchSnapshot();

    const actionButtons = container.querySelectorAll(ActionButtonSelectorMobile);
    fireEvent.click(actionButtons[0]);
    expect(convertToPath).toHaveBeenCalledTimes(1);

    fireEvent.click(actionButtons[1]);
    expect(triggerOffsetTool).toHaveBeenCalledTimes(1);

    fireEvent.click(actionButtons[2]);
    expect(triggerGridTool).toHaveBeenCalledTimes(1);
  });

  test('use', () => {
    document.body.innerHTML = '<use id="svg_1" />';
    const { container } = render(<ActionsPanel elem={document.getElementById('svg_1')} />);
    expect(container).toMatchSnapshot();

    const actionButtons = container.querySelectorAll(ActionButtonSelectorMobile);
    fireEvent.click(actionButtons[0]);
    expect(disassembleUse2Group).toHaveBeenCalledTimes(1);

    fireEvent.click(actionButtons[1]);
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
      const { container } = render(<ActionsPanel elem={document.getElementById('svg_3')} />);
      expect(container).toMatchSnapshot();

      const actionButtons = container.querySelectorAll(ActionButtonSelectorMobile);
      fireEvent.click(actionButtons[0]);
      expect(triggerOffsetTool).toHaveBeenCalledTimes(1);

      fireEvent.click(actionButtons[1]);
      expect(triggerGridTool).toHaveBeenCalledTimes(1);
    });

    test('single selection', () => {
      document.body.innerHTML = '<g id="svg_1" />';
      const { container } = render(<ActionsPanel elem={document.getElementById('svg_1')} />);
      expect(container).toMatchSnapshot();

      const actionButtons = container.querySelectorAll(ActionButtonSelectorMobile);
      fireEvent.click(actionButtons[0]);
      expect(triggerGridTool).toHaveBeenCalledTimes(1);
    });
  });
});
