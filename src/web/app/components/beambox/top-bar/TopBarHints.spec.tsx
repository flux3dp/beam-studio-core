/* eslint-disable import/first */
import React from 'react';
import { render } from '@testing-library/react';

jest.mock('helpers/i18n', () => ({
  lang: {
    topbar: {
      hint: {
        polygon: 'Press + / - key to increase / decrease sides.',
      },
    },
  },
}));

import { TopBarHintsContext } from 'app/contexts/TopBarHintsContext';

import TopBarHints from './TopBarHints';

test('should render correctly', () => {
  let { container } = render(
    <TopBarHintsContext.Provider value={{ hintType: null }}>
      <TopBarHints />
    </TopBarHintsContext.Provider>
  );
  expect(container).toMatchSnapshot();

  ({ container } = render(
    <TopBarHintsContext.Provider value={{ hintType: 'POLYGON' }}>
      <TopBarHints />
    </TopBarHintsContext.Provider>
  ));
  expect(container).toMatchSnapshot();

  ({ container } = render(
    <TopBarHintsContext.Provider value={{ hintType: 'CIRCLE' }}>
      <TopBarHints />
    </TopBarHintsContext.Provider>
  ));
  expect(container).toMatchSnapshot();
});
