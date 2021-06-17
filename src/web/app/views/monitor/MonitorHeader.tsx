import React from 'react';

import { MonitorContext } from 'app/contexts/Monitor-Context';

export enum NavBtnType {
  NONE = 0,
  BACK = 1,
  FOLDER = 2,
}

interface Props {
  name: string,
  navBtnType: NavBtnType,
}

class MonitorHeader extends React.PureComponent<Props> {
  renderNavigationBtn(): JSX.Element {
    const { onNavigationBtnClick } = this.context;
    const { navBtnType } = this.props;
    if (navBtnType === NavBtnType.BACK) {
      return (
        <div className="back" onClick={onNavigationBtnClick}>
          <i className="fa fa-angle-left" />
        </div>
      );
    }
    if (navBtnType === NavBtnType.FOLDER) {
      return (
        <div className="back" onClick={onNavigationBtnClick}>
          <img src="img/folder.svg" />
        </div>
      );
    }
    return <div />;
  }

  render(): JSX.Element {
    const { name } = this.props;
    const { onClose } = this.context;
    return (
      <div className="header">
        <div className="title">
          <span>{name}</span>
          <div className="close" onClick={onClose}>
            <div className="x" />
          </div>
          {this.renderNavigationBtn()}
        </div>
      </div>
    );
  }
}

MonitorHeader.contextType = MonitorContext;

export default MonitorHeader;
