/* eslint-disable import/first */
import * as React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

jest.mock('helpers/i18n', () => ({
  lang: {
    topbar: {
      menu: {
        undo: 'Undo',
        redo: 'Redo',
      },
    },
  },
}));

const getSVGAsync = jest.fn();
jest.mock('helpers/svg-editor-helper', () => ({
  getSVGAsync,
}));

const clickUndo = jest.fn();
const clickRedo = jest.fn();
const deleteSelected = jest.fn();
getSVGAsync.mockImplementation((callback) => {
  callback({
    Editor: {
      clickUndo,
      clickRedo,
      deleteSelected,
    },
  });
});

import CommonTools from './CommonTools';

describe('should render correctly', () => {
  test('is not web version', () => {
    expect(toJson(shallow(<CommonTools
      isWeb={false}
      isPreviewing={false}
    />))).toMatchSnapshot();
  });

  test('in preview mode', () => {
    expect(toJson(shallow(<CommonTools
      isWeb
      isPreviewing
    />))).toMatchSnapshot();
  });

  test('in non-preview mode and is web version', () => {
    const wrapper = shallow(<CommonTools
      isWeb
      isPreviewing={false}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();

    wrapper.find('img').at(0).simulate('click');
    expect(clickUndo).toHaveBeenCalledTimes(1);

    wrapper.find('img').at(1).simulate('click');
    expect(clickRedo).toHaveBeenCalledTimes(1);

    wrapper.find('img').at(2).simulate('click');
    expect(deleteSelected).toHaveBeenCalledTimes(1);
  });
});
