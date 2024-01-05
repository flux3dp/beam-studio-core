import React from 'react';
import { fireEvent, render } from '@testing-library/react';

import PositionInput from './PositionInput';

const mockGet = jest.fn();
jest.mock('implementations/storage', () => ({
  get: (...args) => mockGet(...args),
}));

const mockUseIsMobile = jest.fn();
jest.mock('helpers/system-helper', () => ({
  useIsMobile: () => mockUseIsMobile(),
}));

jest.mock('app/widgets/Unit-Input-v2', () => ({ id, unit, defaultValue, getValue }: any) => (
  <div>
    <div>{id}</div>
    <div>{unit}</div>
    <div>{defaultValue}</div>
    <div>{getValue}</div>
    <input type="number" defaultValue={defaultValue} onChange={(e) => getValue(Number(e.target.value))} />
  </div>
));

jest.mock('app/views/beambox/Right-Panels/ObjectPanelItem', () => ({
  Number: ({ id, value, updateValue, label }: any) => (
    <div id={id}>
      {label}
      <div>{value}</div>
      <button type="button" onClick={() => updateValue(value + 1)} />
    </div>
  ),
}));

const mockOnChange = jest.fn();

describe('test PositionInput', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should render correctly on desktop', () => {
    mockUseIsMobile.mockReturnValue(false);
    const { container } = render(<PositionInput type="x" value={0} onChange={mockOnChange} />);
    expect(container).toMatchSnapshot();
  });

  it('should render correctly on mobile', () => {
    mockUseIsMobile.mockReturnValue(true);
    const { container } = render(<PositionInput type="x" value={0} onChange={mockOnChange} />);
    expect(container).toMatchSnapshot();
  });

  test('onChange on desktop', () => {
    mockUseIsMobile.mockReturnValue(false);
    const { container } = render(<PositionInput type="x" value={0} onChange={mockOnChange} />);
    const input = container.querySelector('input');
    fireEvent.change(input, { target: { value: 1 } });
    expect(mockOnChange).toBeCalledTimes(1);
    expect(mockOnChange).toHaveBeenLastCalledWith('x', 1);
  });

  test('onChange on mobile', () => {
    mockUseIsMobile.mockReturnValue(true);
    const { container } = render(<PositionInput type="x" value={0} onChange={mockOnChange} />);
    const button = container.querySelector('button');
    fireEvent.click(button);
    expect(mockOnChange).toBeCalledTimes(1);
    expect(mockOnChange).toHaveBeenLastCalledWith('x', 1);
  });
});
