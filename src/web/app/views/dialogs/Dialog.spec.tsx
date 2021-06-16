import * as React from 'react';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';

import { DialogContext } from 'app/contexts/DialogContext';

import Dialog from './Dialog';

test('should render correctly', () => {
  expect(toJson(mount(
    <DialogContext.Provider value={{
      dialogComponents: [{
        component: (<div>Hello World</div>),
      }, {
        component: (<span>Hello Flux</span>),
      }],
    }}
    >
      <Dialog className="flux" />
    </DialogContext.Provider>,
  ))).toMatchSnapshot();
});
