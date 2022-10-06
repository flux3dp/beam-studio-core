import * as React from 'react';
import classNames from 'classnames';

import browser from 'implementations/browser';
import FnWrapper from 'app/actions/beambox/svgeditor-function-wrapper';
import i18n from 'helpers/i18n';

const LANG = i18n.lang.beambox.left_panel;

interface Props {
  id: string;
  className: string;
  title: string;
  iconName: string;
  onClick: () => void;
}

const DrawingToolButton = ({
  id, className, title, iconName, onClick,
}: Props) => (
  <div id={id} className={className} title={title} onClick={onClick}>
    <img src={`img/left-bar/icon-${iconName}.svg`} draggable="false" />
  </div>
);

const DrawingToolButtonGroup = ({ className }: {
  className: string;
}): JSX.Element => {
  const [activeButton, setActiveButton] = React.useState('cursor');
  const renderToolButton = (
    iconName: string,
    id: string,
    label: string,
    onClick: () => void,
  ) => (
    <DrawingToolButton
      id={`left-${id}`}
      className={classNames('tool-btn', activeButton === iconName ? 'active' : '')}
      title={label}
      iconName={iconName}
      onClick={() => {
        setActiveButton(iconName);
        onClick();
      }}
    />
  );
  return (
    <div className={className}>
      {renderToolButton('cursor', 'Cursor', `${LANG.label.cursor} (V)`, FnWrapper.useSelectTool)}
      {renderToolButton('photo', 'Photo', `${LANG.label.photo} (I)`, FnWrapper.importImage)}
      {renderToolButton('text', 'Text', `${LANG.label.text} (T)`, FnWrapper.insertText)}
      {renderToolButton('rect', 'Rectangle', `${LANG.label.rect} (M)`, FnWrapper.insertRectangle)}
      {renderToolButton('oval', 'Ellipse', `${LANG.label.oval} (L)`, FnWrapper.insertEllipse)}
      {renderToolButton('polygon', 'Polygon', LANG.label.polygon, FnWrapper.insertPolygon)}
      {renderToolButton('line', 'Line', `${LANG.label.line} (\\)`, FnWrapper.insertLine)}
      {renderToolButton('draw', 'Pen', `${LANG.label.pen} (P)`, FnWrapper.insertPath)}
      {renderToolButton('dm', 'Design Market', 'Design Market', () => browser.open(i18n.lang.topbar.menu.link.design_market))}
    </div>
  );
};

export default DrawingToolButtonGroup;
