import React from 'react';
import Icon from '@ant-design/icons';
import ReactDomServer from 'react-dom/server';
import { CapsuleTabs } from 'antd-mobile';
import { Modal } from 'antd';

import FloatingPanel from 'app/widgets/FloatingPanel';
import history from 'app/svgedit/history';
import HistoryCommandFactory from 'app/svgedit/HistoryCommandFactory';
import i18n from 'helpers/i18n';
import importSvgString from 'app/svgedit/operations/import/importSvgString';
import LayerModule from 'app/constants/layer-module/layer-modules';
import ShapeIcon from 'app/icons/shape/ShapeIcon';
import Shapes, { ShapeTabs } from 'app/constants/shape-panel-constants';
import updateElementColor from 'helpers/color/updateElementColor';
import { DataType, getData } from 'helpers/layer/layer-config-helper';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import { getLayerByName } from 'helpers/layer/layer-helper';
import { useIsMobile } from 'helpers/system-helper';

import styles from './ShapePanel.module.scss';

let svgCanvas;
getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
});

const LANG = i18n.lang.beambox.shapes_panel;

const ShapePanel = ({ onClose }: { onClose: () => void }): JSX.Element => {
  const isMobile = useIsMobile();
  const anchors = [0, window.innerHeight - 40];
  const [close, setClose] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState(ShapeTabs[0]);

  const importShape = async (IconComponent, jsonMap) => {
    if (jsonMap) {
      const newElement = svgCanvas.addSvgElementFromJson({
        ...jsonMap,
        attr: { ...jsonMap.attr, id: svgCanvas.getNextId() },
      });
      svgCanvas.addCommandToHistory(new history.InsertElementCommand(newElement));
      if (svgCanvas.isUsingLayerColor) {
        updateElementColor(newElement);
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
      const drawing = svgCanvas.getCurrentDrawing();
      const layerName = drawing.getCurrentLayerName();
      const layerModule = getData<LayerModule>(getLayerByName(layerName), DataType.module);
      const batchCmd = HistoryCommandFactory.createBatchCommand('Shape Panel Import SVG');
      const newElementnewElement = await importSvgString(iconString, {
        type: 'layer',
        parentCmd: batchCmd,
        layerName,
        targetModule: layerModule,
      });
      const { width, height } = svgCanvas.getSvgRealLocation(newElementnewElement);
      const [newWidth, newHeight] = width > height ? [500, (height * 500) / width] : [(width * 500) / height, 500];
      svgCanvas.selectOnly([newElementnewElement]);
      batchCmd.addSubCommand(svgCanvas.setSvgElemSize('width', newWidth));
      batchCmd.addSubCommand(svgCanvas.setSvgElemSize('height', newHeight));
      batchCmd.addSubCommand(svgCanvas.setSvgElemPosition('x', 0, newElementnewElement, false));
      batchCmd.addSubCommand(svgCanvas.setSvgElemPosition('y', 0, newElementnewElement, false));
      newElementnewElement.setAttribute('data-ratiofixed', 'true');
      batchCmd.addSubCommand(await svgCanvas.disassembleUse2Group([newElementnewElement], true, false));
      updateElementColor(svgCanvas.getSelectedElems()[0]);
      svgCanvas.addCommandToHistory(batchCmd);
    }
    setClose(true);
    if (!isMobile) onClose();
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

  const scrollDivRef = React.useRef<HTMLDivElement>(null);
  const shodowRef = React.useRef<HTMLDivElement>(null);
  const handleShadow = () => {
    if (scrollDivRef.current && shodowRef.current) {
      if (
        // add extra 5px to fix windows browser precision
        scrollDivRef.current.scrollTop + scrollDivRef.current.clientHeight + 5 >=
        scrollDivRef.current.scrollHeight
      ) {
        shodowRef.current.style.display = 'none';
      } else {
        shodowRef.current.style.display = 'block';
      }
    }
  };
  React.useEffect(handleShadow, [activeTab]);

  return isMobile ? (
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
      <div className={styles['icon-list']}>
        {Shapes[activeTab]?.map((icon) => renderIcon(icon))}
      </div>
    </FloatingPanel>
  ) : (
    <Modal onCancel={onClose} title={LANG.title} footer={null} width={420} open={!close} centered>
      <CapsuleTabs className={styles.tabs} activeKey={activeTab} onChange={setActiveTab}>
        {ShapeTabs.map((key) => (
          <CapsuleTabs.Tab title={LANG[key]} key={key} />
        ))}
      </CapsuleTabs>
      <div className={styles['shadow-container']}>
        <div ref={scrollDivRef} className={styles['scroll-content']} onScroll={handleShadow}>
          <div className={styles['icon-list']}>
            {Shapes[activeTab]?.map((icon) => renderIcon(icon))}
          </div>
        </div>
        <div className={styles.shadow} ref={shodowRef} />
      </div>
    </Modal>
  );
};

export default ShapePanel;
