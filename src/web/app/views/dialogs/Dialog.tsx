import * as React from 'react';
import classNames from 'classnames';

import { DialogContext } from 'app/contexts/DialogContext';

const ComponentWrapper = (props) => props.children;

interface Props {
  className?: string;
}

export default class Dialog extends React.Component<Props, any> {
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
    const { className = '' } = this.props;
    return (
      <div className={classNames('dialog-container', className)}>
        {components}
      </div>
    );
  }
}

Dialog.contextType = DialogContext;
