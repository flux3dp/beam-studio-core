const create = jest.fn();
jest.mock('@simonwep/pickr', () => ({
  create,
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

const getLayerElementByName = jest.fn();
jest.mock('helpers/layer-helper', () => ({
  getLayerElementByName,
}));

import * as React from 'react';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';

import ColorPickerPanel from './ColorPickerPanel';

test('should render correctly', () => {
  document.body.innerHTML = '<div id="layer1" data-color="#000000" />';
  const element = document.getElementById('layer1');
  getLayerElementByName.mockReturnValue(element);
  create.mockReturnValue({
    getColor: () => ({
      toHEXA: () => ({
        toString: () => '#FFFFFF',
      }),
    }),
  });

  const onColorChanged = jest.fn();
  const onClose = jest.fn();
  const wrapper = mount(<ColorPickerPanel
    layerName="layer 1"
    top={100}
    left={300}
    onColorChanged={onColorChanged}
    onClose={onClose}
  />);
  expect(toJson(wrapper)).toMatchSnapshot();
  expect(getLayerElementByName).toHaveBeenCalledTimes(1);
  expect(getLayerElementByName).toHaveBeenNthCalledWith(1, 'layer 1');
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
  expect(onColorChanged).toHaveBeenCalledTimes(1);
  expect(onColorChanged).toHaveBeenNthCalledWith(1, '#FFFFFF');
  expect(onClose).toHaveBeenCalledTimes(1);

  wrapper.find('button').at(0).simulate('click');
  expect(onClose).toHaveBeenCalledTimes(2);

  wrapper.find('div.modal-background').simulate('click');
  expect(onClose).toHaveBeenCalledTimes(3);
});
