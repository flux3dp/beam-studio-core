/* eslint-disable import/first */
jest.mock('helpers/i18n', () => ({
  lang: {
    buttons: {
      next: 'NEXT',
      back: 'BACK',
      done: 'DONE',
    },
  },
}));

import * as React from 'react';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';

import MediaTutorial from './MediaTutorial';

const data = [
  {
    description: '1',
    mediaSources: [
      { src: 'img/1.png', type: 'image/png' },
    ],
  },
  {
    description: '2',
    mediaSources: [
      { src: 'img/2.png', type: 'image/png' },
    ],
  },
  {
    isVideo: true,
    description: '3',
    mediaSources: [
      { src: 'video/3.webm', type: 'image/webm' },
      { src: 'video/3.mp4', type: 'image/mp4' },
    ],
  },
];

describe('should render correctly', () => {
  test('button groups should work', () => {
    const mockOnClose = jest.fn();
    const mockMediaLoad = jest.fn();
    window.HTMLMediaElement.prototype.load = mockMediaLoad;
    const wrapper = mount(<MediaTutorial
      data={data}
      onClose={mockOnClose}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();
    wrapper.find('button[data-test-key="next"]').simulate('click');
    expect(mockMediaLoad).toHaveBeenCalledTimes(0);
    expect(toJson(wrapper)).toMatchSnapshot();
    wrapper.find('button[data-test-key="back"]').simulate('click');
    expect(mockMediaLoad).toHaveBeenCalledTimes(0);
    expect(toJson(wrapper)).toMatchSnapshot();
    wrapper.find('button[data-test-key="next"]').simulate('click');
    expect(mockMediaLoad).toHaveBeenCalledTimes(0);
    expect(toJson(wrapper)).toMatchSnapshot();
    wrapper.find('button[data-test-key="next"]').simulate('click');
    expect(mockMediaLoad).toHaveBeenCalledTimes(1);
    expect(toJson(wrapper)).toMatchSnapshot();
    wrapper.find('button[data-test-key="done"]').simulate('click');
    expect(mockOnClose).toBeCalledTimes(1);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('close button should work', () => {
    const mockOnClose = jest.fn();
    const wrapper = mount(<MediaTutorial
      data={data}
      onClose={mockOnClose}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();
    wrapper.find('.close-btn').simulate('click');
    expect(mockOnClose).toBeCalledTimes(1);
  });
});
