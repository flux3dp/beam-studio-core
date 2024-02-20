import React, { useContext, useState } from 'react';
import { Button, Form, Modal, Pagination, Switch } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';

import HistoryCommandFactory from 'app/svgedit/HistoryCommandFactory';
import importSvgString from 'app/svgedit/operations/import/importSvgString';
import ISVGLayer from 'interfaces/ISVGLayer';
import useI18n from 'helpers/useI18n';
import wrapSVG from 'helpers/boxgen/wrapSVG';
import { BoxgenContext } from 'app/contexts/BoxgenContext';
import { getLayouts } from 'helpers/boxgen/Layout';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import { IExportOptions } from 'interfaces/IBoxgen';

import styles from './ExportButton.module.scss';

let svgCanvas;
getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
});

const ExportDialog = ({
  visible,
  setVisible,
}: {
  visible: boolean;
  setVisible: (visible: boolean) => void;
}): JSX.Element => {
  const lang = useI18n().boxgen;
  const { boxData, workarea, onClose } = useContext(BoxgenContext);
  const [page, setPage] = useState(1);
  const [options, setOptions] = useState<IExportOptions>({
    joinOutput: false,
    textLabel: false,
  });
  const [confirmLoading, setConfirmLoading] = useState(false);
  if (!visible) return null;

  const { canvasWidth, canvasHeight } = workarea;
  const layouts = getLayouts(canvasWidth, canvasHeight, boxData, options);

  const handleOk = async () => {
    setConfirmLoading(true);
    const boxLayers = [];
    const newLayers = [];
    const drawing = svgCanvas.getCurrentDrawing();
    (drawing.all_layers as ISVGLayer[]).forEach((layer) => {
      // eslint-disable-next-line no-underscore-dangle
      if (layer.name_.startsWith('Box ')) boxLayers.push(layer.name_.split('-')[0]);
    });
    let i = 0;
    let uniqBoxName = '';
    do {
      i += 1;
      uniqBoxName = `Box ${i}`;
    } while (boxLayers.includes(uniqBoxName));
    const batchCmd = HistoryCommandFactory.createBatchCommand('Import box layer');
    const promises: Promise<SVGUseElement>[] = [];
    layouts.pages.forEach((pageContent, idx) => {
      let content = wrapSVG(canvasWidth, canvasHeight, pageContent.shape);
      promises.push(
        importSvgString(content, {
          type: 'layer',
          layerName: `${uniqBoxName}-${idx + 1}`,
          parentCmd: batchCmd,
        })
      );
      newLayers.push(`${uniqBoxName}-${idx + 1}`);
      if (options.textLabel) {
        content = wrapSVG(canvasWidth, canvasHeight, pageContent.label);
        promises.push(
          importSvgString(content, {
            type: 'layer',
            layerName: `${uniqBoxName}-${idx + 1} Label`,
            parentCmd: batchCmd,
          })
        );
        newLayers.push(`${uniqBoxName}-${idx + 1} Label`);
      }
    });
    const elems = (await Promise.allSettled(promises)).map((p) =>
      p.status === 'fulfilled' ? p.value : null
    );
    batchCmd.addSubCommand(await svgCanvas.disassembleUse2Group(elems, true, false, false));
    newLayers
      .slice(options.textLabel ? 2 : 1)
      .forEach((layername) => drawing.setLayerVisibility(layername, false));
    svgCanvas.addCommandToHistory(batchCmd);
    setConfirmLoading(false);
    setVisible(false);
    onClose();
  };

  return (
    <Modal
      title={lang.export}
      open={visible}
      onOk={handleOk}
      onCancel={() => setVisible(false)}
      okButtonProps={{ icon: <DownloadOutlined /> }}
      okText={lang.export}
      cancelText={lang.cancel}
      confirmLoading={confirmLoading}
    >
      <svg
        width="100%"
        height={250}
        viewBox={`-0.5 -0.5 ${canvasWidth + 0.5} ${canvasHeight + 0.5}`}
      >
        <rect
          x={0}
          y={0}
          width={canvasWidth}
          height={canvasHeight}
          style={{
            stroke: '#CCC',
            fill: 'none',
            strokeWidth: 1,
            strokeDasharray: 4,
          }}
        />
        {layouts.pages[page - 1].shape}
        {layouts.pages[page - 1].label}
      </svg>
      <Pagination
        className={styles.pagination}
        current={page}
        onChange={(value) => setPage(value)}
        total={layouts.pages.length}
        defaultPageSize={1}
      />
      <div className={styles['form-title']}>{lang.customize}</div>
      <Form
        className={styles.form}
        initialValues={options}
        onValuesChange={(values) => {
          setOptions({ ...options, ...values });
          setPage(1);
        }}
      >
        <Form.Item
          className={styles['form-item']}
          label={lang.merge}
          name="joinOutput"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
        <Form.Item
          className={styles['form-item']}
          label={lang.textLabel}
          name="textLabel"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
};

const ExportButton = (): JSX.Element => {
  const lang = useI18n().boxgen;
  const [visible, setVisible] = useState(false);
  return (
    <>
      <Button type="primary" onClick={() => setVisible(true)}>
        {lang.continue_export}
      </Button>
      <ExportDialog visible={visible} setVisible={setVisible} />
    </>
  );
};

export default ExportButton;
