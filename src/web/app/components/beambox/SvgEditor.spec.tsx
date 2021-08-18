import * as React from 'react';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';

const mockGet = jest.fn();
jest.mock('implementations/storage', () => ({
  get: mockGet,
}));

jest.mock('app/views/beambox/Right-Panels/Right-Panel', () => function DummyRightPanel() {
  return (
    <div>
      This is dummy RightPanel
    </div>
  );
});

jest.mock('app/components/beambox/Workarea', () => function DummyWorkarea() {
  return (
    <div>
      This is dummy Workarea
    </div>
  );
});

jest.mock('app/components/beambox/ZoomBlock', () => function DummyZoomBlock() {
  return (
    <div>
      This is dummy ZoomBlock
    </div>
  );
});

jest.mock('app/views/beambox/Right-Panels/contexts/RightPanelContext', () => ({
  RightPanelContextProvider: function DummyRightPanelContextProvider(props) {
    // eslint-disable-next-line react/prop-types
    const { children } = props;
    return (
      <div>
        This is dummy RightPanelContextProvider
        {children}
      </div>
    );
  },
}));

const mockInit = jest.fn();
jest.mock('app/actions/beambox/svg-editor', () => ({
  init: mockInit,
}));

Object.defineProperty(window, '$', {
  value: jest.fn(),
});

// eslint-disable-next-line import/first, import/order
import SvgEditor from './SvgEditor';

describe('test svg-editor', () => {
  test('should render correctly in mac', () => {
    mockGet.mockReturnValue('inches');
    Object.defineProperty(window, 'os', {
      value: 'MacOS',
    });
    const wrapper = mount(<SvgEditor />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('should render correctly in win', () => {
    mockGet.mockReturnValue('mm');
    Object.defineProperty(window, 'os', {
      value: 'Windows',
    });
    const wrapper = mount(<SvgEditor />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });
});
