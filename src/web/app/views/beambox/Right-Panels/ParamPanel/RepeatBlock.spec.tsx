import React from 'react';
import { fireEvent, render } from '@testing-library/react';

import RepeatBlock from './RepeatBlock';

jest.mock('helpers/useI18n', () => () => ({
  beambox: {
    right_panel: {
      laser_panel: {
        repeat: 'repeat',
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
    <button type="button" onClick={() => getValue(7)}>change</button>
  </div>
));

const mockOnChange = jest.fn();
describe('test RepeatBlock', () => {
  it('should render correctly', () => {
    const { container } = render(
      <RepeatBlock repeat={{ value: 3 }} onChange={mockOnChange} />
    );
    expect(container).toMatchSnapshot();
  });

  test('onChange should work', () => {
    const { getByText } = render(
      <RepeatBlock repeat={{ value: 3 }} onChange={mockOnChange} />
    );
    expect(mockOnChange).not.toBeCalled();
    fireEvent.click(getByText('change'));
    expect(mockOnChange).toBeCalledTimes(1);
    expect(mockOnChange).toHaveBeenLastCalledWith(7);
  });
});
