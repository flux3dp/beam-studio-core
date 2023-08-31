import * as React from 'react';
import classNames from 'classnames';
import Icon from '@ant-design/icons';
import ReactDomServer from 'react-dom/server';
import { CapsuleTabs } from 'antd-mobile';

import FloatingPanel from 'app/widgets/FloatingPanel';
import i18n from 'helpers/i18n';
import ShapeIcon from 'app/icons/shape/ShapeIcon';
import Shapes, { ShapeTabs } from 'app/constants/shape-panel-constants';
import { getSVGAsync } from 'helpers/svg-editor-helper';

import styles from './ShapePanel.module.scss';

let svgCanvas;
getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
});

const LANG = i18n.lang.beambox.shapes_panel;

const ShapePanel = ({ onClose }: { onClose: () => void }): JSX.Element => {
  const anchors = [0, window.innerHeight - 40];
  const [close, setClose] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState(ShapeTabs[0]);

  const importShape = async (IconComponent, jsonMap) => {
    if (jsonMap) {
      const newElement = svgCanvas.addSvgElementFromJson({
        ...jsonMap,
        attr: { ...jsonMap.attr, id: svgCanvas.getNextId() },
      });
      if (svgCanvas.isUsingLayerColor) {
        svgCanvas.updateElementColor(newElement);
      }
      // Ensure ObjectPanelContextProvider has mounted in mobile
      await svgCanvas.selectOnly([newElement]);
      // Update ObjectPanelContext
      svgCanvas.selectOnly([newElement]);
    } else {
      const iconString = ReactDomServer.renderToStaticMarkup(<IconComponent />).replace(
        /fill= ?"#(fff(fff)?|FFF(FFF))"/g,
        'fill="none"'
      );
      const newElementnewElement = await svgCanvas.importSvgString(iconString, 'layer', undefined);
      const { width, height } = svgCanvas.getSvgRealLocation(newElementnewElement);
      const [newWidth, newHeight] = width > height ? [500, (height * 500) / width] : [(width * 500) / height, 500];
      svgCanvas.selectOnly([newElementnewElement]);
      svgCanvas.setSvgElemSize('width', newWidth);
      svgCanvas.setSvgElemSize('height', newHeight);
      svgCanvas.setSvgElemPosition('x', 0);
      svgCanvas.setSvgElemPosition('y', 0);
      svgCanvas.disassembleUse2Group([newElementnewElement], true);
    }
    setClose(true);
  };
  const renderIcon = ({ name, jsonMap }) => {
    const IconComponent = ShapeIcon[name];
    return (
      IconComponent && (
        <Icon
          key={`${activeTab}-${name}`}
          className={styles.icon}
          component={IconComponent}
          onClick={() => importShape(IconComponent, jsonMap)}
        />
      )
    );
  };

  return (
    <FloatingPanel
      anchors={anchors}
      title={LANG.title}
      fixedContent={(
        <CapsuleTabs className={styles.tabs} activeKey={activeTab} onChange={setActiveTab}>
          {ShapeTabs.map((key) => (
            <CapsuleTabs.Tab title={LANG[key]} key={key} />
          ))}
        </CapsuleTabs>
      )}
      forceClose={close}
      onClose={onClose}
    >
      <div className={classNames(styles['icon-list'])}>
        {Shapes[activeTab]?.map((icon) => renderIcon(icon))}
      </div>
    </FloatingPanel>
  );
};

export default ShapePanel;