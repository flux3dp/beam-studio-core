import * as React from 'react';
import * as ReactDOM from 'react-dom';
import ImageTracePanel from 'app/views/beambox/Image-Trace-Panel';

class ImageTracePanelController {
    reactRoot: string;
    constructor() {
        this.reactRoot = '';
    }
    init(reactRoot) {
        this.reactRoot = reactRoot;
    }

    render() {
        ReactDOM.render(
            <ImageTracePanel />
            ,document.getElementById(this.reactRoot)
        );
    }
}

const instance = new ImageTracePanelController();

export default instance;
