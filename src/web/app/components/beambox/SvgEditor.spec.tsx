import React from 'react';
import { render } from '@testing-library/react';

import SvgEditor from './SvgEditor';

const mockGet = jest.fn();
jest.mock('implementations/storage', () => ({
  get: (...args) => mockGet(...args),
}));

jest.mock('app/components/beambox/Workarea', () => function DummyWorkarea() {
  return (
    <div>
      This is dummy Workarea
    </div>
  );
});

const mockInit = jest.fn();
jest.mock('app/actions/beambox/svg-editor', () => ({
  init: () => mockInit(),
}));

Object.defineProperty(window, '$', {
  value: jest.fn(),
});

jest.mock('app/contexts/CanvasContext', () => ({
  CanvasContext: React.createContext({ isPathPreviewing: false }),
}));

describe('test svg-editor', () => {
  test('should render correctly in mac', () => {
    mockGet.mockReturnValue('inches');
    Object.defineProperty(window, 'os', {
      value: 'MacOS',
    });
    const { container } = render(<SvgEditor />);
    expect(container).toMatchSnapshot();
  });

  test('should render correctly in win', () => {
    mockGet.mockReturnValue('mm');
    Object.defineProperty(window, 'os', {
      value: 'Windows',
    });
    const { container } = render(<SvgEditor />);
    expect(container).toMatchSnapshot();
  });
});
