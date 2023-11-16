import React from 'react';
import { fireEvent, render } from '@testing-library/react';

import LayerModule from 'app/constants/layer-module/layer-modules';
import moduleOffsets from 'app/constants/layer-module/module-offsets';
import { OptionValues } from 'app/constants/enums';

import AdorModule from './AdorModule';

jest.mock('helpers/useI18n', () => () => ({
  settings: {
    printer_advanced_mode: 'printer_advanced_mode',
    default_laser_module: 'default_laser_module',
    module_offset_10w: 'module_offset_10w',
    module_offset_20w: 'module_offset_20w',
    module_offset_printer: 'module_offset_printer',
    module_offset_2w_ir: 'module_offset_2w_ir',
    groups: {
      ador_modules: 'ador_modules',
    },
  },
  layer_module: {
    laser_10w_diode: 'laser_10w_diode',
    laser_20w_diode: 'laser_20w_diode',
    printing: 'printing',
    laser_2w_infrared: 'laser_2w_infrared',
  },
}));
jest.mock(
  'app/components/settings/Control',
  () =>
    ({ label, children }: { label: string; children: React.ReactNode }) =>
      (
        <div>
          <div>Mock Control{label}</div>
          {children}
        </div>
      )
);
jest.mock(
  'app/widgets/Unit-Input-v2',
  () =>
    ({
      id,
      defaultValue,
      getValue,
    }: {
      id: string;
      defaultValue: number;
      getValue: (val: number) => void;
    }) =>
      (
        <div>
          <input
            id={id}
            data-testid={id}
            type="number"
            value={defaultValue}
            onChange={(e) => getValue(parseFloat(e.target.value))}
          />
        </div>
      )
);
jest.mock(
  'app/components/settings/SelectControl',
  () =>
    ({ label, id, options, onChange }: any) =>
      (
        <div>
          Mock SelectControl
          <div>{label}</div>
          <div>{id}</div>
          <div>
            {options.map((opt) => (
              <button
                type="button"
                key={opt.label}
                onClick={() => onChange({ target: { value: opt.value } })}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )
);

const mockOptions = [
  {
    value: OptionValues.TRUE,
    label: 'On',
    selected: true,
  },
  {
    value: OptionValues.FALSE,
    label: 'Off',
    selected: false,
  },
];

const mockOffsetInit: { [m: number]: [number, number] } = {
  [LayerModule.LASER_10W_DIODE]: [10, 10],
};

const mockUpdateBeamboxPreferenceChange = jest.fn();
describe('test AdorModule', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render correctly', () => {
    const { container } = render(
      <AdorModule
        defaultLaserModule={LayerModule.LASER_10W_DIODE}
        defaultUnit="mm"
        selectedModel="ado1"
        updateBeamboxPreferenceChange={mockUpdateBeamboxPreferenceChange}
        printAdvancedModeOptions={mockOptions}
        currentModuleOffsets={mockOffsetInit}
      />
    );
    expect(container).toMatchSnapshot();
  });

  test('edit value', () => {
    const { rerender, getByTestId } = render(
      <AdorModule
        defaultLaserModule={LayerModule.LASER_10W_DIODE}
        defaultUnit="mm"
        selectedModel="ado1"
        updateBeamboxPreferenceChange={mockUpdateBeamboxPreferenceChange}
        printAdvancedModeOptions={mockOptions}
        currentModuleOffsets={mockOffsetInit}
      />
    );
    let input = getByTestId('10w-laser-y-offset') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '20' } });
    expect(mockUpdateBeamboxPreferenceChange).toBeCalledTimes(1);
    expect(mockUpdateBeamboxPreferenceChange).toHaveBeenLastCalledWith('module-offsets', {
      [LayerModule.LASER_10W_DIODE]: [10, 20],
    });
    const offsetValue = { ...mockOffsetInit };
    offsetValue[LayerModule.LASER_10W_DIODE] = [10, 20];
    rerender(
      <AdorModule
        defaultLaserModule={LayerModule.LASER_10W_DIODE}
        defaultUnit="mm"
        selectedModel="ado1"
        updateBeamboxPreferenceChange={mockUpdateBeamboxPreferenceChange}
        printAdvancedModeOptions={mockOptions}
        currentModuleOffsets={offsetValue}
      />
    );
    input = getByTestId('printer-x-offset') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '30' } });
    expect(mockUpdateBeamboxPreferenceChange).toBeCalledTimes(2);
    expect(mockUpdateBeamboxPreferenceChange).toHaveBeenLastCalledWith('module-offsets', {
      [LayerModule.LASER_10W_DIODE]: [10, 20],
      [LayerModule.PRINTER]: [30, moduleOffsets[LayerModule.PRINTER][1]],
    });
  });

  test('edit print advanced mode', () => {
    const mockInitValue: { [m: number]: [number, number] } = {
      [LayerModule.LASER_10W_DIODE]: [10, 10],
    };
    const { getByText } = render(
      <AdorModule
        defaultLaserModule={LayerModule.LASER_10W_DIODE}
        defaultUnit="mm"
        selectedModel="ado1"
        updateBeamboxPreferenceChange={mockUpdateBeamboxPreferenceChange}
        printAdvancedModeOptions={mockOptions}
        currentModuleOffsets={mockInitValue}
      />
    );
    const button = getByText('On');
    fireEvent.click(button);
    expect(mockUpdateBeamboxPreferenceChange).toBeCalledTimes(1);
    expect(mockUpdateBeamboxPreferenceChange).toHaveBeenLastCalledWith(
      'print-advanced-mode',
      OptionValues.TRUE
    );
  });

  test('edit default laser module', () => {
    const mockInitValue: { [m: number]: [number, number] } = {
      [LayerModule.LASER_10W_DIODE]: [10, 10],
    };
    const { getByText } = render(
      <AdorModule
        defaultLaserModule={LayerModule.LASER_10W_DIODE}
        defaultUnit="mm"
        selectedModel="ado1"
        updateBeamboxPreferenceChange={mockUpdateBeamboxPreferenceChange}
        printAdvancedModeOptions={mockOptions}
        currentModuleOffsets={mockInitValue}
      />
    );
    const button = getByText('laser_20w_diode');
    fireEvent.click(button);
    expect(mockUpdateBeamboxPreferenceChange).toBeCalledTimes(1);
    expect(mockUpdateBeamboxPreferenceChange).toHaveBeenLastCalledWith(
      'default-laser-module',
      LayerModule.LASER_20W_DIODE
    );
  });
});
