import React from 'react';
import { fireEvent, render } from '@testing-library/react';

import PowerBlock from './PowerBlock';

jest.mock('helpers/useI18n', () => () => ({
  beambox: {
    right_panel: {
      laser_panel: {
        strength: 'strength',
        low_power_warning: 'low_power_warning',
      },
    },
  },
}));

jest.mock('app/widgets/Unit-Input-v2', () => (
  { id, min, max, unit, defaultValue, decimal, displayMultiValue }: any
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
  </div>
));

const mockOnChange = jest.fn();
describe('test PowerBlock', () => {
  it('should render correctly', () => {
    const { container } = render(
      <PowerBlock power={87} hasMultipleValue={false} onChange={mockOnChange} />
    );
    expect(container).toMatchSnapshot();
  });

  test('onChange should work', () => {
    const { container } = render(
      <PowerBlock power={87} hasMultipleValue={false} onChange={mockOnChange} />
    );
    expect(mockOnChange).not.toBeCalled();
    const input = container.querySelector('input');
    fireEvent.change(input, { target: { value: '88' } });
    expect(mockOnChange).toBeCalledTimes(1);
    expect(mockOnChange).toHaveBeenLastCalledWith(88);
  });
});
