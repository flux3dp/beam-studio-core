import classNames from 'classnames';
import Icon from '@ant-design/icons';
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
getSVGAsync((globalSVG) => { svgCanvas = globalSVG.Canvas; svgEditor = globalSVG.Editor; });

const LANG = i18n.lang.beambox.right_panel.object_panel.actions_panel;

interface Props {
  elem: Element,
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
    const bbox = svgCanvas.calculateTransformedBBox(textElem);
    if (textActions.isEditing) {
      textActions.toSelectMode();
    }
    svgCanvas.clearSelection();

    await FontFuncs.convertTextToPath(textElem, bbox);
  };

  renderButtons = (
    label: string,
    onClick: () => void,
    isFullLine?: boolean,
    id?: string,
    isDisabled?: boolean,
    icon?: JSX.Element,
    mobileIcon?: JSX.Element,
    mobileLabel?: string
  ): JSX.Element => {
    const className = classNames(styles.btn, { [styles.disabled]: isDisabled });
    return isMobile() ? (
      <ObjectPanelItem.Item
        key={mobileLabel || label}
        id={id}
        content={mobileIcon}
        label={mobileLabel || label}
        onClick={onClick}
        disabled={isDisabled}
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
        LANG.replace_with,
        this.replaceImage,
        true,
        'replace_with',
        false,
        <ReplaceIcon />,
        <ObjectPanelIcons.Replace />,
        LANG.replace_with_short,
      ),
      'bg-removal': this.renderButtons(
        LANG.ai_bg_removal,
        () => imageEdit.removeBackground(elem as SVGImageElement),
        true,
        'bg-removal',
        false,
        <ActionPanelIcons.ImageMatting className={styles.icon} />,
        <ObjectPanelIcons.RemoveBG />,
        LANG.ai_bg_removal_short,
      ),
      trace: this.renderButtons(
        LANG.trace,
        () => imageEdit.traceImage(elem as SVGImageElement),
        false,
        'trace',
        isShading,
        <Icon className={styles.icon} component={ObjectPanelIcons.Trace2} viewBox="6 6 20 20" />,
        <ObjectPanelIcons.Trace2 />
      ),
      grading: this.renderButtons(
        isMobile() ? 'Brightness' : LANG.grading,
        () => Dialog.showPhotoEditPanel('curve'),
        false,
        'grading',
        false,
        <GrayscaleIcon />,
        <ObjectPanelIcons.Brightness />
      ),
      sharpen: this.renderButtons(
        LANG.sharpen,
        () => {
          this.webNeedConnectionWrapper(() => Dialog.showPhotoEditPanel('sharpen'));
        },
        false,
        'sharpen',
        false,
        <SharpenIcon />,
        <ObjectPanelIcons.Sharpen />
      ),
      crop: this.renderButtons(
        LANG.crop,
        () => Dialog.showCropPanel(),
        false,
        'crop',
        false,
        <CropIcon />,
        <ObjectPanelIcons.Crop />
      ),
      bevel: this.renderButtons(
        LANG.bevel,
        () => imageEdit.generateStampBevel(elem as SVGImageElement),
        false,
        'bevel',
        false,
        <BevelIcon />,
        <ObjectPanelIcons.Bevel />
      ),
      invert: this.renderButtons(
        LANG.invert,
        () => imageEdit.colorInvert(elem as SVGImageElement),
        false,
        'invert',
        false,
        <ActionPanelIcons.Invert className={styles.icon} />,
        <ObjectPanelIcons.Invert />
      ),
      array: this.renderButtons(
        LANG.array,
        () => svgEditor.triggerGridTool(),
        false,
        'array',
        false,
        <ArrayIcon />,
        <ObjectPanelIcons.Array />
      ),
      remove: this.renderButtons(
        'Potrace',
        () => imageEdit.potrace(elem as SVGImageElement),
        false,
        'remove',
        false,
        <TraceIcon />,
        <ObjectPanelIcons.Trace />
      ),
    };
    const contentOrder = isMobile()
      ? [
          'replace_with',
          'remove',
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
          'remove',
        ];
    const contentInOrder = contentOrder.map((key) => content[key]);
    return contentInOrder;
  };

  renderTextActions = (): JSX.Element[] => {
    const content = [
      this.renderButtons(
        LANG.convert_to_path,
        () => this.webNeedConnectionWrapper(this.convertTextToPath),
        true,
        'convert_to_path',
        false,
        <TraceIcon />,
        <ObjectPanelIcons.Trace />
      ),
      this.renderButtons(
        LANG.array,
        () => svgEditor.triggerGridTool(),
        true,
        'array',
        false,
        <ArrayIcon />,
        <ObjectPanelIcons.Array />
      ),
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
      this.renderButtons(
        LANG.convert_to_path,
        () => this.webNeedConnectionWrapper(this.convertTextToPath),
        true,
      ),
      this.renderButtons(LANG.array, () => svgEditor.triggerGridTool(), false),
    ];
    return content;
  };

  renderPathActions = (): JSX.Element[] => {
    const { elem } = this.props;
    const content = [
      this.renderButtons(
        LANG.edit_path,
        () => svgCanvas.pathActions.toEditMode(elem),
        true,
        'edit_path',
        false,
        <PenIcon />,
        <ObjectPanelIcons.Draw />
      ),
      this.renderButtons(
        LANG.decompose_path,
        () => svgCanvas.decomposePath(),
        true,
        'decompose_path',
        false,
        <DivideIcon />,
        <ObjectPanelIcons.Decomposee />
      ),
      this.renderButtons(
        LANG.offset,
        () => svgEditor.triggerOffsetTool(),
        false,
        'offset',
        false,
        <OffsetIcon />,
        <ObjectPanelIcons.Offset />
      ),
      this.renderButtons(
        LANG.array,
        () => svgEditor.triggerGridTool(),
        false,
        'array',
        false,
        <ArrayIcon />,
        <ObjectPanelIcons.Array />
      ),
      this.renderButtons(
        LANG.simplify,
        () => svgCanvas.simplifyPath(),
        true,
        'simplify',
        false,
        <SimplifyIcon />,
        <ObjectPanelIcons.Simplify />
      ),
    ];
    return content;
  };

  renderRectActions = (): JSX.Element[] => {
    const { elem } = this.props;
    const content = [
      this.renderButtons(
        LANG.convert_to_path,
        () => svgCanvas.convertToPath(elem),
        true,
        'convert_to_path',
        false,
        <TraceIcon />,
        <ObjectPanelIcons.Trace />
      ),
      this.renderButtons(
        LANG.offset,
        () => svgEditor.triggerOffsetTool(),
        false,
        'offset',
        false,
        <OffsetIcon />,
        <ObjectPanelIcons.Offset />
      ),
      this.renderButtons(
        LANG.array,
        () => svgEditor.triggerGridTool(),
        false,
        'array',
        false,
        <ArrayIcon />,
        <ObjectPanelIcons.Array />
      ),
    ];
    return content;
  };

  renderEllipseActions = (): JSX.Element[] => {
    const { elem } = this.props;
    const content = [
      this.renderButtons(
        LANG.convert_to_path,
        () => svgCanvas.convertToPath(elem),
        true,
        'convert_to_path',
        false,
        <TraceIcon />,
        <ObjectPanelIcons.Trace />
      ),
      this.renderButtons(
        LANG.offset,
        () => svgEditor.triggerOffsetTool(),
        false,
        'offset',
        false,
        <OffsetIcon />,
        <ObjectPanelIcons.Offset />
      ),
      this.renderButtons(
        LANG.array,
        () => svgEditor.triggerGridTool(),
        false,
        'array',
        false,
        <ArrayIcon />,
        <ObjectPanelIcons.Array />
      ),
    ];
    return content;
  };

  renderPolygonActions = (): JSX.Element[] => {
    const { elem } = this.props;
    const content = [
      this.renderButtons(
        LANG.convert_to_path,
        () => svgCanvas.convertToPath(elem),
        true,
        'convert_to_path',
        false,
        <TraceIcon />,
        <ObjectPanelIcons.Trace />
      ),
      this.renderButtons(
        LANG.offset,
        () => svgEditor.triggerOffsetTool(),
        false,
        'offset',
        false,
        <OffsetIcon />,
        <ObjectPanelIcons.Offset />
      ),
      this.renderButtons(
        LANG.array,
        () => svgEditor.triggerGridTool(),
        false,
        'array',
        false,
        <ArrayIcon />,
        <ObjectPanelIcons.Array />
      ),
    ];
    return content;
  };

  renderLineActions = (): JSX.Element[] => {
    const { elem } = this.props;
    const content = [
      this.renderButtons(
        LANG.convert_to_path,
        () => svgCanvas.convertToPath(elem),
        true,
        'convert_to_path',
        false,
        <TraceIcon />,
        <ObjectPanelIcons.Trace />
      ),
      this.renderButtons(
        LANG.offset,
        () => svgEditor.triggerOffsetTool(),
        false,
        'offset',
        false,
        <OffsetIcon />,
        <ObjectPanelIcons.Offset />
      ),
      this.renderButtons(
        LANG.array,
        () => svgEditor.triggerGridTool(),
        false,
        'array',
        false,
        <ArrayIcon />,
        <ObjectPanelIcons.Array />
      ),
    ];
    return content;
  };

  renderUseActions = (): JSX.Element[] => {
    const content = [
      this.renderButtons(
        LANG.disassemble_use,
        () => svgCanvas.disassembleUse2Group(),
        false,
        'disassemble_use',
        false,
        <SeparateIcon />,
        <ObjectPanelIcons.ImageMatting />
      ),
      this.renderButtons(
        LANG.array,
        () => svgEditor.triggerGridTool(),
        false,
        'array',
        false,
        <ArrayIcon />,
        <ObjectPanelIcons.Array />
      ),
    ];
    return content;
  };

  renderGroupActions = (): JSX.Element[] => {
    const content = [
      this.renderButtons(
        LANG.array,
        () => svgEditor.triggerGridTool(),
        false,
        'array',
        false,
        <ArrayIcon />,
        <ObjectPanelIcons.Array />
      ),
    ];
    return content;
  };

  renderMultiSelectActions = (): JSX.Element[] => {
    const { elem } = this.props;
    const children = Array.from(elem.childNodes);
    const supportOffset = children.every((child: ChildNode) => !['g', 'text', 'image', 'use'].includes(child.nodeName));

    const appendOptionalButtons = (buttons: JSX.Element[]) => {
      const text = children.find((child) => child.nodeName === 'text') as Element;
      const pathLike = children.find(
        (child) => ['path', 'ellipse', 'line', 'polygon', 'rect'].includes(child.nodeName)
      ) as Element;
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
    let content: JSX.Element[] = [];
    appendOptionalButtons(content);
    content = [
      ...content,
      this.renderButtons(
        LANG.offset,
        () => svgEditor.triggerOffsetTool(),
        false,
        'offset',
        !supportOffset,
        <OffsetIcon />,
        <ObjectPanelIcons.Offset />
      ),
      this.renderButtons(
        LANG.array,
        () => svgEditor.triggerGridTool(),
        false,
        'array',
        false,
        <ArrayIcon />,
        <ObjectPanelIcons.Array />
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
