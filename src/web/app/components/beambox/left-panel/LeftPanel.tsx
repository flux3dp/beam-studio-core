import * as React from 'react';
import classNames from 'classnames';

import * as TutorialController from 'app/views/tutorials/tutorialController';
import DrawingToolButtonGroup from 'app/components/beambox/left-panel/DrawingToolButtonGroup';
import FnWrapper from 'app/actions/beambox/svgeditor-function-wrapper';
import i18n from 'helpers/i18n';
import PreviewModeController from 'app/actions/beambox/preview-mode-controller';
import PreviewToolButtonGroup from 'app/components/beambox/left-panel/PreviewToolButtonGroup';
import shortcuts from 'helpers/shortcuts';
import TutorialConstants from 'app/constants/tutorial-constants';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import { TopBarLeftPanelContext } from 'app/contexts/TopBarLeftPanelContext';

let svgEditor;
getSVGAsync((globalSVG) => {
  svgEditor = globalSVG.Editor;
});

const LANG = i18n.lang.beambox.left_panel;

interface Props {
  isPathPreviewing: boolean;
  togglePathPreview: () => void;
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
      const { isPreviewing } = this.context;
      if (!isPreviewing) {
        FnWrapper.useSelectTool();
      }
    });

    shortcuts.on(['i'], () => {
      const { isPreviewing } = this.context;
      if (!isPreviewing) {
        FnWrapper.importImage();
      }
    });

    shortcuts.on(['t'], () => {
      const { isPreviewing } = this.context;
      if (!isPreviewing) {
        FnWrapper.insertText();
      }
    });

    shortcuts.on(['m'], () => {
      const { isPreviewing } = this.context;
      if (!isPreviewing) {
        FnWrapper.insertRectangle();
      }
    });

    shortcuts.on(['l'], () => {
      const { isPreviewing } = this.context;
      if (!isPreviewing) {
        FnWrapper.insertEllipse();
      }
    });

    shortcuts.on(['\\'], () => {
      const { isPreviewing } = this.context;
      if (!isPreviewing) {
        FnWrapper.insertLine();
      }
    });

    shortcuts.on(['p'], () => {
      const { isPreviewing } = this.context;
      if (!isPreviewing) {
        FnWrapper.insertPath();
      }
    });
  }

  componentWillUnmount(): void {
    $('#svg_editor').removeClass('color');
  }

  endPreviewMode = (): void => {
    const { setTopBarPreviewMode, setIsPreviewing } = this.context;
    try {
      if (PreviewModeController.isPreviewMode()) {
        PreviewModeController.end();
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
    } finally {
      if (TutorialController.getNextStepRequirement() === TutorialConstants.TO_EDIT_MODE) {
        TutorialController.handleNextStep();
      }
      // eslint-disable-next-line react-hooks/rules-of-hooks
      FnWrapper.useSelectTool();
      $('#workarea').off('contextmenu');
      svgEditor.setWorkAreaContextMenu();
      setTopBarPreviewMode(false);
      setIsPreviewing(false);
    }
  };

  render(): JSX.Element {
    const { isPathPreviewing, togglePathPreview } = this.props;
    const { isPreviewing, setShouldStartPreviewController } = this.context;

    if (!isPreviewing && !isPathPreviewing) {
      return (<DrawingToolButtonGroup className={this.leftPanelClass} />);
    }
    if (isPathPreviewing) {
      // TODO: Add PathPreviewButtonGroup
      return (
        <div className={this.leftPanelClass}>
          <div id="Exit-Preview" className="tool-btn" title={LANG.label.end_preview} onClick={togglePathPreview}>
            <img src="img/left-bar/icon-back.svg" draggable="false" />
          </div>
        </div>
      );
    }
    return (
      <PreviewToolButtonGroup
        className={this.leftPanelClass}
        endPreviewMode={this.endPreviewMode}
        setShouldStartPreviewController={setShouldStartPreviewController}
      />
    );
  }
}

LeftPanel.contextType = TopBarLeftPanelContext;

export default LeftPanel;
