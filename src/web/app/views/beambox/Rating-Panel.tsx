import i18n from 'helpers/i18n';
import * as React from 'react';
import Modal from 'app/widgets/Modal';
import RatingHelper from 'helpers/rating-helper';

const LANG = i18n.lang.beambox.rating_panel;

interface Props {
  onClose: () => void;
  onSubmit: (score :number) => void;
}

interface State {
  star?: number;
  tempStar?: number,
  checkboxChecked: boolean;
  isFinished: boolean;
}

class RatingPanel extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      checkboxChecked: false,
      isFinished: false,
      star: 0,
    };
  }

  handleStarClick = (num: number): void => {
    this.setState({ star: num });
  };

  handleStarMouseEnter = (num: number): void => {
    this.setState({ tempStar: num });
  };

  handleStarMouseLeave = (): void => {
    this.setState({ tempStar: 0 });
  };

  onSubmit = (score: number): void => {
    const { onSubmit } = this.props;

    onSubmit(score);
    this.setState({ isFinished: true });
  };

  close = (): void => {
    const { onClose } = this.props;
    onClose();
  };

  onCancel = (): void => {
    const { checkboxChecked } = this.state;

    if (checkboxChecked) {
      RatingHelper.setNotShowing();
    }

    this.close();
  };

  renderStars(): JSX.Element {
    const { star, tempStar } = this.state;

    return (
      <div className="stars">
        <img
          src={tempStar > 0 || (tempStar === 0 && star > 0) ? 'img/YellowStar.svg' : 'img/WhiteStar.svg'}
          onClick={() => this.handleStarClick(1)}
          onMouseEnter={() => this.handleStarMouseEnter(1)}
          onMouseLeave={this.handleStarMouseLeave}
        />
        <img
          src={tempStar > 1 || (tempStar === 0 && star > 1) ? 'img/YellowStar.svg' : 'img/WhiteStar.svg'}
          onClick={() => this.handleStarClick(2)}
          onMouseEnter={() => this.handleStarMouseEnter(2)}
          onMouseLeave={this.handleStarMouseLeave}
        />
        <img
          src={tempStar > 2 || (tempStar === 0 && star > 2) ? 'img/YellowStar.svg' : 'img/WhiteStar.svg'}
          onClick={() => this.handleStarClick(3)}
          onMouseEnter={() => this.handleStarMouseEnter(3)}
          onMouseLeave={this.handleStarMouseLeave}
        />
        <img
          src={tempStar > 3 || (tempStar === 0 && star > 3) ? 'img/YellowStar.svg' : 'img/WhiteStar.svg'}
          onClick={() => this.handleStarClick(4)}
          onMouseEnter={() => this.handleStarMouseEnter(4)}
          onMouseLeave={this.handleStarMouseLeave}
        />
        <img
          src={tempStar > 4 || (tempStar === 0 && star > 4) ? 'img/YellowStar.svg' : 'img/WhiteStar.svg'}
          onClick={() => this.handleStarClick(5)}
          onMouseEnter={() => this.handleStarMouseEnter(5)}
          onMouseLeave={this.handleStarMouseLeave}
        />
      </div>
    );
  }

  renderMainContent(): JSX.Element {
    const { checkboxChecked } = this.state;
    return (
      <div className="main-content">
        <div className="icon">
          <img src="icon.png" />
        </div>
        <h2 className="caption" style={{ textAlign: 'center' }}>
          {LANG.title}
        </h2>
        <div className="description">
          {LANG.description}
        </div>
        {this.renderStars()}
        <div
          className="modal-checkbox"
          onClick={() => { this.setState({ checkboxChecked: !checkboxChecked }); }}
        >
          <input
            type="checkbox"
            checked={checkboxChecked}
          />
          <div>{LANG.dont_show_again}</div>
        </div>
      </div>
    );
  }

  renderFooter(): JSX.Element {
    const { star } = this.state;
    return (
      <div className="footer">
        {this.renderButton('primary', () => this.onSubmit(star), 'Submit', star === 0)}
        {this.renderButton('secondary', () => this.onCancel(), 'Cancel')}
      </div>
    );
  }

  renderButton = (
    className: string, onClick: React.MouseEventHandler, label: string, disabled?: boolean,
  ): JSX.Element => {
    let classNames = `btn btn-default ${className}`;
    if (disabled) {
      classNames += ' disabled';
    }
    return (
      <button
        type="button"
        className={classNames}
        onClick={onClick}
        disabled={disabled}
      >
        {label}
      </button>
    );
  };

  renderPanel(): JSX.Element {
    const { isFinished } = this.state;
    if (isFinished) {
      return (
        <div className="thank-you">
          <div className="icon">
            <img src="img/ShakeHands.svg" />
          </div>
          <h2 className="caption" style={{ textAlign: 'center' }}>
            {LANG.thank_you}
          </h2>
          <div className="footer">
            {this.renderButton('primary', () => this.onCancel(), 'Close')}
          </div>
        </div>
      );
    }
    return (
      <div className="rating-panel">
        {this.renderMainContent()}
        {this.renderFooter()}
      </div>
    );
  }

  render(): JSX.Element {
    return (
      <Modal onClose={() => {}}>
        {this.renderPanel()}
      </Modal>
    );
  }
}

export default RatingPanel;
