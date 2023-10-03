import classNames from 'classnames';
import React from 'react';

import ActionPanelIcons from 'app/icons/action-panel/ActionPanelIcons';
import alertCaller from 'app/actions/alert-caller';
import alertConstants from 'app/constants/alert-constants';
import Dialog from 'app/actions/dialog-caller';
import dialog from 'implementations/dialog';
import fileExportHelper from 'helpers/file-export-helper';
import FontFuncs from 'app/actions/beambox/font-funcs';
import i18n from 'helpers/i18n';
import imageEdit from 'helpers/image-edit';
import ObjectPanelController from 'app/views/beambox/Right-Panels/contexts/ObjectPanelController';
import ObjectPanelIcons from 'app/icons/object-panel/ObjectPanelIcons';
import ObjectPanelItem from 'app/views/beambox/Right-Panels/ObjectPanelItem';
import textActions from 'app/svgedit/text/textactions';
import textEdit from 'app/svgedit/text/textedit';
import textPathEdit from 'app/actions/beambox/textPathEdit';
import { checkConnection } from 'helpers/api/discover';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import { isMobile } from 'helpers/system-helper';
import {
  ArrayIcon,
  BevelIcon,
  CropIcon,
  DivideIcon,
  GrayscaleIcon,
  OffsetIcon,
  PenIcon,
  ReplaceIcon,
  SeparateIcon,
  SharpenIcon,
  SimplifyIcon,
  TraceIcon,
} from 'app/icons/icons';

import styles from './ActionsPanel.module.scss';

let svgCanvas;
let svgEditor;
getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
  svgEditor = globalSVG.Editor;
});

const LANG = i18n.lang.beambox.right_panel.object_panel.actions_panel;

interface Props {
  elem: Element;
}

class ActionsPanel extends React.Component<Props> {
  private webNeedConnectionWrapper = (cb: () => void | Promise<void>) => {
    if (window.FLUX.version === 'web' && !checkConnection()) {
      alertCaller.popUp({
        caption: i18n.lang.alert.oops,
        message: i18n.lang.device_selection.no_beambox,
        buttonType: alertConstants.CUSTOM_CANCEL,
        buttonLabels: [i18n.lang.topbar.menu.add_new_machine],
        callbacks: async () => {
          ObjectPanelController.updateActiveKey(null);
          const res = await fileExportHelper.toggleUnsavedChangedDialog();
          if (res) window.location.hash = '#initialize/connect/select-connection-type';
        },
      });
      return;
    }
    cb();
  };

