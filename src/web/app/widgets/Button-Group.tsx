import * as React from 'react';
import { IButton } from 'interfaces/IButton';

const classNames = requireNode('classnames');

interface Props {
  buttons: IButton[];
  className?: string;
}

class ButtonGroup extends React.Component<Props> {
  render() {
    const { buttons } = this.props;
    if (buttons.length <= 0) {
      return <span />;
    }
    const buttonsElems = buttons.map((opt: IButton, i: number) => {
      const type = opt.type || 'button';

      let content = '';
      const attrs = {};
      if (opt.dataAttrs) {
        const keys = Object.keys(opt.dataAttrs);
        for (let j = 0; j < keys.length; j += 1) {
          const key = keys[i];
          if (!attrs[`data-${key}`]) {
            attrs[`data-${key}`] = opt.dataAttrs[key];
          }
        }
      }

      const hasOptClassname = typeof opt.className === 'string' && opt.className !== '';
      const className = classNames('btn', hasOptClassname ? opt.className : 'btn-default', {
        'pull-right': opt.right,
      });

      if (typeof opt.label === 'string') {
        attrs['data-test-key'] = opt.label.toLowerCase();
      }

      if (type === 'link') {
        content = (
          <a
            className={className}
            key={i}
            href={opt.href}
            {...attrs}
            onClick={opt.onClick}
          >
            {opt.label}
          </a>
        );
      } else if (type === 'icon') {
        content = (
          <button
            key={i}
            title={opt.title}
            className={className}
            type="button"
            onClick={opt.onClick}
            {...attrs}
          >
            {opt.label}
          </button>
        );
      } else {
        content = (
          <button
            key={i}
            title={opt.title}
            className={className}
            type="button"
            onClick={opt.onClick}
            onMouseDown={opt.onMouseDown}
            onMouseUp={opt.onMouseUp}
            onMouseLeave={opt.onMouseLeave}
            dangerouslySetInnerHTML={{ __html: opt.label }}
            {...attrs}
          />
        );
      }

      return content;
    }, this);

    const { className } = this.props;
    const hasClassName = typeof className === 'string' && className !== '';
    const groupClassName = classNames('button-group', hasClassName ? className : 'btn-h-group');
    return <div className={groupClassName}>{buttonsElems}</div>;
  }
}

ButtonGroup.defaultProps = {
  buttons: [],
  className: '',
};

export default ButtonGroup;
