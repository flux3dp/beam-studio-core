import classNames from 'classnames';
import React from 'react';
import { Button, ConfigProvider } from 'antd';

import ActionPanelIcons from 'app/icons/action-panel/ActionPanelIcons';
import Dialog from 'app/actions/dialog-caller';
import dialog from 'implementations/dialog';
import FontFuncs from 'app/actions/beambox/font-funcs';
import i18n from 'helpers/i18n';
import imageEdit from 'helpers/image-edit';
import ObjectPanelController from 'app/views/beambox/Right-Panels/contexts/ObjectPanelController';
import ObjectPanelItem from 'app/views/beambox/Right-Panels/ObjectPanelItem';
import textActions from 'app/svgedit/text/textactions';
import textEdit from 'app/svgedit/text/textedit';
import textPathEdit from 'app/actions/beambox/textPathEdit';
import updateElementColor from 'helpers/color/updateElementColor';
import webNeedConnectionWrapper from 'helpers/web-need-connection-helper';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import { isMobile } from 'helpers/system-helper';
import { textButtonTheme } from 'app/constants/antd-config';

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

interface ButtonOpts {
  isFullLine?: boolean;
  isDisabled?: boolean;
  autoClose?: boolean;
  mobileLabel?: string;
}

class ActionsPanel extends React.Component<Props> {
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
    if (textActions.isEditing) {
      textActions.toSelectMode();
    }
    svgCanvas.clearSelection();
    await FontFuncs.convertTextToPath(textElem);
  };

  weldText = async (): Promise<void> => {
    const { elem } = this.props;
    const isTextPath = elem.getAttribute('data-textpath-g');
    const textElem = isTextPath ? elem.querySelector('text') : elem;
    if (textActions.isEditing) {
      textActions.toSelectMode();
    }
    svgCanvas.clearSelection();
    await FontFuncs.convertTextToPath(textElem, { weldingTexts: true });
  };

  renderButtons = (
    id: string,
    label: string,
    onClick: () => void,
    icon: JSX.Element,
    mobileIcon: JSX.Element,
    opts: ButtonOpts = {}
  ): JSX.Element => {
    const { isFullLine, isDisabled, autoClose, mobileLabel } = opts;
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
        key={label}
      >
        <Button
          className={styles.btn}
          id={id}
          icon={icon}
          onClick={onClick}
          disabled={isDisabled}
          block
        >
          <span className={styles.label}>{label}</span>
        </Button>
      </div>
    );
  };

  renderArrayButton = (opts: ButtonOpts = {}): JSX.Element =>
    this.renderButtons(
      'array',
      LANG.array,
      () => svgEditor.triggerGridTool(),
      <ActionPanelIcons.Array />,
      <ActionPanelIcons.ArrayMobile />,
      { autoClose: false, ...opts }
    );

  renderOffsetButton = (opts: ButtonOpts = {}): JSX.Element =>
    this.renderButtons(
      'offset',
      LANG.offset,
      () => svgEditor.triggerOffsetTool(),
      <ActionPanelIcons.Offset />,
      <ActionPanelIcons.Offset />,
      { autoClose: false, ...opts }
    );

  renderAutoArrangeButton = (opts: ButtonOpts = {}): JSX.Element =>
    this.renderButtons(
      'auto_arrange',
      LANG.auto_arrange,
      () => Dialog.showSvgNestButtons(),
      <ActionPanelIcons.AutoArrange />,
      <ActionPanelIcons.AutoArrange />,
      { isFullLine: true, ...opts }
    );

  renderImageActions = (): JSX.Element[] => {
    const { elem } = this.props;
    const isShading = elem.getAttribute('data-shading') === 'true';
    const content = {
      autoArrange: this.renderAutoArrangeButton(),
      replace_with: this.renderButtons(
        'replace_with',
        LANG.replace_with,
        this.replaceImage,
        <ActionPanelIcons.Replace />,
        <ActionPanelIcons.ReplaceMobile />,
        { isFullLine: true, autoClose: false, mobileLabel: LANG.replace_with_short }
      ),
      'bg-removal': this.renderButtons(
        'bg-removal',
        LANG.ai_bg_removal,
        () => imageEdit.removeBackground(elem as SVGImageElement),
        <ActionPanelIcons.BackgroungRemoval />,
        <ActionPanelIcons.BackgroungRemovalMobile />,
        { isFullLine: true, mobileLabel: LANG.ai_bg_removal_short }
      ),
      trace: this.renderButtons(
        'trace',
        LANG.trace,
        () => imageEdit.traceImage(elem as SVGImageElement),
        <ActionPanelIcons.Trace />,
        <ActionPanelIcons.Trace />,
        { isDisabled: isShading }
      ),
      grading: this.renderButtons(
        'grading',
        LANG.grading,
        () => Dialog.showPhotoEditPanel('curve'),
        <ActionPanelIcons.Grading />,
        <ActionPanelIcons.Brightness />,
        { autoClose: false, mobileLabel: LANG.brightness }
      ),
      sharpen: this.renderButtons(
        'sharpen',
        LANG.sharpen,
        () => {
          webNeedConnectionWrapper(() => Dialog.showPhotoEditPanel('sharpen'));
        },
        <ActionPanelIcons.Sharpen />,
        <ActionPanelIcons.SharpenMobile />,
        { autoClose: false }
      ),
      crop: this.renderButtons(
        'crop',
        LANG.crop,
        () => Dialog.showCropPanel(),
        <ActionPanelIcons.Crop />,
        <ActionPanelIcons.Crop />,
        { autoClose: false }
      ),
      bevel: this.renderButtons(
        'bevel',
        LANG.bevel,
        () => imageEdit.generateStampBevel(elem as SVGImageElement),
        <ActionPanelIcons.Bevel />,
        <ActionPanelIcons.BevelMobile />
      ),
      invert: this.renderButtons(
        'invert',
        LANG.invert,
        () => imageEdit.colorInvert(elem as SVGImageElement),
        <ActionPanelIcons.Invert />,
        <ActionPanelIcons.Invert />
      ),
      array: this.renderArrayButton(),
      potrace: this.renderButtons(
        'potrace',
        LANG.outline,
        () => imageEdit.potrace(elem as SVGImageElement),
        <ActionPanelIcons.Outline />,
        <ActionPanelIcons.Outline />
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
          'autoArrange',
        ]
      : [
          'replace_with',
          'bg-removal',
          'autoArrange',
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
        this.convertTextToPath,
        <ActionPanelIcons.ConvertToPath />,
        <ActionPanelIcons.ConvertToPathMobile />,
        {
          isFullLine: true,
          mobileLabel: LANG.outline,
        }
      ),
      this.renderButtons(
        'weld',
        LANG.weld_text,
        this.weldText,
        <ActionPanelIcons.WeldText />,
        <ActionPanelIcons.WeldText />,
        {
          isFullLine: true,
        }
      ),
      this.renderAutoArrangeButton(),
      this.renderArrayButton({ isFullLine: true }),
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
        <ActionPanelIcons.EditPath />,
        <ActionPanelIcons.EditPathMobile />,
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
        <ActionPanelIcons.DecomposeTextpath />,
        <ActionPanelIcons.DecomposeTextpath />,
        { isFullLine: true, mobileLabel: LANG.detach_path_short }
      ),
      this.renderButtons(
        'convert_to_path',
        LANG.convert_to_path,
        this.convertTextToPath,
        <ActionPanelIcons.ConvertToPath />,
        <ActionPanelIcons.ConvertToPathMobile />,
        { isFullLine: true, mobileLabel: LANG.outline }
      ),
      this.renderAutoArrangeButton(),
      this.renderArrayButton({ isFullLine: true }),
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
        <ActionPanelIcons.EditPath />,
        <ActionPanelIcons.EditPathMobile />,
        { isFullLine: true }
      ),
      this.renderButtons(
        'decompose_path',
        LANG.decompose_path,
        () => svgCanvas.decomposePath(),
        <ActionPanelIcons.Decompose />,
        <ActionPanelIcons.DecomposeMobile />,
        { isFullLine: true }
      ),
      this.renderAutoArrangeButton(),
      this.renderOffsetButton(),
      this.renderArrayButton(),
      this.renderButtons(
        'simplify',
        LANG.simplify,
        () => svgCanvas.simplifyPath(),
        <ActionPanelIcons.Simplify />,
        <ActionPanelIcons.SimplifyMobile />,
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
        <ActionPanelIcons.ConvertToPath />,
        <ActionPanelIcons.ConvertToPathMobile />,
        { isFullLine: true, mobileLabel: LANG.outline }
      ),
      this.renderAutoArrangeButton(),
      this.renderOffsetButton(),
      this.renderArrayButton(),
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
        <ActionPanelIcons.ConvertToPath />,
        <ActionPanelIcons.ConvertToPathMobile />,
        { isFullLine: true, mobileLabel: LANG.outline }
      ),
      this.renderAutoArrangeButton(),
      this.renderOffsetButton(),
      this.renderArrayButton(),
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
        <ActionPanelIcons.ConvertToPath />,
        <ActionPanelIcons.ConvertToPathMobile />,
        { isFullLine: true, mobileLabel: LANG.outline }
      ),
      this.renderAutoArrangeButton(),
      this.renderOffsetButton(),
      this.renderArrayButton(),
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
        <ActionPanelIcons.ConvertToPath />,
        <ActionPanelIcons.ConvertToPathMobile />,
        { isFullLine: true, mobileLabel: LANG.outline }
      ),
      this.renderAutoArrangeButton(),
      this.renderOffsetButton(),
      this.renderArrayButton(),
    ];
    return content;
  };

  renderUseActions = (): JSX.Element[] => {
    const content = [
      this.renderButtons(
        'disassemble_use',
        LANG.disassemble_use,
        () => svgCanvas.disassembleUse2Group(),
        <ActionPanelIcons.Disassemble />,
        <ActionPanelIcons.DisassembleMobile />,
        { isFullLine: true }
      ),
      this.renderAutoArrangeButton(),
      this.renderArrayButton({ isFullLine: true }),
    ];
    return content;
  };

  renderGroupActions = (): JSX.Element[] => {
    const content = [
      this.renderAutoArrangeButton(),
      this.renderArrayButton({ isFullLine: true }),
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
              updateElementColor(text);
            },
            <ActionPanelIcons.CreateTextpath />,
            <ActionPanelIcons.CreateTextpath />,
            { isFullLine: true, mobileLabel: LANG.create_textpath_short }
          )
        );
      }
    };
    let content: JSX.Element[] = [];
    appendOptionalButtons(content);
    content = [
      ...content,
      this.renderAutoArrangeButton(),
      this.renderOffsetButton({ isDisabled: !supportOffset }),
      this.renderArrayButton(),
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
      <div className={styles.panel}>
        <div className={styles.title}>ACTIONS</div>
        <div className={styles['btns-container']}>
          <ConfigProvider theme={textButtonTheme}>{content}</ConfigProvider>
        </div>
      </div>
    );
  }
}

export default ActionsPanel;
