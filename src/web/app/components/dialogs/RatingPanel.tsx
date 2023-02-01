import * as React from 'react';
import { Checkbox, Form, Modal, Rate } from 'antd';

import i18n from 'helpers/i18n';
import RatingHelper from 'helpers/rating-helper';

const LANG = i18n.lang.beambox.rating_panel;

interface Props {
  onClose: () => void;
  onSubmit: (score: number) => void;
}

interface State {
  star?: number;
  tempStar?: number;
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

  onSubmit = (score: number): void => {
    const { onSubmit } = this.props;

    onSubmit(score);
    this.setState({ isFinished: true });
  };

  onCancel = (): void => {
    const { checkboxChecked } = this.state;
    const { onClose } = this.props;

    if (checkboxChecked) {
      RatingHelper.setNotShowing();
    }

    onClose();
  };

  renderMainContent(): JSX.Element {
    const { checkboxChecked } = this.state;
    return (
      <div className="main-content">
        <div>{LANG.description}</div>
        <Rate onChange={(star: number) => this.setState({ star })} />
        <Form>
          <Form.Item label={LANG.dont_show_again}>
            <Checkbox
              checked={checkboxChecked}
              onChange={(e) => this.setState({ checkboxChecked: e.target.checked })}
            />
          </Form.Item>
        </Form>
      </div>
    );
  }

  renderPanel(): JSX.Element {
    const { isFinished } = this.state;
    if (isFinished) {
      return (
        <strong>
          🙏
          {LANG.thank_you}
        </strong>
      );
    }
    return this.renderMainContent();
  }

  render(): JSX.Element {
    const { star, isFinished } = this.state;
    return (
      <Modal
        open
        centered
        title={`👨‍🚀 ${LANG.title}`}
        onCancel={this.onCancel}
        onOk={() => (isFinished ? this.onCancel() : this.onSubmit(star))}
      >
        {this.renderPanel()}
      </Modal>
    );
  }
}

export default RatingPanel;
