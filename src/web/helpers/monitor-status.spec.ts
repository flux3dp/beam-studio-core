/* eslint-disable import/first */
jest.mock('helpers/i18n', () => ({
  lang: {
    device: {
      ready: 'Ready',
    },
  },
}));

import { IReport } from 'interfaces/IDevice';

import MonitorStatus from './monitor-status';

describe('test monitor-status', () => {
  test('getDisplayStatus', () => {
    expect(MonitorStatus.getDisplayStatus('IDLE')).toBe('Ready');
    expect(MonitorStatus.getDisplayStatus('IDLE1')).toBe('');
  });

  test('isAbortedOrCompleted', () => {
    expect(MonitorStatus.isAbortedOrCompleted(null)).toBeFalsy();
    expect(MonitorStatus.isAbortedOrCompleted({
      st_id: 128,
    } as IReport)).toBeTruthy();
    expect(MonitorStatus.isAbortedOrCompleted({
      st_id: 64,
    } as IReport)).toBeTruthy();
    expect(MonitorStatus.isAbortedOrCompleted({
      st_id: 66,
    } as IReport)).toBeFalsy();
  });

  test('getControlButtonType', () => {
    expect(MonitorStatus.getControlButtonType(null)).toEqual({
      left: 6,
      mid: 2,
    });
    expect(MonitorStatus.getControlButtonType({
      st_id: 1,
    } as IReport)).toEqual({
      left: 6,
      mid: 4,
    });
    expect(MonitorStatus.getControlButtonType({
      st_id: 2,
    } as IReport)).toEqual({
      left: 6,
      mid: 2,
    });
  });
});
