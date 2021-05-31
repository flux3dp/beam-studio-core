import classNames from 'classnames';
import React from 'react';

import Dialog from 'app/actions/dialog-caller';
import dialog from 'implementations/dialog';
import FontFuncs from 'app/actions/beambox/font-funcs';
import i18n from 'helpers/i18n';
import imageEdit from 'helpers/image-edit';
import Progress from 'app/actions/progress-caller';
import { getSVGAsync } from 'helpers/svg-editor-helper';

let svgCanvas;
let svgEditor;
getSVGAsync((globalSVG) => { svgCanvas = globalSVG.Canvas; svgEditor = globalSVG.Editor; });

const LANG = i18n.lang.beambox.right_panel.object_panel.actions_panel;

interface Props {
  elem: Element,
  dimensionValues: { [key: string]: string },
  updateDimensionValues: (values: { [key: string]: string }) => void,
}

class ActionsPanel extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
    this.state = {
    };
  }

  replaceImage = async (): Promise<void> => {
    const { elem } = this.props;
    const option = {
      filters: [
        {
          name: 'Images',
          extensions: ['png', 'jpg', 'jpeg', 'jpe', 'jif', 'jfif', 'jfi', 'bmp', 'jp2', 'j2k', 'jpf', 'jpx', 'jpm'],
        },
      ],
    };
    const { canceled, filePaths } = await dialog.showOpenDialog(option);
    if (!canceled && filePaths && filePaths.length > 0) {
      const filePath = filePaths[0];
      const resp = await fetch(filePath);
      const respBlob = await resp.blob();
      svgEditor.replaceBitmap(respBlob, elem);
    }
  };

  convertToPath = async (): Promise<void> => {
    const { elem } = this.props;
    Progress.openNonstopProgress({ id: 'convert-font', message: LANG.wait_for_parsing_font });
    const bbox = svgCanvas.calculateTransformedBBox(elem);
    if (svgCanvas.textActions.isEditing) {
      svgCanvas.textActions.toSelectMode();
    }
    svgCanvas.clearSelection();

    await FontFuncs.convertTextToPathFluxsvg(elem, bbox);
    Progress.popById('convert-font');
  };

  renderButtons = (
    label: string, onClick: () => void, isFullLine?: boolean, isDisabled?: boolean,
  ): JSX.Element => {
    const className = classNames('btn', 'btn-default', { disabled: isDisabled });
    return (
      <div className={classNames('btn-container', { full: isFullLine, half: !isFullLine })} onClick={() => onClick()} key={label}>
        <button type="button" className={className}>{label}</button>
      </div>
    );
  };

  renderImageActions = (): JSX.Element[] => {
    const { elem } = this.props;
    const isShading = elem.getAttribute('data-shading') === 'true';
    const content = [
      this.renderButtons(LANG.replace_with, () => this.replaceImage(), true),
      this.renderButtons(LANG.trace, () => svgCanvas.imageToSVG(), false, isShading),
      this.renderButtons(LANG.grading, () => Dialog.showPhotoEditPanel('curve'), false),
      this.renderButtons(LANG.sharpen, () => Dialog.showPhotoEditPanel('sharpen'), false),
      this.renderButtons(LANG.crop, () => Dialog.showPhotoEditPanel('crop'), false),
      this.renderButtons(LANG.bevel, () => imageEdit.generateStampBevel(elem), false),
      this.renderButtons(LANG.invert, () => imageEdit.colorInvert(elem), false),
      this.renderButtons(LANG.array, () => svgEditor.triggerGridTool(), false),
    ];
    return content;
  };

  renderTextActions = (): JSX.Element[] => {
    const content = [
      this.renderButtons(LANG.convert_to_path, this.convertToPath, true),
      this.renderButtons(LANG.array, () => svgEditor.triggerGridTool(), false),
    ];
    return content;
  };

  renderPathActions = (): JSX.Element[] => {
    const content = [
      this.renderButtons(LANG.decompose_path, () => svgCanvas.decomposePath(), true),
      this.renderButtons(LANG.offset, () => svgEditor.triggerOffsetTool(), false),
      this.renderButtons(LANG.array, () => svgEditor.triggerGridTool(), false),
    ];
    return content;
  };

  renderRectActions = (): JSX.Element[] => {
    const content = [
      this.renderButtons(LANG.offset, () => svgEditor.triggerOffsetTool(), false),
      this.renderButtons(LANG.array, () => svgEditor.triggerGridTool(), false),
    ];
    return content;
  };

  renderEllipseActions = (): JSX.Element[] => {
    const content = [
      this.renderButtons(LANG.offset, () => svgEditor.triggerOffsetTool(), false),
      this.renderButtons(LANG.array, () => svgEditor.triggerGridTool(), false),
    ];
    return content;
  };

  renderPolygonActions = (): JSX.Element[] => {
    const content = [
      this.renderButtons(LANG.offset, () => svgEditor.triggerOffsetTool(), false),
      this.renderButtons(LANG.array, () => svgEditor.triggerGridTool(), false),
    ];
    return content;
  };

  renderLineActions = (): JSX.Element[] => {
    const content = [
      this.renderButtons(LANG.offset, () => svgEditor.triggerOffsetTool(), false),
      this.renderButtons(LANG.array, () => svgEditor.triggerGridTool(), false),
    ];
    return content;
  };

  renderUseActions = (): JSX.Element[] => {
    const content = [
      this.renderButtons(LANG.disassemble_use, () => svgCanvas.disassembleUse2Group(), false),
      this.renderButtons(LANG.array, () => svgEditor.triggerGridTool(), false),
    ];
    return content;
  };

  renderGroupActions = (): JSX.Element[] => {
    const content = [
      this.renderButtons(LANG.array, () => svgEditor.triggerGridTool(), false),
    ];
    return content;
  };

  renderMultiSelectActions = (): JSX.Element[] => {
    const { elem } = this.props;
    const childs = Array.from(elem.childNodes);
    const supportOffset = childs.every((child: ChildNode) => !['g', 'text', 'image', 'use'].includes(child.nodeName));
    const content = [
      this.renderButtons(LANG.offset, () => svgEditor.triggerOffsetTool(), false, !supportOffset),
      this.renderButtons(LANG.array, () => svgEditor.triggerGridTool(), false),
    ];
    return content;
  };

  render(): JSX.Element {
    const { elem } = this.props;
    const isMultiSelect = elem && elem.tagName === 'g' && elem.getAttribute('data-tempgroup') === 'true';
    let content = null;
    if (elem) {
      const { tagName } = elem;
      if (tagName === 'image') {
        content = this.renderImageActions();
      } else if (tagName === 'text') {
        content = this.renderTextActions();
      } else if (tagName === 'path') {
        content = this.renderPathActions();
      } else if (tagName === 'rect') {
        content = this.renderRectActions();
      } else if (tagName === 'ellipse') {
        content = this.renderEllipseActions();
      } else if (tagName === 'polygon') {
        content = this.renderPolygonActions();
      } else if (tagName === 'line') {
        content = this.renderLineActions();
      } else if (tagName === 'use') {
        content = this.renderUseActions();
      } else if (tagName === 'g') {
        if (isMultiSelect) {
          content = this.renderMultiSelectActions();
        } else {
          content = this.renderGroupActions();
        }
      }
    }
    return (
      <div className="actions-panel">
        <div className="title">ACTIONS</div>
        <div className="btns-container">
          {content}
        </div>
      </div>
    );
  }
}

export default ActionsPanel;
