import React from 'react';
import { render } from '@testing-library/react';

import { Mode } from 'app/constants/monitor-constants';
import { MonitorContext } from 'app/contexts/MonitorContext';

import MonitorTask from './MonitorTask';

jest.mock('helpers/i18n', () => ({
  lang: {
    monitor: {
      task: {
        BEAMBOX: 'Laser Engraving',
      },
    },
  },
}));

jest.mock('app/contexts/MonitorContext', () => ({
  MonitorContext: React.createContext(null),
}));

const formatDuration = jest.fn();
jest.mock('helpers/duration-formatter', () => (sec: number) => formatDuration(sec));

jest.mock('./MonitorControl', () => () => <div>Dummy MonitorControl</div>);

describe('should render correctly', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should render correctly', () => {
    formatDuration.mockReturnValue('1m 30s');
    const { container } = render(
      <MonitorContext.Provider
        value={
          {
            taskTime: 90,
            mode: Mode.PREVIEW,
            report: {
              st_id: 1,
              prog: 123,
            },
            uploadProgress: null,
            taskImageURL: 'img/flux.svg',
            fileInfo: ['filename'],
          } as any
        }
      >
        <MonitorTask />
      </MonitorContext.Provider>
    );
    expect(container).toMatchSnapshot();
    expect(formatDuration).toHaveBeenCalledTimes(1);
    expect(formatDuration).toHaveBeenNthCalledWith(1, 90);
  });

  it('should render correctly when completed', () => {
    const { container } = render(
      <MonitorContext.Provider
        value={
          {
            taskTime: 0,
            mode: Mode.WORKING,
            report: {
              st_id: 64,
              prog: 0,
            },
            uploadProgress: null,
            taskImageURL: 'img/flux.svg',
            fileInfo: ['filename'],
          } as any
        }
      >
        <MonitorTask />
      </MonitorContext.Provider>
    );
    expect(container).toMatchSnapshot();
  });
});
