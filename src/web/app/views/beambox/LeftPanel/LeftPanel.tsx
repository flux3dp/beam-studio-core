import * as React from 'react';
import $ from 'jquery';
import classNames from 'classnames';

import DrawingToolButtonGroup from 'app/views/beambox/LeftPanel/DrawingToolButtonGroup';
import FnWrapper from 'app/actions/beambox/svgeditor-function-wrapper';
import PreviewToolButtonGroup from 'app/views/beambox/LeftPanel/PreviewToolButtonGroup';
import shortcuts from 'helpers/shortcuts';

interface Props {
  isPreviewing: boolean;
  endPreviewMode: () => void;
  setShouldStartPreviewController: (shouldStartPreviewController: boolean) => void;
}

class LeftPanel extends React.Component<Props> {
  private leftPanelClass: string;

  constructor(props) {
    super(props);
    this.leftPanelClass = classNames('left-toolbar', { win: window.os === 'Windows' });
  }

  componentDidMount() {
    // Selection Management
    $('#layerpanel').mouseup(() => {
      FnWrapper.clearSelection();
    });

    $('#layer-laser-panel-placeholder').mouseup(() => {
      FnWrapper.clearSelection();
    });

    // Add class color to #svg_editor
    $('#svg_editor').addClass('color');

    shortcuts.on(['v'], () => {
      if (!this.props.isPreviewing) {
        FnWrapper.useSelectTool();
      }
    });

    shortcuts.on(['i'], () => {
      if (!this.props.isPreviewing) {
        FnWrapper.importImage();
      }
    });

    shortcuts.on(['t'], () => {
      if (!this.props.isPreviewing) {
        FnWrapper.insertText();
      }
    });

    shortcuts.on(['m'], () => {
      if (!this.props.isPreviewing) {
        FnWrapper.insertRectangle();
      }
    });

    shortcuts.on(['l'], () => {
      if (!this.props.isPreviewing) {
        FnWrapper.insertEllipse();
      }
    });

    shortcuts.on(['\\'], () => {
      if (!this.props.isPreviewing) {
        FnWrapper.insertLine();
      }
    });

    shortcuts.on(['p'], () => {
      if (!this.props.isPreviewing) {
        FnWrapper.insertPath();
      }
    });
  }

  componentWillUnmount() {
    $('#svg_editor').removeClass('color');
  }

  render() {
    const { isPreviewing, endPreviewMode, setShouldStartPreviewController } = this.props;
    if (!isPreviewing) {
      return (
        <DrawingToolButtonGroup
          className={this.leftPanelClass}
        />
      );
    }
    return (
      <PreviewToolButtonGroup
        className={this.leftPanelClass}
        endPreviewMode={endPreviewMode}
        setShouldStartPreviewController={setShouldStartPreviewController}
      />
    );
  }
}

export default LeftPanel;
