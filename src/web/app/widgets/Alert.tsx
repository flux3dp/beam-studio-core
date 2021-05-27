import * as React from 'react';
import classNames from 'classnames';

import browser from 'implementations/browser';
import ButtonGroup from 'app/widgets/Button-Group';
import Modal from 'app/widgets/Modal';

interface Props {
  caption: string;
  iconUrl?: string;
  message: string | JSX.Element;
  checkboxText?: string;
  checkboxCallbacks?: () => void | (() => void)[];
  onClose?: () => void;
  animationClass?: string;
  buttons: {
    label: string;
    className: string;
    onClick: () => void;
  }[];
}

interface State {
  checkboxChecked: boolean;
}

class Alert extends React.Component<Props, State> {
  private messageRef: React.RefObject<HTMLPreElement>;

  constructor(props: Props) {
    super(props);
    this.state = {
      checkboxChecked: false,
    };
    this.messageRef = React.createRef();
  }

  componentDidMount(): void {
    const message = this.messageRef.current as Element;
    if (message) {
      const aElements = message.querySelectorAll('a');
      for (let i = 0; i < aElements.length; i += 1) {
        const a = aElements[i];
        a.addEventListener('click', (e) => {
          e.preventDefault();
          browser.open(a.getAttribute('href'));
        });
      }
    }
  }

  renderCaption = (): JSX.Element => {
    const { caption } = this.props;
    if (!caption) return null;

    return (
      <h2 className="caption">{caption}</h2>
    );
  };

  renderIcon = (): JSX.Element => {
    const { iconUrl } = this.props;
    if (!iconUrl) return null;

    return (
      <img className="icon" src={iconUrl} />
    );
  };

  renderMessage = (): JSX.Element => {
    const { message } = this.props;
    return typeof message === 'string'
      // eslint-disable-next-line react/no-danger
      ? <pre ref={this.messageRef} className="message" dangerouslySetInnerHTML={{ __html: message }} />
      : <pre className="message">{message}</pre>;
  };

  renderCheckbox = (): JSX.Element => {
    const { checkboxText } = this.props;
    const { checkboxChecked } = this.state;
    if (!checkboxText) return null;

    return (
      <div className="modal-checkbox">
        <input
          type="checkbox"
          onClick={() => this.setState({ checkboxChecked: !checkboxChecked })}
        />
        {checkboxText}
      </div>
    );
  };

  renderChildren = (): JSX.Element => {
    const { children } = this.props;
    if (!children) return null;

    return (
      <div className="alert-children">
        {children}
      </div>
    );
  };

  render = (): JSX.Element => {
    const {
      checkboxText, checkboxCallbacks, onClose, animationClass,
    } = this.props;
    let { buttons } = this.props;
    const { checkboxChecked } = this.state;
    buttons = buttons.map((b, i) => {
      const newButton = { ...b };
      const buttonCallback = b.onClick;
      if (!checkboxChecked || !checkboxText || !checkboxCallbacks) {
        newButton.onClick = () => {
          if (onClose) onClose();
          buttonCallback();
        };
      } else if (typeof checkboxCallbacks === 'function') {
        // Need to reset checkbox state after callback
        newButton.onClick = () => {
          // If only one checkbox callback passed, run checkbox callback after
          // runing button callback
          if (onClose) onClose();
          buttonCallback();
          checkboxCallbacks();
        };
      } else if ((checkboxCallbacks as (() => void)[]).length > i) {
        newButton.onClick = () => {
          // If more than one checkbox callbacks passed,
          // replace original checkbox callbacks.
          if (onClose) onClose();
          (checkboxCallbacks as (() => void)[])[i]();
        };
      } else {
        newButton.onClick = () => {
          if (onClose) onClose();
          buttonCallback();
        };
      }
      return newButton;
    });

    return (
      <Modal>
        <div className={classNames('modal-alert', animationClass)}>
          {this.renderCaption()}
          {this.renderIcon()}
          {this.renderMessage()}
          {this.renderChildren()}
          {this.renderCheckbox()}
          <ButtonGroup buttons={buttons} />
        </div>
      </Modal>
    );
  };
}

export default Alert;
