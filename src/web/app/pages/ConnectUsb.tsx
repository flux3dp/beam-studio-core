import * as React from 'react';

import i18n from 'helpers/i18n';
import Modal from 'app/widgets/Modal';

let lang = i18n.lang.initialize;
const updateLang = () => {
  lang = i18n.lang.initialize;
};

export default class ConnectUsb extends React.PureComponent {
  constructor(props) {
    super(props);
    updateLang();
  }

  renderContent = (): JSX.Element => (
    <div className="connection-usb">
      <div className="image-container usb">
        <div className="circle c1" />
        <img className="usb-cable-icon" src="img/init-panel/icon-usb-cable.svg" draggable="false" />
        <div className="circle c2" />
      </div>
      <div className="text-container">
        <div className="title">
          {lang.connect_usb.title}
          <span className="sub">{lang.connect_usb.title_sub}</span>
        </div>
        <div className="contents tutorial">
          <div>{lang.connect_usb.tutorial1}</div>
          <div>{lang.connect_usb.tutorial2}</div>
        </div>
      </div>
    </div>
  );

  renderButtons = (): JSX.Element => (
    <div className="btn-page-container">
      <div
        className="btn-page"
        onClick={() => { window.location.hash = '#initialize/connect/select-connection-type'; }}
      >
        {lang.back}
      </div>
      <div
        className="btn-page primary"
        onClick={() => { window.location.hash = '#initialize/connect/connect-machine-ip?usb=1'; }}
      >
        {lang.next}
      </div>
    </div>
  );

  render(): JSX.Element {
    const wrapperClassName = { initialization: true };
    const innerContent = this.renderContent();
    const content = (
      <div className="connect-machine">
        <div className="top-bar" />
        {this.renderButtons()}
        {innerContent}
      </div>
    );

    return (
      <Modal className={wrapperClassName} content={content} />
    );
  }
}
