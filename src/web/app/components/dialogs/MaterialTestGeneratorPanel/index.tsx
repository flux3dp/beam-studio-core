/* eslint-disable @typescript-eslint/no-shadow */
import React, { useMemo, useRef, useState } from 'react';

import useI18n from 'helpers/useI18n';

import { Button, Flex, Radio } from 'antd';
import { createLayer } from 'helpers/layer/layer-helper';
import svgEditor from 'app/actions/beambox/svg-editor';
import { writeDataLayer } from 'helpers/layer/layer-config-helper';
import constant, { promarkModels } from 'app/actions/beambox/constant';
import ISVGCanvas from 'interfaces/ISVGCanvas';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import updateElementColor from 'helpers/color/updateElementColor';
import history from 'app/svgedit/history/history';
import LayerPanelController from 'app/views/beambox/Right-Panels/contexts/LayerPanelController';
import storage from 'implementations/storage';
import createNewText from 'app/svgedit/text/createNewText';
import undoManager from 'app/svgedit/history/undoManager';
import { IBatchCommand } from 'interfaces/IHistory';
import workareaManager from 'app/svgedit/workarea';
import DraggableModal from 'app/widgets/DraggableModal';
import { getPromarkInfo } from 'helpers/device/promark/promark-info';
import beamboxPreference from 'app/actions/beambox/beambox-preference';
import { LaserType } from 'app/constants/promark-constants';
import styles from './index.module.scss';
import WorkAreaInfo from './WorkAreaInfo';
import TableSettingForm from './TableSettingForm';
import BlockSettingForm from './BlockSettingForm';
import { getTableSetting as defaultTableSetting } from './TableSetting';
import { textSetting as defaultTextSetting } from './TextSetting';
import { BlockSetting, blockSetting as defaultBlockSetting } from './BlockSetting';
import generateSvgInfo, { SvgInfo } from './generateSvgInfo';
import TextSettingForm from './TextSettingForm';

interface Props {
  onClose: () => void;
}

let svgCanvas: ISVGCanvas;

getSVGAsync(({ Canvas }) => {
  svgCanvas = Canvas;
});

const { dpmm } = constant;

const paramWidth = {
  speed: 81.61 * dpmm,
  strength: 60.66 * dpmm,
  repeat: 42.63 * dpmm,
  pulseWidth: 97.79 * dpmm,
  frequency: 97.31 * dpmm,
  fillInterval: 96.77 * dpmm,
};
const paramString = {
  speed: 'Speed (mm/s)',
  strength: 'Power (%)',
  repeat: 'Passes',
  pulseWidth: 'Pulse Width (ns)',
  frequency: 'Frequency (kHz)',
  fillInterval: 'Fill Interval (mm)',
};

const getTextAdjustment = (rawText: number | string) => (rawText.toString().length * 2.7) / 2;

