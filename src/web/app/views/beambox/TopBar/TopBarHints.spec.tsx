/* eslint-disable import/first */
import * as React from 'react';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';

jest.mock('helpers/i18n', () => ({
  lang: {
    topbar: {
      hint: {
        polygon: 'Press + / - key to increase / decrease sides.',
      },
    },
  },
}));

import { TopBarHintsContext } from 'app/views/beambox/TopBar/contexts/TopBarHintsContext';

import TopBarHints from './TopBarHints';

test('should render correctly', () => {
  expect(toJson(mount(
    <TopBarHintsContext.Provider value={{
      hintType: null,
    }}
    >
      <TopBarHints />
    </TopBarHintsContext.Provider>,
  ))).toMatchSnapshot();

  expect(toJson(mount(
    <TopBarHintsContext.Provider value={{
      hintType: 'POLYGON',
    }}
    >
      <TopBarHints />
    </TopBarHintsContext.Provider>,
  ))).toMatchSnapshot();

  expect(toJson(mount(
    <TopBarHintsContext.Provider value={{
      hintType: 'CIRCLE',
    }}
    >
      <TopBarHints />
    </TopBarHintsContext.Provider>,
  ))).toMatchSnapshot();
});
