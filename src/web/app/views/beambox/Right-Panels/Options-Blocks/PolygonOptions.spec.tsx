/* eslint-disable import/first */
import * as React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

jest.mock('helpers/i18n', () => ({
  lang: {
    beambox: {
      right_panel: {
        object_panel: {
          option_panel: {
            sides: 'Sides',
          },
        },
      },
    },
  },
}));

window.polygonAddSides = jest.fn();
window.polygonDecreaseSides = jest.fn();

import PolygonOptions from './PolygonOptions';

test('should render correctly', () => {
  expect(toJson(shallow(
    <PolygonOptions
      elem={document.getElementById('flux')}
      polygonSides={0}
    />,
  ))).toMatchSnapshot();

  document.body.innerHTML = '<div id="flux" />';
  const wrapper = shallow(
    <PolygonOptions
      elem={document.getElementById('flux')}
      polygonSides={5}
    />,
  );

  expect(toJson(wrapper)).toMatchSnapshot();

  wrapper.find('UnitInput').props().getValue(8);
  expect(toJson(wrapper)).toMatchSnapshot();
  expect(window.polygonAddSides).toHaveBeenCalledTimes(3);
  expect(window.polygonDecreaseSides).not.toHaveBeenCalled();

  jest.resetAllMocks();

  wrapper.find('UnitInput').props().getValue(5);
  expect(toJson(wrapper)).toMatchSnapshot();
  expect(window.polygonAddSides).not.toHaveBeenCalled();
  expect(window.polygonDecreaseSides).toHaveBeenCalledTimes(3);

  jest.resetAllMocks();

  wrapper.find('UnitInput').props().getValue(5);
  expect(window.polygonAddSides).not.toHaveBeenCalled();
  expect(window.polygonDecreaseSides).not.toHaveBeenCalled();
});
