import * as React from 'react';
import classNames from 'classnames';

import DrawingToolButtonGroup from 'app/views/beambox/LeftPanel/DrawingToolButtonGroup';
import FnWrapper from 'app/actions/beambox/svgeditor-function-wrapper';
import i18n from 'helpers/i18n';
import PreviewToolButtonGroup from 'app/views/beambox/LeftPanel/PreviewToolButtonGroup';
import shortcuts from 'helpers/shortcuts';

const LANG = i18n.lang.beambox.left_panel;

interface Props {
  isPathPreviewing: boolean;
  isPreviewing: boolean;
  endPathPreviewMode: () => void;
  endPreviewMode: () => void;
  setShouldStartPreviewController: (shouldStartPreviewController: boolean) => void;
}

class LeftPanel extends React.Component<Props> {
  private leftPanelClass: string;

  constructor(props: Props) {
    super(props);
    this.leftPanelClass = classNames('left-toolbar', { win: window.os === 'Windows' });
  }

  componentDidMount(): void {
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
      const { isPreviewing } = this.props;
      if (!isPreviewing) {
        FnWrapper.useSelectTool();
      }
    });

    shortcuts.on(['i'], () => {
      const { isPreviewing } = this.props;
      if (!isPreviewing) {
        FnWrapper.importImage();
      }
    });

    shortcuts.on(['t'], () => {
      const { isPreviewing } = this.props;
      if (!isPreviewing) {
        FnWrapper.insertText();
      }
    });

    shortcuts.on(['m'], () => {
      const { isPreviewing } = this.props;
      if (!isPreviewing) {
        FnWrapper.insertRectangle();
      }
    });

    shortcuts.on(['l'], () => {
      const { isPreviewing } = this.props;
      if (!isPreviewing) {
        FnWrapper.insertEllipse();
      }
    });

    shortcuts.on(['\\'], () => {
      const { isPreviewing } = this.props;
      if (!isPreviewing) {
        FnWrapper.insertLine();
      }
    });

    shortcuts.on(['p'], () => {
      const { isPreviewing } = this.props;
      if (!isPreviewing) {
        FnWrapper.insertPath();
      }
    });
  }

  componentWillUnmount(): void {
    $('#svg_editor').removeClass('color');
  }

  render(): JSX.Element {
    const {
      isPreviewing,
      isPathPreviewing,
      endPreviewMode,
      setShouldStartPreviewController,
      endPathPreviewMode,
    } = this.props;
    if (!isPreviewing && !isPathPreviewing) {
      return (
        <DrawingToolButtonGroup
          className={this.leftPanelClass}
        />
      );
    }
    if (isPathPreviewing) {
      // TODO: Add PathPreviewButtonGroup
      return (
        <div className={this.leftPanelClass}>
          <div id="Exit-Preview" className="tool-btn" title={LANG.label.end_preview} onClick={endPathPreviewMode}>
            <img src="img/left-bar/icon-back.svg" draggable="false" />
          </div>
        </div>
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
