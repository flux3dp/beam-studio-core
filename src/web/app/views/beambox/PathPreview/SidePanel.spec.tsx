/* eslint-disable import/first */
import * as React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

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

test('should render correctly', () => {
  const handleStartHere = jest.fn();
  const togglePathPreview = jest.fn();
  const wrapper = shallow(<SidePanel
    size="100 x 100 mm"
    estTime="60 s"
    lightTime="30 s"
    rapidTime="10 s"
    cutDist="50 mm"
    rapidDist="30 mm"
    currentPosition="50, 50 mm"
    handleStartHere={handleStartHere}
    togglePathPreview={togglePathPreview}
  />);
  expect(toJson(wrapper)).toMatchSnapshot();

  wrapper.find('div.btn-default').at(0).simulate('click');
  expect(handleStartHere).toHaveBeenCalledTimes(1);

  wrapper.find('div.btn-default').at(1).simulate('click');
  expect(togglePathPreview).toHaveBeenCalledTimes(1);
});