  replaceImage = async (): Promise<void> => {
    setTimeout(() => ObjectPanelController.updateActiveKey(null), 300);
    const { elem } = this.props;
    const option = {
      filters: [
        {
          name: 'Images',
          extensions: [
            'png',
            'jpg',
            'jpeg',
            'jpe',
            'jif',
            'jfif',
            'jfi',
            'bmp',
            'jp2',
            'j2k',
            'jpf',
            'jpx',
            'jpm',
          ],
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
    const bbox = svgCanvas.calculateTransformedBBox(textElem);
    if (textActions.isEditing) {
      textActions.toSelectMode();
    }
    svgCanvas.clearSelection();

    await FontFuncs.convertTextToPath(textElem, bbox);
  };

  weldText = async (): Promise<void> => {
    const { elem } = this.props;
    const isTextPath = elem.getAttribute('data-textpath-g');
    const textElem = isTextPath ? elem.querySelector('text') : elem;
    const bbox = svgCanvas.calculateTransformedBBox(textElem);
    if (textActions.isEditing) {
      textActions.toSelectMode();
    }
    svgCanvas.clearSelection();

    await FontFuncs.convertTextToPath(textElem, bbox, { weldingTexts: true });
  };

  renderButtons = (
    id: string,
    label: string,
    onClick: () => void,
    icon: JSX.Element,
    mobileIcon: JSX.Element,
    opts: {
      isFullLine?: boolean;
      isDisabled?: boolean;
      autoClose?: boolean;
      mobileLabel?: string;
    } = {}
  ): JSX.Element => {
    const { isFullLine, isDisabled, autoClose, mobileLabel } = opts;
    const className = classNames(styles.btn, { [styles.disabled]: isDisabled });
    return isMobile() ? (
      <ObjectPanelItem.Item
        key={mobileLabel || label}
        id={id}
        content={mobileIcon}
        label={mobileLabel || label}
        onClick={onClick}
        disabled={isDisabled}
        autoClose={autoClose}
      />
    ) : (
      <div
        className={classNames(styles['btn-container'], { [styles.half]: !isFullLine })}
        onClick={onClick}
        key={label}
      >
        <button id={id} type="button" className={className}>
          {icon}
          {label}
        </button>
      </div>
    );
  };

  renderImageActions = (): JSX.Element[] => {
    const { elem } = this.props;
    const isShading = elem.getAttribute('data-shading') === 'true';
    const content = {
      replace_with: this.renderButtons(
        'replace_with',
        LANG.replace_with,
        this.replaceImage,
        <ReplaceIcon />,
        <ObjectPanelIcons.Replace />,
        { isFullLine: true, autoClose: false, mobileLabel: LANG.replace_with_short }
      ),
      'bg-removal': this.renderButtons(
        'bg-removal',
        LANG.ai_bg_removal,
        () => imageEdit.removeBackground(elem as SVGImageElement),
        <ActionPanelIcons.ImageMatting className={styles.icon} />,
        <ObjectPanelIcons.RemoveBG />,
        { isFullLine: true, mobileLabel: LANG.ai_bg_removal_short }
      ),
      trace: this.renderButtons(
        'trace',
        LANG.trace,
        () => imageEdit.traceImage(elem as SVGImageElement),
        <ActionPanelIcons.Trace className={styles.icon} />,
        <ObjectPanelIcons.Trace2 />,
        { isDisabled: isShading }
      ),
      grading: this.renderButtons(
        'grading',
        LANG.grading,
        () => Dialog.showPhotoEditPanel('curve'),
        <GrayscaleIcon />,
        <ObjectPanelIcons.Brightness />,
        { autoClose: false, mobileLabel: LANG.brightness }
      ),
      sharpen: this.renderButtons(
        'sharpen',
        LANG.sharpen,
        () => {
          this.webNeedConnectionWrapper(() => Dialog.showPhotoEditPanel('sharpen'));
        },
        <SharpenIcon />,
        <ObjectPanelIcons.Sharpen />,
        { autoClose: false }
      ),
      crop: this.renderButtons(
        'crop',
        LANG.crop,
        () => Dialog.showCropPanel(),
        <CropIcon />,
        <ObjectPanelIcons.Crop />,
        { autoClose: false }
      ),
      bevel: this.renderButtons(
        'bevel',
        LANG.bevel,
        () => imageEdit.generateStampBevel(elem as SVGImageElement),
        <BevelIcon />,
        <ObjectPanelIcons.Bevel />
      ),
      invert: this.renderButtons(
        'invert',
        LANG.invert,
        () => imageEdit.colorInvert(elem as SVGImageElement),
        <ActionPanelIcons.Invert className={styles.icon} />,
        <ObjectPanelIcons.Invert />
      ),
      array: this.renderButtons(
        'array',
        LANG.array,
        () => svgEditor.triggerGridTool(),
        <ArrayIcon />,
        <ObjectPanelIcons.Array />,
        { autoClose: false }
      ),
      potrace: this.renderButtons(
        'potrace',
        LANG.outline,
        () => imageEdit.potrace(elem as SVGImageElement),
        <ActionPanelIcons.Potrace className={styles.icon} />,
        <ObjectPanelIcons.Potrace />
      ),
    };
    const contentOrder = isMobile()
      ? [
          'replace_with',
          'potrace',
          'grading',
          'sharpen',
          'crop',
          'bevel',
          'invert',
          'array',
          'trace',
          'bg-removal',
        ]
      : [
          'replace_with',
          'bg-removal',
          'trace',
          'grading',
          'sharpen',
          'crop',
          'bevel',
          'invert',
          'array',
          'potrace',
        ];
    const contentInOrder = contentOrder.map((key) => content[key]);
    return contentInOrder;
  };

  renderTextActions = (): JSX.Element[] => {
    const content = [
      this.renderButtons(
        'convert_to_path',
        LANG.convert_to_path,
        () => this.webNeedConnectionWrapper(this.convertTextToPath),
        <TraceIcon />,
        <ObjectPanelIcons.Trace />,
        {
          isFullLine: true,
          mobileLabel: LANG.outline,
        }
      ),
      this.renderButtons(
        'weld',
        LANG.weld_text,
        () => this.webNeedConnectionWrapper(this.weldText),
        <ActionPanelIcons.WeldText className={styles.icon} />,
        <ObjectPanelIcons.WeldText />,
        {
          isFullLine: true,
        }
      ),
      this.renderButtons(
        'array',
        LANG.array,
        () => svgEditor.triggerGridTool(),
        <ArrayIcon />,
        <ObjectPanelIcons.Array />,
        { isFullLine: true, autoClose: false }
      ),
    ];
    return content;
  };

  renderTextPathActions = (): JSX.Element[] => {
    const { elem } = this.props;
    const content = [
      this.renderButtons(
        'edit_path',
        LANG.edit_path,
        () => textPathEdit.editPath(elem as SVGGElement),
        undefined,
        <ObjectPanelIcons.Draw />,
        { isFullLine: true }
      ),
      this.renderButtons(
        'detach_path',
        LANG.detach_path,
        () => {
          const { text, path } = textPathEdit.detachText(elem as SVGGElement);
          textEdit.renderText(text);
          svgCanvas.multiSelect([text, path], true);
        },
        undefined,
        <ObjectPanelIcons.DecomposeTextpath />,
        { isFullLine: true, mobileLabel: LANG.detach_path_short }
      ),
      this.renderButtons(
        'convert_to_path',
        LANG.convert_to_path,
        () => this.webNeedConnectionWrapper(this.convertTextToPath),
        undefined,
        <ObjectPanelIcons.Trace />,
        { isFullLine: true, mobileLabel: LANG.outline }
      ),
      this.renderButtons(
        'array',
        LANG.array,
        () => svgEditor.triggerGridTool(),
        undefined,
        <ObjectPanelIcons.Array />,
        { autoClose: false }
      ),
    ];
    return content;
  };

  renderPathActions = (): JSX.Element[] => {
    const { elem } = this.props;
    const content = [
      this.renderButtons(
        'edit_path',
        LANG.edit_path,
        () => svgCanvas.pathActions.toEditMode(elem),
        <PenIcon />,
        <ObjectPanelIcons.Draw />,
        { isFullLine: true }
      ),
      this.renderButtons(
        'decompose_path',
        LANG.decompose_path,
        () => svgCanvas.decomposePath(),
        <DivideIcon />,
        <ObjectPanelIcons.Decompose />,
        { isFullLine: true }
      ),
      this.renderButtons(
        'offset',
        LANG.offset,
        () => svgEditor.triggerOffsetTool(),
        <OffsetIcon />,
        <ObjectPanelIcons.Offset />,
        { autoClose: false }
      ),
      this.renderButtons(
        'array',
        LANG.array,
        () => svgEditor.triggerGridTool(),
        <ArrayIcon />,
        <ObjectPanelIcons.Array />,
        { autoClose: false }
      ),
      this.renderButtons(
        'simplify',
        LANG.simplify,
        () => svgCanvas.simplifyPath(),
        <SimplifyIcon />,
        <ObjectPanelIcons.Simplify />,
        { isFullLine: true }
      ),
    ];
    return content;
  };

  renderRectActions = (): JSX.Element[] => {
    const { elem } = this.props;
    const content = [
      this.renderButtons(
        'convert_to_path',
        LANG.convert_to_path,
        () => svgCanvas.convertToPath(elem),
        <TraceIcon />,
        <ObjectPanelIcons.Trace />,
        { isFullLine: true, mobileLabel: LANG.outline }
      ),
      this.renderButtons(
        'offset',
        LANG.offset,
        () => svgEditor.triggerOffsetTool(),
        <OffsetIcon />,
        <ObjectPanelIcons.Offset />,
        { autoClose: false }
      ),
      this.renderButtons(
        'array',
        LANG.array,
        () => svgEditor.triggerGridTool(),
        <ArrayIcon />,
        <ObjectPanelIcons.Array />,
        { autoClose: false }
      ),
    ];
    return content;
  };

  renderEllipseActions = (): JSX.Element[] => {
    const { elem } = this.props;
    const content = [
      this.renderButtons(
        'convert_to_path',
        LANG.convert_to_path,
        () => svgCanvas.convertToPath(elem),
        <TraceIcon />,
        <ObjectPanelIcons.Trace />,
        { isFullLine: true, mobileLabel: LANG.outline }
      ),
      this.renderButtons(
        'offset',
        LANG.offset,
        () => svgEditor.triggerOffsetTool(),
        <OffsetIcon />,
        <ObjectPanelIcons.Offset />,
        { autoClose: false }
      ),
      this.renderButtons(
        'array',
        LANG.array,
        () => svgEditor.triggerGridTool(),
        <ArrayIcon />,
        <ObjectPanelIcons.Array />,
        { autoClose: false }
      ),
    ];
    return content;
  };

  renderPolygonActions = (): JSX.Element[] => {
    const { elem } = this.props;
    const content = [
      this.renderButtons(
        'convert_to_path',
        LANG.convert_to_path,
        () => svgCanvas.convertToPath(elem),
        <TraceIcon />,
        <ObjectPanelIcons.Trace />,
        { isFullLine: true, mobileLabel: LANG.outline }
      ),
      this.renderButtons(
        'offset',
        LANG.offset,
        () => svgEditor.triggerOffsetTool(),
        <OffsetIcon />,
        <ObjectPanelIcons.Offset />,
        { autoClose: false }
      ),
      this.renderButtons(
        'array',
        LANG.array,
        () => svgEditor.triggerGridTool(),
        <ArrayIcon />,
        <ObjectPanelIcons.Array />,
        { autoClose: false }
      ),
    ];
    return content;
  };

  renderLineActions = (): JSX.Element[] => {
    const { elem } = this.props;
    const content = [
      this.renderButtons(
        'convert_to_path',
        LANG.convert_to_path,
        () => svgCanvas.convertToPath(elem),
        <TraceIcon />,
        <ObjectPanelIcons.Trace />,
        { isFullLine: true, mobileLabel: LANG.outline }
      ),
      this.renderButtons(
        'offset',
        LANG.offset,
        () => svgEditor.triggerOffsetTool(),
        <OffsetIcon />,
        <ObjectPanelIcons.Offset />,
        { autoClose: false }
      ),
      this.renderButtons(
        'array',
        LANG.array,
        () => svgEditor.triggerGridTool(),
        <ArrayIcon />,
        <ObjectPanelIcons.Array />,
        { autoClose: false }
      ),
    ];
    return content;
  };

  renderUseActions = (): JSX.Element[] => {
    const content = [
      this.renderButtons(
        'disassemble_use',
        LANG.disassemble_use,
        () => svgCanvas.disassembleUse2Group(),
        <SeparateIcon />,
        <ObjectPanelIcons.ImageMatting />
      ),
      this.renderButtons(
        'array',
        LANG.array,
        () => svgEditor.triggerGridTool(),
        <ArrayIcon />,
        <ObjectPanelIcons.Array />,
        { autoClose: false }
      ),
    ];
    return content;
  };

  renderGroupActions = (): JSX.Element[] => {
    const content = [
      this.renderButtons(
        'array',
        LANG.array,
        () => svgEditor.triggerGridTool(),
        <ArrayIcon />,
        <ObjectPanelIcons.Array />,
        { autoClose: false }
      ),
    ];
    return content;
  };

  renderMultiSelectActions = (): JSX.Element[] => {
    const { elem } = this.props;
    const children = Array.from(elem.childNodes);
    const supportOffset = children.every(
      (child: ChildNode) => !['g', 'text', 'image', 'use'].includes(child.nodeName)
    );

    const appendOptionalButtons = (buttons: JSX.Element[]) => {
      const text = children.find((child) => child.nodeName === 'text') as Element;
      const pathLike = children.find((child) =>
        ['path', 'ellipse', 'line', 'polygon', 'rect'].includes(child.nodeName)
      ) as Element;
      if (children.length === 2 && text && pathLike) {
        buttons.push(
          this.renderButtons(
            'create_textpath',
            LANG.create_textpath,
            () => {
              svgCanvas.ungroupTempGroup();
              let path = pathLike;
              if (pathLike.nodeName !== 'path') {
                path = svgCanvas.convertToPath(path);
              }
              textPathEdit.attachTextToPath(text, path);
              if (svgCanvas.isUsingLayerColor) {
                svgCanvas.updateElementColor(text);
              }
            },
            undefined,
            <ObjectPanelIcons.CreateTextpath />,
            { isFullLine: true, mobileLabel: LANG.create_textpath_short }
          )
        );
      }
    };
    let content: JSX.Element[] = [];
    appendOptionalButtons(content);
    content = [
      ...content,
      this.renderButtons(
        'offset',
        LANG.offset,
        () => svgEditor.triggerOffsetTool(),
        <OffsetIcon />,
        <ObjectPanelIcons.Offset />,
        { isDisabled: !supportOffset, autoClose: false }
      ),
      this.renderButtons(
        'array',
        LANG.array,
        () => svgEditor.triggerGridTool(),
        <ArrayIcon />,
        <ObjectPanelIcons.Array />,
        { autoClose: false }
      ),
    ];
    return content;
  };

  render(): JSX.Element {
    const { elem } = this.props;
    let content: JSX.Element[] | null = null;
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
    return isMobile() ? (
      <div className={styles.container}>
        <ObjectPanelItem.Divider />
        {content}
      </div>
    ) : (
      <div className="actions-panel">
        <div className="title">ACTIONS</div>
        <div className="btns-container">{content}</div>
      </div>
    );
  }
}

export default ActionsPanel;
