/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext } from 'react';
import { fireEvent, render } from '@testing-library/react';

import LayerModule from 'app/constants/layer-module/layer-modules';

import AdvancedBlock from './AdvancedBlock';
import ConfigPanelContext from './ConfigPanelContext';

const mockRead = jest.fn();
jest.mock('app/actions/beambox/beambox-preference', () => ({
  read: (key: string) => mockRead(key),
}));

const mockOn = jest.fn();
const mockOff = jest.fn();
jest.mock('helpers/eventEmitterFactory', () => ({
  createEventEmitter: () => ({
    on: (...args) => mockOn(...args),
    off: (...args) => mockOff(...args),
  }),
}));

const mockForceUpdate = jest.fn();
jest.mock('helpers/use-force-update', () => () => mockForceUpdate);

const mockUseWorkarea = jest.fn();
jest.mock('helpers/hooks/useWorkarea', () => () => mockUseWorkarea());

jest.mock('helpers/useI18n', () => () => ({
  beambox: {
    right_panel: {
      laser_panel: {
        advanced: 'advanced',
      },
    },
  },
}));

const mockGetSupportInfo = jest.fn();
jest.mock('app/constants/add-on', () => ({
  getSupportInfo: (...args) => mockGetSupportInfo(...args),
}));

jest.mock('./AutoFocus', () => () => <div>Mock AutoFocus</div>);
jest.mock('./Diode', () => () => <div>Mock Diode</div>);
jest.mock('./FocusBlock', () => ({ type }: { type: string }) => <div>Mock FocusBlock: {type}</div>);
jest.mock('./SingleColorBlock', () => () => <div>Mock SingleColorBlock</div>);
jest.mock('./ConfigPanelContext', () => createContext(null));

describe('test AdvancedBlock', () => {
  it('should render correctly for non-printer, no addon', () => {
    mockRead.mockReturnValue(false);
    mockGetSupportInfo.mockReturnValue({ lowerFocus: false, autoFocus: false, hybridLaser: false });

    const { container } = render(
      <ConfigPanelContext.Provider
        value={{ state: { module: { value: LayerModule.LASER_UNIVERSAL } } } as any}
      >
        <AdvancedBlock />
      </ConfigPanelContext.Provider>
    );
    expect(container).toMatchSnapshot();
  });

  it('should render correctly for autofocus, diode', () => {
    mockRead.mockReturnValue(true);
    mockGetSupportInfo.mockReturnValue({ lowerFocus: false, autoFocus: true, hybridLaser: true });

    const { container } = render(
      <ConfigPanelContext.Provider
        value={{ state: { module: { value: LayerModule.LASER_UNIVERSAL } } } as any}
      >
        <AdvancedBlock />
      </ConfigPanelContext.Provider>
    );
    const collapseHeader = container.querySelector('.ant-collapse-header');
    fireEvent.click(collapseHeader);
    expect(container).toMatchSnapshot();
  });

  it('should render correctly for lower focus, diode', () => {
    mockRead.mockReturnValue(true);
    mockGetSupportInfo.mockReturnValue({ lowerFocus: true, autoFocus: true, hybridLaser: true });

    const { container } = render(
      <ConfigPanelContext.Provider
        value={{ state: { module: { value: LayerModule.LASER_UNIVERSAL } } } as any}
      >
        <AdvancedBlock />
      </ConfigPanelContext.Provider>
    );
    const collapseHeader = container.querySelector('.ant-collapse-header');
    fireEvent.click(collapseHeader);
    expect(container).toMatchSnapshot();
  });

  it('should render correctly for printer', () => {
    mockRead.mockReturnValue(true);
    mockGetSupportInfo.mockReturnValue({ lowerFocus: true, autoFocus: true, hybridLaser: true });

    const { container } = render(
      <ConfigPanelContext.Provider
        value={{ state: { module: { value: LayerModule.PRINTER } } } as any}
      >
        <AdvancedBlock />
      </ConfigPanelContext.Provider>
    );
    const collapseHeader = container.querySelector('.ant-collapse-header');
    fireEvent.click(collapseHeader);
    expect(container).toMatchSnapshot();
  });
});