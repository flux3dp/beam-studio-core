import React from 'react';
import { fireEvent, render } from '@testing-library/react';

import AutoFocus from './AutoFocus';

jest.mock('helpers/useI18n', () => () => ({
  beambox: {
    right_panel: {
      laser_panel: {
        focus_adjustment: 'focus_adjustment',
        height: 'height',
        z_step: 'z_step',
      },
    },
  },
}));

jest.mock('app/widgets/Unit-Input-v2', () => (
  { id, min, max, unit, defaultValue, decimal, displayMultiValue, getValue }: any
) => (
  <div>
    MockUnitInput
    <p>id: {id}</p>
    <p>min: {min}</p>
    <p>max: {max}</p>
    <p>unit: {unit}</p>
    <p>defaultValue: {defaultValue}</p>
    <p>decimal: {decimal}</p>
    <p>displayMultiValue: {displayMultiValue}</p>
    <button type="button" onClick={() => getValue(7)}>change-{id}</button>
  </div>
));

const mockOnToggle = jest.fn();
const mockOnHeightChange = jest.fn();
const mockOnZStepChange = jest.fn();

describe('test AutoFocus', () => {
  it('should render correctly when height is less than 0', () => {
    const { container, queryByText } = render(
      <AutoFocus
        height={-3}
        hasMultiHeight={false}
        repeat={1}
        zStep={0}
        hasMultiZStep={false}
        onToggle={mockOnToggle}
        onHeightChange={mockOnHeightChange}
        onZStepChange={mockOnZStepChange}
      />
    );
    expect(container).toMatchSnapshot();
    expect(queryByText('height')).not.toBeInTheDocument();
    expect(queryByText('z_step')).not.toBeInTheDocument();
  });

  it('should render correctly when repeat is less than 1', () => {
    const { container, queryByText } = render(
      <AutoFocus
        height={3}
        hasMultiHeight={false}
        repeat={1}
        zStep={0}
        hasMultiZStep={false}
        onToggle={mockOnToggle}
        onHeightChange={mockOnHeightChange}
        onZStepChange={mockOnZStepChange}
      />
    );
    expect(container).toMatchSnapshot();
    expect(queryByText('height')).toBeInTheDocument();
    expect(queryByText('z_step')).not.toBeInTheDocument();
  });

  it('should render correctly when repeat is larger than 1', () => {
    const { container, queryByText } = render(
      <AutoFocus
        height={3}
        hasMultiHeight={false}
        repeat={2}
        zStep={0}
        hasMultiZStep={false}
        onToggle={mockOnToggle}
        onHeightChange={mockOnHeightChange}
        onZStepChange={mockOnZStepChange}
      />
    );
    expect(container).toMatchSnapshot();
    expect(queryByText('height')).toBeInTheDocument();
    expect(queryByText('z_step')).toBeInTheDocument();
  });

  test('handlers should work', () => {
    const { container, getByText } = render(
      <AutoFocus
        height={3}
        hasMultiHeight={false}
        repeat={2}
        zStep={0}
        hasMultiZStep={false}
        onToggle={mockOnToggle}
        onHeightChange={mockOnHeightChange}
        onZStepChange={mockOnZStepChange}
      />
    );
    expect(mockOnToggle).not.toBeCalled();
    fireEvent.click(container.querySelector('.checkbox'));
    expect(mockOnToggle).toBeCalledTimes(1);

    expect(mockOnHeightChange).not.toBeCalled();
    fireEvent.click(getByText('change-height'));
    expect(mockOnHeightChange).toBeCalledTimes(1);
    expect(mockOnHeightChange).lastCalledWith(7);

    expect(mockOnZStepChange).not.toBeCalled();
    fireEvent.click(getByText('change-z_step'));
    expect(mockOnZStepChange).toBeCalledTimes(1);
    expect(mockOnZStepChange).lastCalledWith(7);
  });
});
