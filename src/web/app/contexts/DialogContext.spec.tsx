import React, { useContext } from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

import { DialogContextProvider, DialogContext, eventEmitter } from './DialogContext';

const Children = () => {
  const context = useContext(DialogContext);
  return (
    <>
      {context.dialogComponents}
    </>
  );
};

describe('should render correctly', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('desktop version', () => {
    const wrapper = shallow(
      <DialogContextProvider>
        <Children />
      </DialogContextProvider>,
    );
    expect(toJson(wrapper)).toMatchSnapshot();
    expect(eventEmitter.eventNames().length).toBe(4);

    eventEmitter.emit('ADD_DIALOG_COMPONENT', '12345', (<div>Hello World</div>));
    eventEmitter.emit('ADD_DIALOG_COMPONENT', '67890', (<span>Hello Flux</span>));
    eventEmitter.emit('ADD_DIALOG_COMPONENT', 'flux-id-login', (<span>Flux Login</span>));
    expect(toJson(wrapper)).toMatchSnapshot();

    const response = {
      isIdExist: false,
    };
    eventEmitter.emit('CHECK_ID_EXIST', '12345', response);
    expect(response.isIdExist).toBeTruthy();
    eventEmitter.emit('CHECK_ID_EXIST', '123456', response);
    expect(response.isIdExist).toBeFalsy();

    eventEmitter.emit('POP_DIALOG_BY_ID', '67890');
    expect(toJson(wrapper)).toMatchSnapshot();

    window.dispatchEvent(new CustomEvent('DISMISS_FLUX_LOGIN'));
    expect(toJson(wrapper)).toMatchSnapshot();

    eventEmitter.emit('CLEAR_ALL_DIALOG_COMPONENTS');
    expect(toJson(wrapper)).toMatchSnapshot();

    wrapper.unmount();
    expect(eventEmitter.eventNames().length).toBe(0);
  });

  test('web version', () => {
    window.FLUX.version = 'web';

    const wrapper = shallow(
      <DialogContextProvider>
        <Children />
      </DialogContextProvider>,
    );

    eventEmitter.emit('ADD_DIALOG_COMPONENT', 'flux-id-login', (<span>Flux Login</span>));
    expect(toJson(wrapper)).toMatchSnapshot();

    window.dispatchEvent(new CustomEvent('DISMISS_FLUX_LOGIN'));
    expect(toJson(wrapper)).toMatchSnapshot();
  });
});
