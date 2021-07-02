import * as React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

jest.mock('helpers/i18n', () => ({
  getActiveLang: () => 'en',
  setActiveLang: jest.fn(),
  lang: {
    initialize: {
      select_language: 'Select Language',
      next: 'Next',
    },
  },
}));

jest.mock('implementations/menu', () => ({
  updateLanguage: jest.fn(),
}));

// eslint-disable-next-line import/first
import Home from './Home';

test('should render correctly', () => {
  const wrapper = shallow(<Home />);
  expect(toJson(wrapper)).toMatchSnapshot();
});
