import React, { useEffect, useState } from 'react';

import browser from 'implementations/browser';
import dialogCaller from 'app/actions/dialog-caller';
import eventEmitterFactory from 'helpers/eventEmitterFactory';
import FnWrapper from 'app/actions/beambox/svgeditor-function-wrapper';
import i18n from 'helpers/i18n';
import LeftPanelIcons from 'app/icons/left-panel/LeftPanelIcons';
import LeftPanelButton from 'app/components/beambox/left-panel/LeftPanelButton';
import { getCurrentUser } from 'helpers/api/flux-id';

const LANG = i18n.lang.beambox.left_panel;

const eventEmitter = eventEmitterFactory.createEventEmitter('drawing-tool');

const DrawingToolButtonGroup = ({ className }: { className: string }): JSX.Element => {
  const [activeButton, setActiveButton] = useState('Cursor');
  const isSubscribed = getCurrentUser()?.info?.subscription?.is_valid;
  const renderToolButton = (
    id: string,
    icon: JSX.Element,
    label: string,
    onClick: () => void,
    showBadge?: boolean
  ) => (
    <LeftPanelButton
      id={`left-${id}`}
      active={activeButton === id}
      title={label}
      icon={icon}
      onClick={() => {
        setActiveButton(id);
        onClick();
      }}
      showBadge={showBadge}
    />
  );

  useEffect(() => {
    eventEmitter.on('SET_ACTIVE_BUTTON', setActiveButton);
    return () => {
      eventEmitter.removeListener('SET_ACTIVE_BUTTON');
    };
  }, []);

  return (
    <div className={className}>
      {renderToolButton(
        'Cursor',
        <LeftPanelIcons.Cursor />,
        `${LANG.label.cursor} (V)`,
        FnWrapper.useSelectTool
      )}
      {renderToolButton(
        'Photo',
        <LeftPanelIcons.Photo />,
        `${LANG.label.photo} (I)`,
        FnWrapper.importImage
      )}
      {renderToolButton(
        'MyCloud',
        <LeftPanelIcons.Cloud />,
        LANG.label.my_cloud,
        () => dialogCaller.showMyCloud(FnWrapper.useSelectTool),
        isSubscribed
      )}
      {renderToolButton(
        'Text',
        <LeftPanelIcons.Text />,
        `${LANG.label.text} (T)`,
        FnWrapper.insertText
      )}
      {renderToolButton('Element', <LeftPanelIcons.Element />, `${LANG.label.shapes} (E)`, () =>
        dialogCaller.showShapePanel(FnWrapper.useSelectTool)
      )}
      {renderToolButton(
        'Rectangle',
        <LeftPanelIcons.Rect />,
        `${LANG.label.rect} (M)`,
        FnWrapper.insertRectangle
      )}
      {renderToolButton(
        'Ellipse',
        <LeftPanelIcons.Oval />,
        `${LANG.label.oval} (L)`,
        FnWrapper.insertEllipse
      )}
      {renderToolButton(
        'Polygon',
        <LeftPanelIcons.Polygon />,
        LANG.label.polygon,
        FnWrapper.insertPolygon
      )}
      {renderToolButton(
        'Line',
        <LeftPanelIcons.Line />,
        `${LANG.label.line} (\\)`,
        FnWrapper.insertLine
      )}
      {renderToolButton(
        'Pen',
        <LeftPanelIcons.Draw />,
        `${LANG.label.pen} (P)`,
        FnWrapper.insertPath
      )}
      {renderToolButton('QRCode', <LeftPanelIcons.QRCode />, LANG.label.qr_code, () =>
        dialogCaller.showQRCodeGenerator(FnWrapper.useSelectTool)
      )}
      {renderToolButton('Boxgen', <LeftPanelIcons.Boxgen />, LANG.label.boxgen, () =>
        dialogCaller.showBoxGen(FnWrapper.useSelectTool)
      )}
      {renderToolButton('DM', <LeftPanelIcons.DM />, 'Design Market', () =>
        browser.open(i18n.lang.topbar.menu.link.design_market)
      )}
    </div>
  );
};

export default DrawingToolButtonGroup;
