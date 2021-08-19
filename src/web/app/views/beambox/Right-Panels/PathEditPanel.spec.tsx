/* eslint-disable import/first */
import * as React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

jest.mock('helpers/i18n', () => ({
  lang: {
    beambox: {
      right_panel: {
        object_panel: {
          path_edit_panel: {
            node_type: 'NODE TYPE',
          },
        },
      },
    },
  },
}));

const getSVGAsync = jest.fn();
jest.mock('helpers/svg-editor-helper', () => ({
  getSVGAsync,
}));

const setSelectedNodeType = jest.fn();
getSVGAsync
  .mockImplementation((callback) => {
    callback({
      Edit: {
        path: {
          path: {
            setSelectedNodeType,
            selected_pts: [2],
            nodePoints: [{
              index: 0,
              linkType: 0,
            }, {
              index: 1,
              linkType: 0,
            }, {
              index: 2,
              linkType: 0,
            }],
          },
        },
      },
    });
  });

import PathEditPanel from './PathEditPanel';

test('should render correctly', () => {
  const wrapper = shallow(<PathEditPanel />);
  expect(toJson(wrapper)).toMatchSnapshot();

  wrapper.find('SegmentedControl').props().onChanged(1);
  expect(setSelectedNodeType).toHaveBeenCalledTimes(1);
  expect(setSelectedNodeType).toHaveBeenNthCalledWith(1, 1);
});
