import * as React from 'react';
import ImageOptions from 'app/views/beambox/Right-Panels/Options-Blocks/Image-Options';
import InFillBlock from 'app/views/beambox/Right-Panels/Options-Blocks/InFillBlock';
import RectOptions from 'app/views/beambox/Right-Panels/Options-Blocks/RectOptions';
import TextOptions from 'app/views/beambox/Right-Panels/Options-Blocks/Text-Options';

interface Props {
  elem: Element;
  updateObjectPanel: () => void;
  dimensionValues: {[key: string]: any};
  updateDimensionValues: (val: { [key: string]: any }) => void;
}
class OptionsPanel extends React.Component<Props> {
  render() {
    const { elem, updateObjectPanel, dimensionValues, updateDimensionValues } = this.props;
    let contents: JSX.Element;
    if (elem) {
      if (elem.tagName === 'rect') {
        contents = (
          <RectOptions
            elem={elem}
            rx={dimensionValues.rx}
            updateDimensionValues={updateDimensionValues}
          />
        );
      } else if (elem.tagName === 'text') {
        contents = (
          <TextOptions
            elem={elem}
            updateObjectPanel={updateObjectPanel}
            updateDimensionValues={updateDimensionValues}
          />
        );
      } else if (elem.tagName === 'image') {
        contents = <ImageOptions elem={elem} updateObjectPanel={updateObjectPanel} />;
      } else {
        contents = <InFillBlock elem={elem} />;
      }
    }
    return (
      <div className="options-panel">
        <div className="title">{'OPTIONS'}</div>
        { contents }
      </div>
    );
  }
}

export default OptionsPanel;
