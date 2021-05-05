import * as React from 'react';
import AlertDialog from './AlertDialog';
import Modal from './Modal';
import ProgressConstants from '../constants/progress-constants';

interface Props {
  percentage: number;
  type: string;
  lang: any;
  hasStop: boolean;
  message: string;
  isOpen: boolean;
  caption: string;
  onStop: () => void;
}

interface State {
  percentage: number;
}

class Progress extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    const { percentage } = this.props;
    this.state = {
      percentage,
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    this.setState({
      percentage: nextProps.percentage,
    });
  }

  getButton() {
    const {
      type = ProgressConstants.WAITING,
      lang = {},
      onStop = () => { },
      hasStop = true,
    } = this.props;
    let buttons = [];

    // eslint-disable-next-line default-case
    switch (type) {
      case ProgressConstants.WAITING:
      case ProgressConstants.STEPPING:
        buttons.push({
          label: lang.alert.stop,
          dataAttrs: {
            'ga-event': 'stop',
          },
          onClick: onStop,
        });
        break;
      case ProgressConstants.NONSTOP:
        // No button
        break;
    }

    if (!hasStop) {
      buttons = [];
    }

    return buttons;
  }

  renderMessage() {
    const {
      type = ProgressConstants.WAITING,
      message = '',
    } = this.props;
    const progressIcon = this.renderIcon();

    switch (type) {
      case ProgressConstants.WAITING:
      case ProgressConstants.STEPPING:
        return (
          <div>
            <p>{message}</p>
            {progressIcon}
          </div>
        );
      case ProgressConstants.NONSTOP:
      case ProgressConstants.NONSTOP_WITH_MESSAGE:
        return progressIcon;
      default:
        return undefined;
    }
  }

  renderIcon() {
    const {
      type = ProgressConstants.WAITING,
      percentage = 0,
    } = this.props;
    const { percentage: statePercentage } = this.state;
    const progressStyle = {
      width: `${statePercentage || 0}%`,
    };
    let icon: JSX.Element;

    // eslint-disable-next-line default-case
    switch (type) {
      case ProgressConstants.WAITING:
      case ProgressConstants.NONSTOP:
      case ProgressConstants.NONSTOP_WITH_MESSAGE:
        icon = (
          <div className="spinner-roller spinner-roller-reverse" />
        );
        break;
      case ProgressConstants.STEPPING:
        icon = (
          <div className="progress-bar" data-percentage={percentage}>
            <div className="current-progress" style={progressStyle} />
          </div>
        );
        break;
    }
    return icon;
  }

  render() {
    const {
      isOpen = true,
      type = ProgressConstants.WAITING,
      lang = {},
      caption = '',
    } = this.props;

    if (!isOpen) {
      return <div />;
    }

    const content = (
      <AlertDialog
        lang={lang}
        caption={caption}
        message={this.renderMessage()}
        buttons={this.getButton()}
      />
    );
    const className = {
      'shadow-modal': true,
      waiting: ProgressConstants.WAITING === type,
      'modal-progress': true,
      'modal-progress-nonstop': ProgressConstants.NONSTOP === type,
      'modal-progress-nonstop-with-message': ProgressConstants.NONSTOP_WITH_MESSAGE === type,
    };

    return (
      <Modal className={className} content={content} disabledEscapeOnBackground={false} />
    );
  }
}

export default Progress;
