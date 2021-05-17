import * as React from 'react';
import $ from 'jquery';
import classNames from 'classnames';

// import BeamboxActions from 'app/actions/beambox';
// import FnWrapper from 'app/actions/beambox/svgeditor-function-wrapper';
import i18n from 'helpers/i18n';
// import ImageTracePanelController from 'app/actions/beambox/Image-Trace-Panel-Controller';
// import PreviewModeBackgroundDrawer from 'app/actions/beambox/preview-mode-background-drawer';
// import PreviewModeController from 'app/actions/beambox/preview-mode-controller';
// import shortcuts from 'helpers/shortcuts';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import { IUser } from 'interfaces/IUser';

let svgCanvas;
let svgEditor;
getSVGAsync((globalSVG) => { svgCanvas = globalSVG.Canvas; svgEditor = globalSVG.Editor; });

const LANG = i18n.lang.beambox.left_panel;
const isWin = window.os === 'Windows';

interface Props {
  isPreviewing: boolean;
  endPreviewMode: () => void;
  user: IUser;
  setShouldStartPreviewController: (shouldStartPreviewController: boolean) => void;
}

class LeftPanel extends React.Component<Props> {
    private leftPanelClass: string;

    constructor(props: Props) {
        super(props);
        this.leftPanelClass = classNames('left-toolbar', { win: isWin });
    }

    componentDidMount() {
        // Selection Management
        // $('#layerpanel').mouseup(() => {
        //     FnWrapper.clearSelection();
        // });

        // $('#layer-laser-panel-placeholder').mouseup(() => {
        //     FnWrapper.clearSelection();
        // });

        // // Add class color to #svg_editor
        // $('#svg_editor').addClass('color');

        // shortcuts.on(['v'], () => {
        //     if (!this.props.isPreviewing) {
        //         FnWrapper.useSelectTool();
        //     }
        // });

        // shortcuts.on(['i'], () => {
        //     if (!this.props.isPreviewing) {
        //         FnWrapper.importImage();
        //     }
        // });

        // shortcuts.on(['t'], () => {
        //     if (!this.props.isPreviewing) {
        //         FnWrapper.insertText();
        //     }
        // });

        // shortcuts.on(['m'], () => {
        //     if (!this.props.isPreviewing) {
        //         FnWrapper.insertRectangle();
        //     }
        // });

        // shortcuts.on(['l'], () => {
        //     if (!this.props.isPreviewing) {
        //         FnWrapper.insertEllipse();
        //     }
        // });

        // shortcuts.on(['\\'], () => {
        //     if (!this.props.isPreviewing) {
        //         FnWrapper.insertLine();
        //     }
        // });

        // shortcuts.on(['p'], () => {
        //     if (!this.props.isPreviewing) {
        //         FnWrapper.insertPath();
        //     }
        // });
    }

    componentWillUnmount() {
        $('#svg_editor').removeClass('color');
    }

    // clearPreview = () => {
    //     if (!PreviewModeBackgroundDrawer.isClean()) {
    //         PreviewModeBackgroundDrawer.resetCoordinates();
    //         PreviewModeBackgroundDrawer.clear();
    //     }
    //     $('#left-Shoot').addClass('active');
    // }

    // startImageTrace = () => {
    //     if (!document.getElementById('image-trace-panel-outer')) {
    //         ImageTracePanelController.render();
    //     }
    //     this.props.endPreviewMode();
    //     svgCanvas.clearSelection();
    //     BeamboxActions.showCropper();
    //     $('#left-Cursor').addClass('active');
    // }

    renderToolButton(iconName: string, id?: string, label?: string, onClick?: () => void, className?: string, disabled?: boolean) {
        const cx = classNames('tool-btn', className, {disabled});
        const { isPreviewing } = this.props;
        const setActiveAndOnClick = () => {
            if (disabled) {
                return;
            }
            if (!isPreviewing) {
                $('.tool-btn').removeClass('active');
                $(`#left-${id}`).addClass('active');
            }
            onClick?.();
        }
        return (
            <div id={`left-${id}`} className={cx} title={label} onClick={setActiveAndOnClick}>
                <img src={`img/left-bar/icon-${iconName}.svg`} draggable="false"/>
            </div>
        );
    }

    render() {
        const { isPreviewing } = this.props;
        if (!isPreviewing) {
            return (
                <div className={this.leftPanelClass}>
                    {this.renderToolButton('cursor', 'Cursor', LANG.label.cursor + ' (V)', () => { console.log('cursor'); } /*FnWrapper.useSelectTool*/, 'active')}
                    {this.renderToolButton('photo', 'Photo', LANG.label.photo + ' (I)', () => { console.log('photo'); } /*FnWrapper.importImage*/)}
                    {this.renderToolButton('text', 'Text', LANG.label.text + ' (T)', () => { console.log('text'); } /*FnWrapper.insertText*/)}
                    {this.renderToolButton('rect', 'Rectangle', LANG.label.rect + ' (M)', () => { console.log('rect'); } /*FnWrapper.insertRectangle*/)}
                    {this.renderToolButton('oval', 'Ellipse', LANG.label.oval + ' (L)', () => { console.log('oval'); } /*FnWrapper.insertEllipse*/)}
                    {this.renderToolButton('polygon', 'Polygon', LANG.label.polygon, () => { console.log('polygon'); } /*FnWrapper.insertPolygon*/)}
                    {this.renderToolButton('line', 'Line', LANG.label.line + ' (\\)', () => { console.log('line'); } /*FnWrapper.insertLine*/)}
                    {this.renderToolButton('draw', 'Pen', LANG.label.pen + ' (P)', () => { console.log('draw'); } /*FnWrapper.insertPath*/)}
                </div>
            );
        } else {
            // const isDrawing = PreviewModeController.isDrawing;
            // const isDrawn = !PreviewModeBackgroundDrawer.isClean();
            // return (
            //     <div className={this.leftPanelClass}>
            //         {this.renderToolButton('back', 'Exit-Preview', LANG.label.end_preview, this.props.endPreviewMode)}
            //         {this.renderToolButton('shoot', 'Shoot', LANG.label.preview, () => {
            //             if (!PreviewModeController.isPreviewMode()) {
            //                 this.props.setShouldStartPreviewController(true)
            //             }
            //         }, 'active')}
            //         {this.renderToolButton('trace', 'Trace', LANG.label.trace, this.startImageTrace, '', isDrawing || !isDrawn)}
            //         {this.renderToolButton('trash', 'Trash', LANG.label.clear_preview, this.clearPreview, '', isDrawing || !isDrawn)}
            //     </div>
            // );
        }
    }
}

export default LeftPanel;
