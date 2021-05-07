import * as React from 'react';
import ImageOptions from 'app/views/beambox/Right-Panels/Options-Blocks/Image-Options';
import InFillBlock from 'app/views/beambox/Right-Panels/Options-Blocks/Infill-Block';
import RectOptions from 'app/views/beambox/Right-Panels/Options-Blocks/Rect-Options';
import TextOptions from 'app/views/beambox/Right-Panels/Options-Blocks/Text-Options';

interface Props {
  elem: Element;
  updateObjectPanel: () => void;
}
class OptionsPanel extends React.Component<Props> {
    render() {
        const { elem, updateObjectPanel } = this.props;
        let contents = [];
        if (elem) {
            if (elem.tagName === 'rect') {
                contents = <RectOptions {...this.props} />
            } else if (elem.tagName === 'text') {
                contents = <TextOptions {...this.props}/>;
            } else if (elem.tagName === 'image') {
                contents = <ImageOptions elem={elem} updateObjectPanel={updateObjectPanel}/>;
            } else {
                contents = <InFillBlock elem={elem}/>;
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
