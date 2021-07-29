/* eslint-disable import/first */
import * as React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

jest.mock('helpers/i18n', () => ({
  lang: {
    topbar: {
      untitled: 'Untitled',
    },
  },
}));

import FileName from './FileName';

test('should render correctly', () => {
  expect(toJson(shallow(<FileName
    fileName="abc.svg"
    hasUnsavedChange
  />))).toMatchSnapshot();

  expect(toJson(shallow(<FileName
    fileName=""
    hasUnsavedChange={false}
  />))).toMatchSnapshot();

  window.os = 'Windows';
  expect(toJson(shallow(<FileName
    fileName=""
    hasUnsavedChange={false}
  />))).toMatchSnapshot();
});
