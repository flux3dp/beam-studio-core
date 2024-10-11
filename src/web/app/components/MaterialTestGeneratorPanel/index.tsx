import React from 'react';

import useI18n from 'helpers/useI18n';

import { Button, Divider, Modal } from 'antd';
import { createLayer } from 'helpers/layer/layer-helper';
import svgEditor from 'app/actions/beambox/svg-editor';
import { writeDataLayer } from 'helpers/layer/layer-config-helper';
import constant from 'app/actions/beambox/constant';
import ISVGCanvas from 'interfaces/ISVGCanvas';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import updateElementColor from 'helpers/color/updateElementColor';
import history from 'app/svgedit/history/history';
import LayerPanelController from 'app/views/beambox/Right-Panels/contexts/LayerPanelController';
import styles from './index.module.scss';
import WorkAreaInfo from './WorkAreaInfo';
import TableSettingForm from './TableSettingForm';
import BlockSettingForm from './BlockSettingForm';
import { tableSetting as defaultTableSetting } from './TableSetting';

import 'react-resizable/css/styles.css';
import { blockSetting as defaultBlockSetting } from './BlockSetting';

import generateSvgInfo from './generateSvgInfo';

interface Props {
  isInch?: boolean;
  onClose: () => void;
}

let svgCanvas: ISVGCanvas;
// let svgedit;

getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
  // svgedit = globalSVG.Edit;
});

const { dpmm } = constant;

const MaterialTestGeneratorPanel = ({ isInch = false, onClose }: Props): JSX.Element => {
  const t = useI18n();
  const [isPreview, setIsPreview] = React.useState(false);
  const [tableSetting, setTableSetting] = React.useState(defaultTableSetting());
  const [blockSetting, setBlockSetting] = React.useState(defaultBlockSetting());

  return (
    <Modal
      open
      centered
      wrapClassName={styles['modal-wrap']}
      title={t.material_test_generator.title}
      onCancel={onClose}
      footer={
        <div className={styles.footer}>
          <Button onClick={onClose}>{t.global.cancel}</Button>
          <Button
            type="primary"
            onClick={() => {
              setIsPreview(true);

              const batchCmd = new history.BatchCommand('Material Test Generator');
              const svgInfos = generateSvgInfo({ tableSetting, blockSetting });
              const [paddingX, paddingY] = [100, 100];
              const { column, row } = blockSetting;
              // start from bottom right
              const [startX, startY] = [
                paddingX +
                  (column.count.value - 1) * (column.spacing.value + column.size.value) * dpmm,
                paddingY + +(row.count.value - 1) * (row.spacing.value + row.size.value) * dpmm,
              ];
              let [x, y] = [startX, startY];
              const [width, height] = [column.size.value * dpmm, row.size.value * dpmm];

              // reverse to make sure the top left block is on the top of the layer panel
              svgInfos.reverse().forEach(({ name, strength, speed, repeat }, index) => {
                svgCanvas.undoMgr.beginUndoableChange(name, []);

                const { layer, cmd } = createLayer(name);

                if (cmd && !cmd.isEmpty()) {
                  batchCmd.addSubCommand(cmd);
                }

                writeDataLayer(layer, 'power', strength);
                writeDataLayer(layer, 'speed', speed);
                writeDataLayer(layer, 'repeat', repeat);

                const newRect = svgCanvas.addSvgElementFromJson({
                  element: 'rect',
                  curStyles: false,
                  attr: {
                    x,
                    y,
                    width,
                    height,
                    stroke: '#000',
                    id: svgCanvas.getNextId(),
                    fill: 'none',
                    'fill-opacity': 0,
                    opacity: 1,
                  },
                });

                if ((index + 1) % blockSetting.column.count.value === 0) {
                  x = startX;
                  y -= (blockSetting.row.size.value + blockSetting.row.spacing.value) * dpmm;
                } else {
                  x -= (blockSetting.column.size.value + blockSetting.column.spacing.value) * dpmm;
                }

                updateElementColor(newRect);
              });

              svgCanvas.undoMgr.addCommandToHistory(batchCmd);

              svgEditor.updateContextPanel();
              LayerPanelController.updateLayerPanel();
            }}
          >
            {t.material_test_generator.preview}
          </Button>
        </div>
      }
    >
      <WorkAreaInfo isInch={isInch} />

      <Divider orientation="left" orientationMargin="0">
        {t.material_test_generator.table_settings}
      </Divider>

      <TableSettingForm
        isInch={isInch}
        tableSetting={tableSetting}
        handleChange={setTableSetting}
      />

      <Divider orientation="left" orientationMargin="0">
        {t.material_test_generator.block_settings}
      </Divider>

      <BlockSettingForm
        isInch={isInch}
        blockSetting={blockSetting}
        handleChange={setBlockSetting}
      />
    </Modal>
    // isPreview ? (
    //   <Modal
    //     open
    //     centered
    //     wrapClassName={styles['modal-wrap']}
    //     title={t.material_test_generator.title}
    //     onCancel={onClose}
    //     footer={
    //       <div className={styles.footer}>
    //         <Button onClick={() => setIsPreview(false)}>{t.global.back}</Button>
    //         <Button type="primary" onClick={handleSave}>
    //           {t.material_test_generator.export}
    //         </Button>
    //       </div>
    //     }
    //   >
    //     {/* <Beambox /> */}
    //     <Flex justify="space-between">
    //       <div className={styles['preview-subtext']}>Block size: 20mm x 20mm</div>
    //       <div className={styles['preview-subtext']}>Max size: 320mm x 400mm</div>
    //     </Flex>
    //   </Modal>
    // ) :
  );
};

export default MaterialTestGeneratorPanel;
