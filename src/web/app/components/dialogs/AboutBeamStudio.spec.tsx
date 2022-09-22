/* eslint-disable import/first */
jest.mock('helpers/i18n', () => ({
  lang: {
    topmenu: {
      version: 'Version',
      credit: 'Beam Studio is made possible by the <a target="_blank" href="https://github.com/flux3dp/beam-studio">Beam Studio</a> open source project and other <a target="_blank" href="https://flux3dp.com/credits/">open source software</a>.',
      ok: 'OK',
    },
  },
}));

window.FLUX = {
  version: '1.2.3',
} as any;

import * as React from 'react';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';

import AboutBeamStudio from './AboutBeamStudio';

describe('test AboutBeamStudio', () => {
  beforeAll(() => {
    jest.spyOn(Date.prototype, 'getFullYear').mockReturnValue(1976);
  });

  it('should render correctly', () => {
    const onClose = jest.fn();
    const wrapper = mount(<AboutBeamStudio
      onClose={onClose}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();

    wrapper.find('button.btn-default').simulate('click');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  afterAll(() => {
    jest.resetAllMocks();
  });
});
