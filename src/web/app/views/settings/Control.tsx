import * as React from 'react';

import browser from 'implementations/browser';

interface Props {
  label: string,
  url?: string,
  warningText?: string,
  children: JSX.Element | JSX.Element[],
}

const Controls = ({
  label,
  url = '',
  warningText = null,
  children,
}: Props): JSX.Element => {
  const style = { width: 'calc(100% / 10 * 3 - 10px)' };
  const innerHtml = { __html: label };

  const warningIcon = () => {
    if (warningText) {
      return (<img src="img/warning.svg" title={warningText} />);
    }
    return null;
  };

  const renderIcon = () => {
    if (url) {
      return (
        <span className="info-icon-small">
          <img src="img/info.svg" onClick={() => { browser.open(url); }} />
        </span>
      );
    }
    return null;
  };

  return (
    <div className="row-fluid">
      <div className="span3 no-left-margin" style={style}>
        <label
          className="font2"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={innerHtml}
        />
        {renderIcon()}
      </div>
      <div className="span8 font3">
        {children}
        {warningIcon()}
      </div>
    </div>
  );
};

export default Controls;
