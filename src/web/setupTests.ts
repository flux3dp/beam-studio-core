/* eslint-disable import/no-extraneous-dependencies */
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });
Object.defineProperty(window, 'os', {
  value: '',
  writable: true,
});
Object.defineProperty(window, '$', {
  value: jest.fn(),
});
