import React, { useMemo } from 'react';

import ColorPanel from 'app/views/beambox/Right-Panels/ColorPanel';
import ImageOptions from 'app/views/beambox/Right-Panels/Options-Blocks/Image-Options';
import InFillBlock from 'app/views/beambox/Right-Panels/Options-Blocks/InFillBlock';
import ObjectPanelItem from 'app/views/beambox/Right-Panels/ObjectPanelItem';
import PolygonOptions from 'app/views/beambox/Right-Panels/Options-Blocks/PolygonOptions';
import RectOptions from 'app/views/beambox/Right-Panels/Options-Blocks/RectOptions';
import TextOptions from 'app/views/beambox/Right-Panels/Options-Blocks/TextOptions';
import { getObjectLayer } from 'helpers/layer/layer-helper';
import { useIsMobile } from 'helpers/system-helper';

import styles from './OptionsPanel.module.scss';

interface Props {
  elem: Element;
  rx: number;
  polygonSides?: number;
  updateObjectPanel: () => void;
  updateDimensionValues: (val: { [key: string]: any }) => void;
}

function OptionsPanel({
  elem,
  rx,
  polygonSides,
  updateObjectPanel,
  updateDimensionValues,
}: Props): JSX.Element {
  const isMobile = useIsMobile();
  let contents: JSX.Element | JSX.Element[];
  const showColorPanel = useMemo(() => {
    if (!elem) return false;
    if (!['rect', 'ellipse', 'path', 'text', 'polygon'].includes(elem?.tagName.toLowerCase())) return false;
    return getObjectLayer(elem as SVGElement)?.elem?.getAttribute('data-fullcolor') === '1';
  }, [elem]);
  if (elem) {
    const tagName = elem.tagName.toLowerCase();
    if (tagName === 'rect') {
      contents = [
        <RectOptions
          key="rect"
          elem={elem}
          rx={rx}
          updateDimensionValues={updateDimensionValues}
        />,
        showColorPanel ? null : <InFillBlock key="fill" elem={elem} />,
      ];
    } else if (tagName === 'polygon') {
      contents = [
        <PolygonOptions key="polygon" elem={elem} polygonSides={polygonSides} />,
        showColorPanel ? null : <InFillBlock key="fill" elem={elem} />,
      ];
    } else if (tagName === 'text') {
      contents = [
        <TextOptions
          key="text"
          elem={elem}
          textElement={elem as SVGTextElement}
          updateObjectPanel={updateObjectPanel}
          updateDimensionValues={updateDimensionValues}
        />,
        showColorPanel ? null : <InFillBlock key="fill" elem={elem} />,
      ];
    } else if (tagName === 'image' || tagName === 'img') {
      if (elem.getAttribute('data-fullcolor') === '1') contents = null;
      else contents = <ImageOptions elem={elem} updateObjectPanel={updateObjectPanel} />;
    } else if (tagName === 'g' && elem.getAttribute('data-textpath-g')) {
      const textElem = elem.querySelector('text');
      contents = (
        <TextOptions
          isTextPath
          elem={elem}
          textElement={textElem}
          updateObjectPanel={updateObjectPanel}
          updateDimensionValues={updateDimensionValues}
        />
      );
    } else if (!showColorPanel) {
      contents = <InFillBlock elem={elem} />;
    }
  }

  return isMobile ? (
    <div className={styles.container}>
      <ObjectPanelItem.Divider />
      {contents}
      {showColorPanel && <ColorPanel elem={elem} />}
    </div>
  ) : (
    <>
      {contents && (
        <div className={styles.panel}>
          <div className={styles.title}>OPTIONS</div>
        {contents}
      </div>
      )}
      {showColorPanel && <ColorPanel elem={elem} />}
    </>
  );
}

export default OptionsPanel;
