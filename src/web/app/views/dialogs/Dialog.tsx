import * as React from 'react';

import { DialogContext } from 'app/contexts/DialogContext';

const ComponentWrapper = (props) => props.children;

export default class Dialog extends React.Component<any, any> {
  renderComponents() {
    const { dialogComponents } = this.context;
    const components = [];
    for (let i = 0; i < dialogComponents.length; i += 1) {
      const { component } = dialogComponents[i];
      components.push(
        <ComponentWrapper key={i}>
          {component}
        </ComponentWrapper>,
      );
    }
    return components;
  }

  render() {
    const components = this.renderComponents();
    return (
      <div className="dialog-container">
        {components}
      </div>
    );
  }
}

Dialog.contextType = DialogContext;
