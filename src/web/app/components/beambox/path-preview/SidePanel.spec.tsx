/* eslint-disable import/first */
import React from 'react';
import { fireEvent, render } from '@testing-library/react';

jest.mock('helpers/i18n', () => ({
  lang: {
    beambox: {
      path_preview: {
        play: 'Play',
        pause: 'Pause',
        stop: 'Stop',
        play_speed: 'Playback Speed',
        travel_path: 'Travel Path',
        invert: 'Invert',
        preview_info: 'Preview Information',
        size: 'Size',
        estimated_time: 'Total Time Estimated',
        cut_time: 'Cut Time',
        rapid_time: 'Travel Time',
        cut_distance: 'Cut Distance',
        rapid_distance: 'Travel Distance',
        current_position: 'Current Position',
        remark: '* All pieces of information are estimated value for reference.',
        start_here: 'Start Here',
        end_preview: 'End Preview',
      },
    },
  },
}));

import SidePanel from './SidePanel';

describe('side panel test', () => {
  it('should render correctly when enabled', () => {
    const handleStartHere = jest.fn();
    const togglePathPreview = jest.fn();
    const { container } = render(
      <SidePanel
        size="100 x 100 mm"
        estTime="60 s"
        lightTime="30 s"
        rapidTime="10 s"
        cutDist="50 mm"
        rapidDist="30 mm"
        currentPosition="50, 50 mm"
        handleStartHere={handleStartHere}
        isStartHereEnabled
        togglePathPreview={togglePathPreview}
      />
    );
    expect(container).toMatchSnapshot();

    const buttons = container.querySelectorAll('div.btn-default');
    fireEvent.click(buttons[0]);
    expect(handleStartHere).toHaveBeenCalledTimes(1);

    fireEvent.click(buttons[1]);
    expect(togglePathPreview).toHaveBeenCalledTimes(1);
  });

  it('should render correctly when disabled', () => {
    const handleStartHere = jest.fn();
    const togglePathPreview = jest.fn();
    const { container } = render(
      <SidePanel
        size="100 x 100 mm"
        estTime="60 s"
        lightTime="30 s"
        rapidTime="10 s"
        cutDist="50 mm"
        rapidDist="30 mm"
        currentPosition="50, 50 mm"
        handleStartHere={handleStartHere}
        isStartHereEnabled={false}
        togglePathPreview={togglePathPreview}
      />
    );
    expect(container).toMatchSnapshot();

    const buttons = container.querySelectorAll('div.btn-default');
    fireEvent.click(buttons[0]);
    expect(handleStartHere).toHaveBeenCalledTimes(0);

    fireEvent.click(buttons[1]);
    expect(togglePathPreview).toHaveBeenCalledTimes(1);
  });
});
