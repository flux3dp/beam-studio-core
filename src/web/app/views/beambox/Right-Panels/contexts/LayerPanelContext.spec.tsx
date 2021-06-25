import React from 'react';
import { shallow } from 'enzyme';

import eventEmitterFactory from 'helpers/eventEmitterFactory';

import { LayerPanelContextProvider } from './LayerPanelContext';

test('should render correctly', () => {
  const layerPanelEventEmitter = eventEmitterFactory.createEventEmitter('layer-panel');
  const wrapper = shallow(
    <LayerPanelContextProvider>
      <></>
    </LayerPanelContextProvider>,
  );

  expect(wrapper.state()).toEqual({
    selectedLayers: [],
  });
  expect(layerPanelEventEmitter.eventNames().length).toBe(3);

  const forceUpdate = jest.spyOn(wrapper.instance(), 'forceUpdate');
  layerPanelEventEmitter.emit('UPDATE_LAYER_PANEL');
  expect(forceUpdate).toHaveBeenCalledTimes(1);

  layerPanelEventEmitter.emit('SET_SELECTED_LAYERS', ['layer1', 'layer3']);
  expect(wrapper.state()).toEqual({
    selectedLayers: ['layer1', 'layer3'],
  });

  const response = {
    selectedLayers: [],
  };
  layerPanelEventEmitter.emit('GET_SELECTED_LAYERS', response);
  expect(response.selectedLayers).toEqual(['layer1', 'layer3']);

  wrapper.unmount();
  expect(layerPanelEventEmitter.eventNames().length).toBe(0);
});
