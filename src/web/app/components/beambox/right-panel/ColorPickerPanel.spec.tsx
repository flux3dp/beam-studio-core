/* eslint-disable import/first */
const create = jest.fn();
jest.mock('@simonwep/pickr', () => ({
  create,
}));

jest.mock('antd', () => ({
  Button: ({ onClick, type, children }: any) => <button className={type} onClick={onClick} type="button">{children}</button>,
}));

jest.mock('helpers/i18n', () => ({
  lang: {
    beambox: {
      photo_edit_panel: {
        cancel: 'Cancel',
        okay: 'Okay',
      },
    },
  },
}));

import * as React from 'react';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';

import ColorPickerPanel from './ColorPickerPanel';

test('should render correctly', () => {
  create.mockReturnValue({
    getColor: () => ({
      toHEXA: () => ({
        toString: () => '#FFFFFF',
      }),
    }),
  });

  const onNewColor = jest.fn();
  const onClose = jest.fn();
  const wrapper = mount(<ColorPickerPanel
    originalColor="#000000"
    top={100}
    left={300}
    onNewColor={onNewColor}
    onClose={onClose}
  />);
  expect(toJson(wrapper)).toMatchSnapshot();
  expect(create).toHaveBeenCalledTimes(1);
  expect(create).toHaveBeenNthCalledWith(1, {
    el: '.pickr',
    theme: 'monolith',
    inline: true,
    default: '#000000',
    swatches: [
    ],
    components: {
      preview: true,
      opacity: false,
      hue: true,
      interaction: {
        input: false,
        cancel: false,
        save: false,
      },
    },
  });

  wrapper.find('button').at(1).simulate('click');
  expect(onNewColor).toHaveBeenCalledTimes(1);
  expect(onNewColor).toHaveBeenNthCalledWith(1, '#FFFFFF');
  expect(onClose).toHaveBeenCalledTimes(1);

  wrapper.find('button').at(0).simulate('click');
  expect(onClose).toHaveBeenCalledTimes(2);

  wrapper.find('div.modal-background').simulate('click');
  expect(onClose).toHaveBeenCalledTimes(3);
});
