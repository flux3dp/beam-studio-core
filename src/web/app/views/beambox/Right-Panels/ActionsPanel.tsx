import classNames from 'classnames';
import React from 'react';

import Dialog from 'app/actions/dialog-caller';
import dialog from 'implementations/dialog';
import FontFuncs from 'app/actions/beambox/font-funcs';
import i18n from 'helpers/i18n';
import imageEdit from 'helpers/image-edit';
import Progress from 'app/actions/progress-caller';
import textActions from 'app/svgedit/textactions';
import textEdit from 'app/svgedit/textedit';
import textPathEdit from 'app/actions/beambox/textPathEdit';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import { string } from 'prop-types';

let svgCanvas;
let svgEditor;
getSVGAsync((globalSVG) => { svgCanvas = globalSVG.Canvas; svgEditor = globalSVG.Editor; });

const LANG = i18n.lang.beambox.right_panel.object_panel.actions_panel;

interface Props {
  id?:string,
  elem: Element,
}

class ActionsPanel extends React.Component<Props> {
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
    const fileBlob = await dialog.getFileFromDialog(option);
    if (fileBlob) {
      svgEditor.replaceBitmap(fileBlob, elem);
    }
  };

  convertTextToPath = async (): Promise<void> => {
    const { elem } = this.props;
    const isTextPath = elem.getAttribute('data-textpath-g');
    const textElem = isTextPath ? elem.querySelector('text') : elem;
    Progress.openNonstopProgress({ id: 'convert-font', message: LANG.wait_for_parsing_font });
    const bbox = svgCanvas.calculateTransformedBBox(textElem);
    if (textActions.isEditing) {
      textActions.toSelectMode();
    }
    svgCanvas.clearSelection();

    await FontFuncs.convertTextToPathFluxsvg(textElem, bbox);
    Progress.popById('convert-font');
  };

  renderButtons = (
    label: string, onClick: () => void, isFullLine?: boolean, id?:string, isDisabled?: boolean,
  ): JSX.Element => {
    const className = classNames('btn', 'btn-default', { disabled: isDisabled });
    return (
      <div className={classNames('btn-container', { full: isFullLine, half: !isFullLine })} onClick={() => onClick()} key={label}>
        <button id={id} type="button" className={className}>{label}</button>
      </div>
    );
  };

  renderImageActions = (): JSX.Element[] => {
    const { elem } = this.props;
    const isShading = elem.getAttribute('data-shading') === 'true';
    const content = [
      this.renderButtons(LANG.replace_with, () => this.replaceImage(), true, "replace_with"),
      this.renderButtons(LANG.trace, () => svgCanvas.imageToSVG(), false, "trace", isShading),
      this.renderButtons(LANG.grading, () => Dialog.showPhotoEditPanel('curve'), false, "grading"),
      this.renderButtons(LANG.sharpen, () => Dialog.showPhotoEditPanel('sharpen'), false, "sharpen"),
      this.renderButtons(LANG.crop, () => Dialog.showPhotoEditPanel('crop'), false, "crop"),
      this.renderButtons(LANG.bevel, () => imageEdit.generateStampBevel(elem), false, "bevel"),
      this.renderButtons(LANG.invert, () => imageEdit.colorInvert(elem), false, "invert"),
      this.renderButtons(LANG.array, () => svgEditor.triggerGridTool(), false, "array"),
    ];
    return content;
  };

  renderTextActions = (): JSX.Element[] => {
    const content = [
      this.renderButtons(LANG.convert_to_path, this.convertTextToPath, true, "convert_to_path"),
      this.renderButtons(LANG.array, () => svgEditor.triggerGridTool(), false, "array"),
    ];
    return content;
  };

  renderTextPathActions = (): JSX.Element[] => {
    const { elem } = this.props;
    const content = [
      this.renderButtons(LANG.edit_path, () => textPathEdit.editPath(elem as SVGGElement), true),
      this.renderButtons(LANG.detach_path, () => {
        const { text, path } = textPathEdit.detachText(elem as SVGGElement);
        textEdit.renderText(text);
        svgCanvas.multiSelect([text, path], true);
      }, true),
      this.renderButtons(LANG.convert_to_path, this.convertTextToPath, true),
      this.renderButtons(LANG.array, () => svgEditor.triggerGridTool(), false),
    ];
    return content;
  };

  renderPathActions = (): JSX.Element[] => {
    const { elem } = this.props;
    const content = [
      this.renderButtons(LANG.edit_path, () => svgCanvas.pathActions.toEditMode(elem), true, "edit_path"),
      this.renderButtons(LANG.decompose_path, () => svgCanvas.decomposePath(), true, "decompose_path"),
      this.renderButtons(LANG.offset, () => svgEditor.triggerOffsetTool(), false, "offset"),
      this.renderButtons(LANG.array, () => svgEditor.triggerGridTool(), false, "array"),
    ];
    return content;
  };

  renderRectActions = (): JSX.Element[] => {
    const { elem } = this.props;
    const content = [
      this.renderButtons(LANG.convert_to_path, () => svgCanvas.convertToPath(elem), true, "convert_to_path"),
      this.renderButtons(LANG.offset, () => svgEditor.triggerOffsetTool(), false, "offset"),
      this.renderButtons(LANG.array, () => svgEditor.triggerGridTool(), false, "array"),
    ];
    return content;
  };

  renderEllipseActions = (): JSX.Element[] => {
    const { elem } = this.props;
    const content = [
      this.renderButtons(LANG.convert_to_path, () => svgCanvas.convertToPath(elem), true, "convert_to_path"),
      this.renderButtons(LANG.offset, () => svgEditor.triggerOffsetTool(), false, "offset"),
      this.renderButtons(LANG.array, () => svgEditor.triggerGridTool(), false, "array"),
    ];
    return content;
  };

  renderPolygonActions = (): JSX.Element[] => {
    const { elem } = this.props;
    const content = [
      this.renderButtons(LANG.convert_to_path, () => svgCanvas.convertToPath(elem), true, "convert_to_path"),
      this.renderButtons(LANG.offset, () => svgEditor.triggerOffsetTool(), false, "offset"),
      this.renderButtons(LANG.array, () => svgEditor.triggerGridTool(), false, "array"),
    ];
    return content;
  };

  renderLineActions = (): JSX.Element[] => {
    const { elem } = this.props;
    const content = [
      this.renderButtons(LANG.convert_to_path, () => svgCanvas.convertToPath(elem), true, "convert_to_path"),
      this.renderButtons(LANG.offset, () => svgEditor.triggerOffsetTool(), false, "offset"),
      this.renderButtons(LANG.array, () => svgEditor.triggerGridTool(), false, "array"),
    ];
    return content;
  };

  renderUseActions = (): JSX.Element[] => {
    const content = [
      this.renderButtons(LANG.disassemble_use, () => svgCanvas.disassembleUse2Group(), false, "disassemble_use"),
      this.renderButtons(LANG.array, () => svgEditor.triggerGridTool(), false, "array"),
    ];
    return content;
  };

  renderGroupActions = (): JSX.Element[] => {
    const content = [
      this.renderButtons(LANG.array, () => svgEditor.triggerGridTool(), false, "array"),
    ];
    return content;
  };

  renderMultiSelectActions = (): JSX.Element[] => {
    const { elem } = this.props;
    const children = Array.from(elem.childNodes);
    const supportOffset = children.every((child: ChildNode) => !['g', 'text', 'image', 'use'].includes(child.nodeName));

    const appendOptionalButtons = (buttons: JSX.Element[]) => {
      const text = children.find((child) => child.nodeName === 'text') as Element;
      const pathLike = children.find((child) => ['path', 'ellipse', 'line', 'polygon', 'rect'].includes(child.nodeName)) as Element;
      if (children.length === 2 && text && pathLike) {
        buttons.push(this.renderButtons(LANG.create_textpath, () => {
          svgCanvas.ungroupTempGroup();
          let path = pathLike;
          if (pathLike.nodeName !== 'path') {
            path = svgCanvas.convertToPath(path);
          }
          textPathEdit.attachTextToPath(text, path);
          if (svgCanvas.isUsingLayerColor) {
            svgCanvas.updateElementColor(text);
          }
        }, true));
      }
    };
    let content = [];
    appendOptionalButtons(content);
    content = [
      ...content,
      this.renderButtons(LANG.offset, () => svgEditor.triggerOffsetTool(), false, "offset", !supportOffset),
      this.renderButtons(LANG.array, () => svgEditor.triggerGridTool(), false, "array"),
    ];
    return content;
  };

  render(): JSX.Element {
    const { elem } = this.props;
    let content = null;
    if (elem) {
      const tagName = elem.tagName.toLowerCase();
      if (tagName === 'image' || tagName === 'img') {
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
        if (elem.getAttribute('data-tempgroup') === 'true') {
          content = this.renderMultiSelectActions();
        } else if (elem.getAttribute('data-textpath-g')) {
          content = this.renderTextPathActions();
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