const MaterialTestGeneratorPanel = ({ onClose }: Props): JSX.Element => {
  const t = useI18n();
  const isInch = useMemo(() => storage.get('default-units') === 'inches', []);
  const { laserType } = getPromarkInfo();
  const workarea = useMemo(() => beamboxPreference.read('workarea'), []);
  const { isPromark, isMopa } = useMemo(
    () => ({
      isPromark: promarkModels.has(workarea),
      isMopa: laserType === LaserType.MOPA,
    }),
    [laserType, workarea]
  );
  const [blockOption, setBlockOption] = useState<'cut' | 'engrave'>('cut');
  const [tableSetting, setTableSetting] = useState(defaultTableSetting(workarea, { laserType }));
  const [blockSetting, setBlockSetting] = useState(defaultBlockSetting);
  const [textSetting, setTextSetting] = useState(defaultTextSetting);
  const blockOptions = [
    { label: t.material_test_generator.cut, value: 'cut' },
    { label: t.material_test_generator.engrave, value: 'engrave' },
  ];
  const batchCmd = useRef(new history.BatchCommand('Material Test Generator'));

  const generateText = (
    svgInfos: Array<SvgInfo>,
    blockSetting: BlockSetting,
    batchCmd: IBatchCommand
  ) => {
    const { column, row } = blockSetting;
    const [startPadding, endPadding] = [30 * dpmm, 10 * dpmm];
    const [right, bottom] = [
      startPadding + (row.count.value - 1) * (row.spacing.value + row.size.value) * dpmm,
      startPadding + (column.count.value - 1) * (column.spacing.value + column.size.value) * dpmm,
    ];
    const rightBound = right + row.size.value * dpmm + endPadding * 2;
    const bottomBound = bottom + column.size.value * dpmm + endPadding;
    const [colParam, rowParam] = Object.entries(tableSetting).sort(
      ([, { selected: a }], [, { selected: b }]) => a - b
    );

    const { cmd: tableCmd } = createLayer('Material Test - Frame', {
      hexCode: '#000',
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

    const { layer: infoLayer, cmd: infoCmd } = createLayer('Material Test - Info', {
      hexCode: '#000',
      isSubCmd: true,
    });

    writeDataLayer(infoLayer, 'power', textSetting.power);
    writeDataLayer(infoLayer, 'speed', textSetting.speed);

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
        fill: '#000',
        isDefaultFont: true,
      }
    );

    const colText = createNewText(
      // magic number to align the text
      -(paramWidth[colParam[0]] * 0.55) + 13.19 * dpmm,
      startPadding + (bottom - startPadding) / 2 + paramWidth[colParam[0]] / 10,
      {
        text: paramString[colParam[0]],
        fontSize: 130,
        fill: '#000',
        isDefaultFont: true,
      }
    );

    svgCanvas.setRotationAngle(-90, true, colText);

    Array.from({ length: row.count.value }).forEach((_, index) => {
      createNewText(
        startPadding +
          10 * dpmm +
          (row.size.value + row.spacing.value) * dpmm * index +
          (row.size.value * dpmm) / 2 -
          getTextAdjustment(svgInfos[index][rowParam[0]]) * dpmm,
        startPadding - 5 * dpmm,
        {
          text: svgInfos[index][rowParam[0]].toString(),
          fontSize: 48,
          fill: '#000',
          isDefaultFont: true,
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
          fill: '#000',
          isDefaultFont: true,
        }
      );
    });
  };

  const generateBlocks = (
    svgInfos: Array<SvgInfo>,
    blockSetting: BlockSetting,
    batchCmd: IBatchCommand
  ) => {
    const { row, column } = blockSetting;
    const startPadding = 30 * dpmm;
    const [right, bottom] = [
      startPadding +
        10 * dpmm +
        (row.count.value - 1) * (row.spacing.value + row.size.value) * dpmm,
      startPadding + (column.count.value - 1) * (column.spacing.value + column.size.value) * dpmm,
    ];
    const [width, height] = [row.size.value * dpmm, column.size.value * dpmm];
    let [x, y] = [right, bottom];

    [...svgInfos]
      .reverse()
      .forEach(({ name, strength, speed, repeat, pulseWidth, frequency, fillInterval }, index) => {
        const { layer, cmd } = createLayer(name, { isSubCmd: true });

        if (cmd && !cmd.isEmpty()) {
          batchCmd.addSubCommand(cmd);
        }

        writeDataLayer(layer, 'power', strength);
        writeDataLayer(layer, 'speed', speed);
        writeDataLayer(layer, 'repeat', repeat);

        if (isPromark) {
          writeDataLayer(layer, 'fillInterval', fillInterval);
        }

        if (isMopa) {
          writeDataLayer(layer, 'pulseWidth', pulseWidth);
          writeDataLayer(layer, 'frequency', frequency);
        }

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
            fill: blockOption === 'engrave' ? '#000' : 'none',
            'fill-opacity': blockOption === 'engrave' ? 1 : 0,
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
  };

  const handlePreview = () => {
    const svgInfos = generateSvgInfo({ tableSetting, blockSetting });

    batchCmd.current.unapply();
    // to prevent layer id conflict
    svgCanvas.identifyLayers();

    batchCmd.current = new history.BatchCommand('Material Test Generator');

    generateBlocks(svgInfos, blockSetting, batchCmd.current);
    generateText(svgInfos, blockSetting, batchCmd.current);
  };

  const handleExport = () => {
    undoManager.addCommandToHistory(batchCmd.current);

    svgEditor.updateContextPanel();
    LayerPanelController.updateLayerPanel();

    onClose();
  };

  const handleCancel = () => {
    batchCmd.current.unapply();
    // to prevent layer id conflict
    svgCanvas.identifyLayers();

    onClose();
  };

  React.useEffect(() => {
    workareaManager.resetView();
    handlePreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableSetting, blockSetting, textSetting, blockOption]);

  return (
    <DraggableModal
      open
      centered
      wrapClassName={styles['modal-wrap']}
      title={t.material_test_generator.title}
      onCancel={handleCancel}
      footer={
        <div className={styles.footer}>
          <Button onClick={handleCancel}>{t.global.cancel}</Button>
          <Button type="primary" onClick={handleExport}>
            {t.material_test_generator.export}
          </Button>
        </div>
      }
    >
      <Flex className={styles['mb-28']} justify="space-between">
        <WorkAreaInfo isInch={isInch} />
        <Radio.Group
          options={blockOptions}
          onChange={({ target: { value } }) => {
            setBlockOption(value);
          }}
          value={blockOption}
          optionType="button"
        />
      </Flex>

      <TableSettingForm
        className={styles['mb-28']}
        isInch={isInch}
        tableSetting={tableSetting}
        workarea={workarea}
        laserType={laserType}
        blockOption={blockOption}
        handleChange={setTableSetting}
      />

      <BlockSettingForm
        className={styles['mb-28']}
        isInch={isInch}
        blockSetting={blockSetting}
        handleChange={setBlockSetting}
      />

      <TextSettingForm isInch={isInch} setting={textSetting} handleChange={setTextSetting} />
    </DraggableModal>
  );
};

export default MaterialTestGeneratorPanel;
