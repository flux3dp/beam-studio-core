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
import createNewText from 'app/svgedit/text/createNewText';
import undoManager from 'app/svgedit/history/undoManager';
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

getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
});

const { dpmm } = constant;

const paramWidth = {
  speed: 81.61 * dpmm,
  strength: 60.66 * dpmm,
  repeat: 42.63 * dpmm,
};
const paramString = {
  speed: 'Speed (mm/s)',
  strength: 'Power (%)',
  repeat: 'Passes',
};

const getTextAdjustment = (rawText: number | string) => (rawText.toString().length * 2.7) / 2;

const MaterialTestGeneratorPanel = ({ isInch = false, onClose }: Props): JSX.Element => {
  const t = useI18n();
  const [tableSetting, setTableSetting] = React.useState(defaultTableSetting());
  const [blockSetting, setBlockSetting] = React.useState(defaultBlockSetting());

  const handleExport = () => {
    const batchCmd = new history.BatchCommand(`Material Test Generator`);
    const svgInfos = generateSvgInfo({ tableSetting, blockSetting });
    const [startPadding, endPadding] = [30 * dpmm, 10 * dpmm];
    const { column, row } = blockSetting;
    // position of box, start from bottom right.
    // to make sure the top left block is on the top of the layer panel.
    const [right, bottom] = [
      startPadding + (row.count.value - 1) * (row.spacing.value + row.size.value) * dpmm,
      startPadding + (column.count.value - 1) * (column.spacing.value + column.size.value) * dpmm,
    ];
    const [width, height] = [row.size.value * dpmm, column.size.value * dpmm];
    let [x, y] = [right, bottom];
    const rightBound = right + row.size.value * dpmm + endPadding;
    const bottomBound = bottom + column.size.value * dpmm + endPadding;
    const [colParam, rowParam] = Object.entries(tableSetting).sort(
      ([, { selected: a }], [, { selected: b }]) => a - b
    );

    const { cmd: tableCmd } = createLayer('Material Test Generator - Table', {
      isSubCmd: true,
    });

    if (tableCmd && !tableCmd.isEmpty()) {
      batchCmd.addSubCommand(tableCmd);
    }

    svgCanvas.addSvgElementFromJson({
      element: 'rect',
      curStyles: false,
      attr: {
        x: 0,
        y: 0,
        width: rightBound,
        height: bottomBound,
        stroke: '#000',
        id: svgCanvas.getNextId(),
        fill: 'none',
        'fill-opacity': 0,
        opacity: 1,
        rx: 50,
      },
    });

    const { cmd: infoCmd } = createLayer('Material Test Generator - Info', {
      hexCode: '#000',
      isSubCmd: true,
    });

    if (infoCmd && !infoCmd.isEmpty()) {
      batchCmd.addSubCommand(infoCmd);
    }

    // rowText
    createNewText(
      startPadding + (right - startPadding) / 2 - paramWidth[rowParam[0]] / 2,
      startPadding / 2,
      {
        text: paramString[rowParam[0]],
        fontSize: 130,
      }
    );

    const colText = createNewText(
      -paramWidth[colParam[0]] / 3,
      startPadding + (bottom - startPadding) / 2 + paramWidth[colParam[0]] / 10,
      {
        text: paramString[colParam[0]],
        fontSize: 130,
      }
    );

    svgCanvas.setRotationAngle(-90, true, colText);

    Array.from({ length: row.count.value }).forEach((_, index) => {
      createNewText(
        startPadding +
          (row.size.value + row.spacing.value) * dpmm * index +
          (row.size.value * dpmm) / 2 -
          getTextAdjustment(svgInfos[index][rowParam[0]]) * dpmm,
        startPadding - 5 * dpmm,
        {
          text: svgInfos[index][rowParam[0]].toString(),
          fontSize: 48,
        }
      );
    });

    Array.from({ length: column.count.value }).forEach((_, index) => {
      createNewText(
        startPadding - 10 * dpmm,
        startPadding +
          (column.size.value + column.spacing.value) * dpmm * index +
          (column.size.value / 2) * dpmm +
          (4 / 2) * dpmm,
        {
          text: svgInfos[index * row.count.value][colParam[0]].toString(),
          fontSize: 48,
        }
      );
    });

    // reverse to make sure the top left block is on the top of the layer panel
    svgInfos.reverse().forEach(({ name, strength, speed, repeat }, index) => {
      const { layer, cmd } = createLayer(name, { isSubCmd: true });

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

      if ((index + 1) % row.count.value === 0) {
        x = right;
        y -= (column.size.value + column.spacing.value) * dpmm;
      } else {
        x -= (row.size.value + row.spacing.value) * dpmm;
      }

      updateElementColor(newRect);
    });

    undoManager.addCommandToHistory(batchCmd);

    svgEditor.updateContextPanel();
    LayerPanelController.updateLayerPanel();
    onClose();
  };

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
          <Button type="primary" onClick={handleExport}>
            {t.material_test_generator.export}
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
  );
};

export default MaterialTestGeneratorPanel;
