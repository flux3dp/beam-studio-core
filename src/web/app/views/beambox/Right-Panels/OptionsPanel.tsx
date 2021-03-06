import * as React from 'react';

import ImageOptions from 'app/views/beambox/Right-Panels/Options-Blocks/Image-Options';
import InFillBlock from 'app/views/beambox/Right-Panels/Options-Blocks/InFillBlock';
import PolygonOptions from 'app/views/beambox/Right-Panels/Options-Blocks/PolygonOptions';
import RectOptions from 'app/views/beambox/Right-Panels/Options-Blocks/RectOptions';
import TextOptions from 'app/views/beambox/Right-Panels/Options-Blocks/TextOptions';

interface Props {
  elem: Element;
  rx: number;
  polygonSides?: number;
  updateObjectPanel: () => void;
  updateDimensionValues: (val: { [key: string]: any }) => void;
}

function OptionsPanel({
  elem, rx, polygonSides, updateObjectPanel, updateDimensionValues,
}: Props): JSX.Element {
  let contents: JSX.Element;
  if (elem) {
    if (elem.tagName.toLowerCase() === 'rect') {
      contents = (
        <RectOptions
          elem={elem}
          rx={rx}
          updateDimensionValues={updateDimensionValues}
        />
      );
    } else if (elem.tagName.toLowerCase() === 'polygon') {
      contents = (
        <PolygonOptions
          elem={elem}
          polygonSides={polygonSides}
        />
      );
    } else if (elem.tagName.toLowerCase() === 'text') {
      contents = (
        <TextOptions
          elem={elem}
          textElement={elem as SVGTextElement}
          updateObjectPanel={updateObjectPanel}
          updateDimensionValues={updateDimensionValues}
        />
      );
    } else if (elem.tagName.toLowerCase() === 'image' || elem.tagName.toLowerCase() === 'img') {
      contents = <ImageOptions elem={elem} updateObjectPanel={updateObjectPanel} />;
    } else if (elem.tagName.toLowerCase() === 'g' && elem.getAttribute('data-textpath-g')) {
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
    } else {
      contents = <InFillBlock elem={elem} />;
    }
  }

  return (
    <div className="options-panel">
      <div className="title">OPTIONS</div>
      {contents}
    </div>
  );
}

export default OptionsPanel;
