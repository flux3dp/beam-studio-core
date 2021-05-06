import * as i18n from 'helpers/i18n';
import * as React from 'react';
import Constants from 'app/constants/input-lightbox-constants';
import AlertDialog from './AlertDialog';
import Modal from './Modal';

const classNames = requireNode('classnames');
const PropTypes = requireNode('prop-types');

var acceptableTypes = [
  Constants.TYPE_TEXT,
  Constants.TYPE_NUMBER,
  Constants.TYPE_PASSWORD,
  Constants.TYPE_FILE
];

interface Props {
  type: string;
  confirmText: string;
  inputHeader: string;
  defaultValue: string;
  maxLength: number;
  isOpen: boolean;
  lang?: any;
  caption: string;
  onClose: (from: string) => void;
  onSubmit: (value: string) => void | Promise<void>;
}

interface State {
  allowSubmit: boolean;
}

class InputLightBox extends React.Component<Props, State> {
  static defaultProps: Props = {
    isOpen: true,
    lang: i18n.lang,
    type: Constants.TYPE_TEXT,
    maxLength: 255,
    inputHeader: '',
    defaultValue: '',
    confirmText: '',
    caption: '',
    onClose: function () { },
    onSubmit: function () { }
  };

  private inputRef: React.RefObject<HTMLInputElement>;

  constructor(props) {
    super(props);
    this.state = {
      allowSubmit: false
    };
    this.inputRef = React.createRef();
  }

  // button actions
  onClose = (e, from: string) => {
    e.preventDefault();
    this.props.onClose(from);
  }

  onCancel = (e, reactid) => {
    e.preventDefault();
    this.onClose(e, 'cancel');
  }

  onSubmit = (e) => {
    e.preventDefault();

    var returnValue,
      result;
    const inputElement = this.inputRef.current;
    if (Constants.TYPE_FILE === this.props.type) {
      returnValue = inputElement.files;
    } else {
      returnValue = inputElement.value;
    }

    result = this.props.onSubmit(returnValue);

    this.onClose(e, 'submit');
  }

  handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
  }

  inputKeyUp = (e) => {
    var targetFiles = e.currentTarget.files || {};
    this.setState({
      allowSubmit: (
        0 < e.currentTarget.value.length ||
        0 < (targetFiles.length || 0)
      )
    });
  }

  _getButtons = (lang) => {
    var buttons = [];

    buttons.push({
      label: lang.alert.cancel,
      dataAttrs: {
        'ga-event': 'cancel'
      },
      onClick: this.onCancel
    });

    buttons.push({
      label: this.props.confirmText || lang.alert.confirm,
      className: classNames('primary', {
        'btn-default': true,
        'btn-disabled': false === this.state.allowSubmit,
      }),
      dataAttrs: {
        'ga-event': 'confirm'
      },
      onClick: this.onSubmit
    });

    return buttons;
  }

  _getMessage = () => {
    var typeMap = {},
      type = 'text',
      inputHeader = (
        '' !== this.props.inputHeader ?
          <span className="inputHeader">{this.props.inputHeader}</span> :
          ''
      );

    typeMap[Constants.TYPE_TEXT] = 'text';
    typeMap[Constants.TYPE_NUMBER] = 'number';
    typeMap[Constants.TYPE_PASSWORD] = 'password';
    typeMap[Constants.TYPE_FILE] = 'file';

    if ('string' === typeof typeMap[this.props.type]) {
      type = typeMap[this.props.type];
    }

    return (
      <label className="control">
        {inputHeader}
        <input
          type={type}
          ref={this.inputRef}
          defaultValue={this.props.defaultValue}
          autoFocus={true}
          onKeyDown={(e: React.KeyboardEvent) => this.handleKeyDown(e)}
          onKeyUp={this.inputKeyUp}
          onChange={this.inputKeyUp}
          maxLength={this.props.maxLength}
        />
      </label>
    );
  }

  render() {
    if (false === this.props.isOpen) {
      return (<div />);
    }

    var lang = this.props.lang,
      buttons = this._getButtons(lang),
      message = this._getMessage(),
      content = (
        <form className="form" onSubmit={this.onSubmit}>
          <AlertDialog
            caption={this.props.caption}
            message={message}
            buttons={buttons}
          />
        </form>
      ),
      className = {
        'shadow-modal': true,
        'modal-input-lightbox': true
      };

    return (
      <Modal className={className} content={content} disabledEscapeOnBackground={false} />
    );
  }
};

export default InputLightBox;
