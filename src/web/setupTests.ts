/* eslint-disable import/no-extraneous-dependencies */
import Adapter from 'enzyme-adapter-react-16';
import { configure } from 'enzyme';

configure({ adapter: new Adapter() });
Object.defineProperty(window, 'os', {
  value: '',
  writable: true,
});
Object.defineProperty(window, 'FLUX', {
  value: {},
  writable: true,
});
Object.defineProperty(window, 'electron', {
  value: {},
  writable: true,
});
