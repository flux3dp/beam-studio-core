import React from 'react';

import CurveEngravingTool from 'app/components/beambox/left-panel/CurveEngravingTool';
import DrawingToolButtonGroup from 'app/components/beambox/left-panel/DrawingToolButtonGroup';
import FnWrapper from 'app/actions/beambox/svgeditor-function-wrapper';
import i18n from 'helpers/i18n';
import LeftPanelButton from 'app/components/beambox/left-panel/LeftPanelButton';
import LeftPanelIcons from 'app/icons/left-panel/LeftPanelIcons';
import PreviewToolButtonGroup from 'app/components/beambox/left-panel/PreviewToolButtonGroup';
import shortcuts from 'helpers/shortcuts';
import { CanvasContext, CanvasMode } from 'app/contexts/CanvasContext';

import styles from './LeftPanel.module.scss';

const LANG = i18n.lang.beambox.left_panel;

class LeftPanel extends React.PureComponent {
  componentDidMount(): void {
    // Selection Management
    // TODO: move to layer panel
    $('#layerpanel').mouseup(() => {
      FnWrapper.clearSelection();
    });

    // Add class color to #svg_editor
    $('#svg_editor').addClass('color');
    const isFocusingOnInputs = () => {
      if (!document.activeElement) return false;
      return document.activeElement.tagName.toLowerCase() === 'input';
    };

    shortcuts.on(['v'], () => {
      const { mode } = this.context;
      if (mode === CanvasMode.Draw && !isFocusingOnInputs()) {
        FnWrapper.useSelectTool();
      }
    });

    shortcuts.on(['i'], () => {
      const { mode } = this.context;
      if (mode === CanvasMode.Draw && !isFocusingOnInputs()) {
        FnWrapper.importImage();
      }
    });

    shortcuts.on(['t'], () => {
      const { mode } = this.context;
      if (mode === CanvasMode.Draw && !isFocusingOnInputs()) {
        FnWrapper.insertText();
      }
    });

    shortcuts.on(['m'], () => {
      const { mode } = this.context;
      if (mode === CanvasMode.Draw && !isFocusingOnInputs()) {
        FnWrapper.insertRectangle();
      }
    });

    shortcuts.on(['c'], () => {
      const { mode } = this.context;
      if (mode === CanvasMode.Draw && !isFocusingOnInputs()) {
        FnWrapper.insertEllipse();
      }
    });

    shortcuts.on(['\\'], () => {
      const { mode } = this.context;
      if (mode === CanvasMode.Draw && !isFocusingOnInputs()) {
        FnWrapper.insertLine();
      }
    });

    shortcuts.on(['p'], () => {
      const { mode } = this.context;
      if (mode === CanvasMode.Draw && !isFocusingOnInputs()) {
        FnWrapper.insertPath();
      }
    });

    shortcuts.on(['e'], () => {
      const { mode } = this.context;
      if (mode === CanvasMode.Draw && !isFocusingOnInputs()) {
        $('#left-Element').trigger('click');
      }
    });
  }

  componentWillUnmount(): void {
    $('#svg_editor').removeClass('color');
  }

  render(): JSX.Element {
    const { mode, togglePathPreview } = this.context;
    if (mode === CanvasMode.Draw) {
      return <DrawingToolButtonGroup className={styles.container} />;
    }
    if (mode === CanvasMode.PathPreview) {
      return (
        <div className={styles.container}>
          <LeftPanelButton
            id="Exit-Preview"
            title={LANG.label.end_preview}
            icon={<LeftPanelIcons.Back />}
            onClick={togglePathPreview}
          />
        </div>
      );
    }
    if (mode === CanvasMode.CurveEngraving) {
      return <CurveEngravingTool className={styles.container} />;
    }
    return <PreviewToolButtonGroup className={styles.container} />;
  }
}

LeftPanel.contextType = CanvasContext;

export default LeftPanel;
