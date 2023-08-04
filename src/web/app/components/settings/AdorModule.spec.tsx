import React from 'react';
import { fireEvent, render } from '@testing-library/react';

import LayerModule from 'app/constants/layer-module/layer-modules';
import moduleOffsets from 'app/constants/layer-module/module-offsets';

import AdorModule from './AdorModule';

jest.mock('helpers/useI18n', () => () => ({
  settings: {
    groups: {
      ador_modules: 'ador_modules',
    },
  },
}));
jest.mock('app/components/settings/Control', () => (
  { label, children }: { label: string; children: React.ReactNode }
) => (
  <div>
    <div>Mock Control{label}</div>
    {children}
  </div>
));
jest.mock('app/widgets/Unit-Input-v2', () => (
  { id, defaultValue, getValue }: {
    id: string;
    defaultValue: number;
    getValue: (val: number) => void;
  }
) => (
  <div>
    <input
      id={id}
      data-testid={id}
      type="number"
      value={defaultValue}
      onChange={(e) => getValue(parseFloat(e.target.value))}
    />
  </div>
));

const mockUpdateBeamboxPreferenceChange = jest.fn();
describe('test AdorModule', () => {
  it('should render correctly', () => {
    const mockInitValue: { [m: number]: [number, number] } = {
      [LayerModule.LASER_10W_DIODE]: [10, 10],
    };

    const { container } = render(<AdorModule
      defaultUnit="mm"
      selectedModel="ado1"
      updateBeamboxPreferenceChange={mockUpdateBeamboxPreferenceChange}
      currentModuleOffsets={mockInitValue}
    />);
    expect(container).toMatchSnapshot();
  });

  test('edit value', () => {
    const mockInitValue: { [m: number]: [number, number] } = {
      [LayerModule.LASER_10W_DIODE]: [10, 10],
    };

    const { rerender, getByTestId } = render(<AdorModule
      defaultUnit="mm"
      selectedModel="ado1"
      updateBeamboxPreferenceChange={mockUpdateBeamboxPreferenceChange}
      currentModuleOffsets={mockInitValue}
    />);
    let input = getByTestId('10w-laser-y-offset') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '20' } });
    expect(mockUpdateBeamboxPreferenceChange).toBeCalledTimes(1);
    expect(mockUpdateBeamboxPreferenceChange).toHaveBeenLastCalledWith('module-offsets', {
      [LayerModule.LASER_10W_DIODE]: [10, 20],
    });
    mockInitValue[LayerModule.LASER_10W_DIODE] = [10, 20];
    rerender(<AdorModule
      defaultUnit="mm"
      selectedModel="ado1"
      updateBeamboxPreferenceChange={mockUpdateBeamboxPreferenceChange}
      currentModuleOffsets={mockInitValue}
    />);
    input = getByTestId('printer-x-offset') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '30' } });
    expect(mockUpdateBeamboxPreferenceChange).toBeCalledTimes(2);
    expect(mockUpdateBeamboxPreferenceChange).toHaveBeenLastCalledWith('module-offsets', {
      [LayerModule.LASER_10W_DIODE]: [10, 20],
      [LayerModule.PRINTER]: [30, moduleOffsets[LayerModule.PRINTER][1]],
    });
  });
});
