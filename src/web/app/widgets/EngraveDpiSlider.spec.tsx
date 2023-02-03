import React from 'react';
import { fireEvent, render } from '@testing-library/react';

import EngraveDpiSlider from './EngraveDpiSlider';

jest.mock('antd', () => ({
  Col: ({ children, ...props }: any) => (
    <div>
      Dummy Col
      <p>props: {JSON.stringify(props)}</p>
      {children}
    </div>
  ),
  Form: {
    Item: ({ children, ...props }: any) => (
      <div>
        Dummy FormItem
        <p>props: {JSON.stringify(props)}</p>
        {children}
      </div>
    ),
  },
  Input: React.forwardRef(({ children, ...props }: any, ref) => (
    <div>
      Dummy Input
      <p>props: {JSON.stringify(props)}</p>
      <p>ref: {JSON.stringify(ref)}</p>
      {children}
    </div>
  )),
  Row: ({ children, ...props }: any) => (
    <div>
      Dummy Row
      <p>props: {JSON.stringify(props)}</p>
      {children}
    </div>
  ),
  Slider: ({ onChange, ...props }: any) => (
    <div>
      Dummy Slider
      <p>props: {JSON.stringify(props)}</p>
      <button type="button" onClick={() => onChange(0)}>
        change
      </button>
    </div>
  ),
}));

jest.mock('helpers/i18n', () => ({
  lang: {
    beambox: {
      document_panel: {
        engrave_dpi: 'Resolution',
        low: 'Low',
        medium: 'Medium',
        high: 'High',
        ultra: 'Ultra High',
      },
    },
  },
  getActiveLang: () => 'en',
}));

const mockOnChange = jest.fn();

describe('test EngraveDpiSlider', () => {
  beforeEach(() => {
    mockOnChange.mockReset();
  });

  it('should render correctly in low dpi', () => {
    const { container } = render(<EngraveDpiSlider value="low" onChange={mockOnChange} />);
    expect(container).toMatchSnapshot();
  });

  it('should render correctly in medium dpi', () => {
    const { container } = render(<EngraveDpiSlider value="medium" onChange={mockOnChange} />);
    expect(container).toMatchSnapshot();
  });

  it('should render correctly in high dpi', () => {
    const { container } = render(<EngraveDpiSlider value="high" onChange={mockOnChange} />);
    expect(container).toMatchSnapshot();
  });

  it('should render correctly in ultra dpi', () => {
    const { container } = render(<EngraveDpiSlider value="ultra" onChange={mockOnChange} />);
    expect(container).toMatchSnapshot();
  });

  test('onChange should work', () => {
    const { getByText } = render(<EngraveDpiSlider value="ultra" onChange={mockOnChange} />);
    expect(mockOnChange).not.toBeCalled();
    fireEvent.click(getByText('change'));
    expect(mockOnChange).toBeCalledTimes(1);
    expect(mockOnChange).toHaveBeenLastCalledWith('low');
  });
});
