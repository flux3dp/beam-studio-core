jest.mock('helpers/i18n', () => ({
  lang: {
    alert: {
      cancel: 'Cancel',
    },
  },
  getActiveLang: () => 'en',
}));

import * as React from 'react';
import toJson from 'enzyme-to-json';
import { shallow, mount } from 'enzyme';

import ProgressConstants from 'app/constants/progress-constants';
import Progress from './Progress';

describe('test Progress', () => {
  test('should render correctly', () => {
    expect(toJson(shallow(<Progress
      progress={{
        type: ProgressConstants.NONSTOP,
      }}
      popById={jest.fn()}
    />))).toMatchSnapshot();

    const mockPopByID = jest.fn();
    const mockOnCancel = jest.fn();
    const wrapper = mount(<Progress
      progress={{
        caption: 'flux caption',
        type: ProgressConstants.STEPPING,
        percentage: 90,
        message: 'this is current progress',
        id: '12345',
        onCancel: mockOnCancel,
      }}
      popById={mockPopByID}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();

    wrapper.find('button.btn-default').simulate('click');
    expect(mockPopByID).toHaveBeenCalledTimes(1);
    expect(mockPopByID).toHaveBeenNthCalledWith(1, '12345');
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });
});
