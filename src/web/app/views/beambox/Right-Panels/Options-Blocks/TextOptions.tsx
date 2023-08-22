/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import * as React from 'react';
import classNames from 'classnames';
import { Select, Switch } from 'antd';

import fontHelper from 'implementations/fontHelper';
import FontFuncs from 'app/actions/beambox/font-funcs';
import history from 'app/svgedit/history';
import ObjectPanelItem from 'app/views/beambox/Right-Panels/ObjectPanelItem';
import progressCaller from 'app/actions/progress-caller';
import selector from 'app/svgedit/selector';
import textEdit from 'app/svgedit/text/textedit';
import textPathEdit, { VerticalAlign } from 'app/actions/beambox/textPathEdit';
import i18n from 'helpers/i18n';
import InFillBlock from 'app/views/beambox/Right-Panels/Options-Blocks/InFillBlock';
import StartOffsetBlock from 'app/views/beambox/Right-Panels/Options-Blocks/TextOptions/StartOffsetBlock';
import VerticalAlignBlock from 'app/views/beambox/Right-Panels/Options-Blocks/TextOptions/VerticalAlignBlock';
import UnitInput from 'app/widgets/Unit-Input-v2';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import { isMobile } from 'helpers/system-helper';

const { Option } = Select;

let svgCanvas;
getSVGAsync((globalSVG) => { svgCanvas = globalSVG.Canvas; });

const LANG = i18n.lang.beambox.right_panel.object_panel.option_panel;
const usePostscriptAsFamily = window.os === 'MacOS' && window.FLUX.version !== 'web';

interface Props {
  elem: Element;
  textElement: SVGTextElement;
  isTextPath?: boolean;
  updateObjectPanel: () => void;
  updateDimensionValues?: (data: { fontStyle: string }) => void;
}

interface State {
  fontFamily: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fontStyle: any;
  fontSize: number;
  letterSpacing: number;
  lineSpacing: number;
  startOffset?: number;
  verticalAlign?: VerticalAlign;
  isVerti: boolean;
}

class TextOptions extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const { textElement } = props;
    this.state = this.getStateFromElem(textElement);
  }

  componentDidUpdate(prevProps: Props): void {
    const lastElem = prevProps.textElement;
    const lastId = lastElem.getAttribute('id');
    const { textElement } = this.props;
    if (textElement.getAttribute('id') !== lastId) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState(this.getStateFromElem(textElement));
    }
  }

  getStateFromElem = (elem: SVGTextElement) => {
    const { updateDimensionValues } = this.props;
    const postscriptName = textEdit.getFontPostscriptName(elem);
    let font;
    if (postscriptName) {
      font = FontFuncs.getFontOfPostscriptName(postscriptName);
      if (!elem.getAttribute('font-style')) {
        elem.setAttribute('font-style', font.italic ? 'italic' : 'normal');
      }
      if (!elem.getAttribute('font-weight')) {
        elem.setAttribute('font-weight', font.weight ? font.weight : 'normal');
      }
    } else {
      const family = usePostscriptAsFamily
        ? textEdit.getFontFamilyData(elem)
        : textEdit.getFontFamily(elem);
      const weight = textEdit.getFontWeight(elem);
      const italic = textEdit.getItalic(elem);
      font = FontFuncs.requestFontByFamilyAndStyle({ family, weight, italic });
    }
    // eslint-disable-next-line no-console
    console.log(font);
    const sanitizedDefaultFontFamily = (() => {
      // use these font if postscriptName cannot find in user PC
      const fontFamilyFallback = [
        'PingFang TC',
        'Arial',
        'Times New Roman',
        'Ubuntu',
        FontFuncs.availableFontFamilies[0],
      ];
      const sanitizedFontFamily = [font.family, ...fontFamilyFallback].find(
        (f) => FontFuncs.availableFontFamilies.includes(f),
      );
      return sanitizedFontFamily;
    })();

    if (sanitizedDefaultFontFamily !== font.family) {
      // eslint-disable-next-line no-console
      console.log(`unsupported font ${font.family}, fallback to ${sanitizedDefaultFontFamily}`);
      textEdit.setFontFamily(sanitizedDefaultFontFamily, true);
      const newFont = FontFuncs.requestFontsOfTheFontFamily(sanitizedDefaultFontFamily)[0];
      textEdit.setFontPostscriptName(newFont.postscriptName, true);
    }
    updateDimensionValues({ fontStyle: font.style });

    let startOffset: number;
    let verticalAlign: VerticalAlign;
    if (elem.getAttribute('data-textpath')) {
      const textPath = elem.querySelector('textPath');
      if (textPath) {
        // Use parseInt parse X% to number X
        startOffset = parseInt(textPath.getAttribute('startOffset'), 10);
        const alignmentBaseline = textPath.getAttribute('alignment-baseline');
        if (alignmentBaseline === 'middle') verticalAlign = VerticalAlign.MIDDLE;
        else if (alignmentBaseline === 'top') verticalAlign = VerticalAlign.TOP;
        else verticalAlign = VerticalAlign.BOTTOM;
      }
    }

    return {
      fontFamily: sanitizedDefaultFontFamily,
      fontStyle: font.style,
      fontSize: Number(elem.getAttribute('font-size')),
      letterSpacing: textEdit.getLetterSpacing(elem),
      lineSpacing: parseFloat(elem.getAttribute('data-line-spacing') || '1'),
      isVerti: elem.getAttribute('data-verti') === 'true',
      startOffset,
      verticalAlign,
    };
  };

  waitForWebFont = async () => {
    const { elem } = this.props;
    await progressCaller.openNonstopProgress({ id: 'load-font', caption: 't讀取字體中' });
    await document.fonts.ready;
    selector.getSelectorManager().resizeSelectors([elem]);
    progressCaller.popById('load-font');
  };

  handleFontFamilyChange = async (newFamily) => {
    let family = newFamily;
    if (typeof newFamily === 'object') {
      family = newFamily.value;
    }
    const { updateDimensionValues, updateObjectPanel, textElement } = this.props;
    const newFont = FontFuncs.requestFontsOfTheFontFamily(family)[0];
    const batchCmd = new history.BatchCommand('Change Font family');
    let cmd = textEdit.setFontPostscriptName(newFont.postscriptName, true, [textElement]);
    batchCmd.addSubCommand(cmd);
    cmd = textEdit.setItalic(newFont.italic, true, textElement);
    batchCmd.addSubCommand(cmd);
    cmd = textEdit.setFontWeight(newFont.weight, true, textElement);
    batchCmd.addSubCommand(cmd);
    if (usePostscriptAsFamily) {
      cmd = textEdit.setFontFamily(newFont.postscriptName, true, [textElement]);
      batchCmd.addSubCommand(cmd);
      cmd = textEdit.setFontFamilyData(family, true, [textElement]);
      batchCmd.addSubCommand(cmd);
    } else {
      cmd = textEdit.setFontFamily(family, true, [textElement]);
      batchCmd.addSubCommand(cmd);
    }
    svgCanvas.undoMgr.addCommandToHistory(batchCmd);

    if (window.FLUX.version === 'web') {
      await this.waitForWebFont();
    }

    const newStyle = newFont.style;
    updateDimensionValues({ fontStyle: newStyle });
    this.setState({
      fontFamily: family,
      fontStyle: newStyle,
    });
    updateObjectPanel();
  };

  renderFontFamilyBlock = (): JSX.Element => {
    const { fontFamily } = this.state;
    if (window.os === 'MacOS' || window.FLUX.version === 'web') {
      const renderOption = (option) => {
        if (window.FLUX.version === 'web') {
          const src = fontHelper.getWebFontPreviewUrl(option.value);
          if (src) return <img src={src} alt={option.label} draggable="false" />;
        }
        return <div style={{ fontFamily: `'${option.value}'`, maxHeight: 32 }}>{option.label}</div>;
      };
      if (isMobile()) {
        const options = FontFuncs.availableFontFamilies.map((option) => {
          const fontName = FontFuncs.fontNameMap.get(option);
          const label = renderOption({
            value: option,
            label: typeof fontName === 'string' ? fontName : option,
          });
          return { value: option, label };
        });
        return (
          <ObjectPanelItem.Select
            id="font_family"
            selected={{ value: fontFamily, label: fontFamily }}
            options={options}
            onChange={this.handleFontFamilyChange}
            label={LANG.font_family}
          />
        );
      }
      const options = FontFuncs.availableFontFamilies.map((option) => {
        const label = FontFuncs.fontNameMap.get(option);
        return { value: option, label };
      });
      const isOnlyOneOption = options.length === 1;
      return (
        <div className="option-block">
          <div className="label">{LANG.font_family}</div>
          <div className="select-container">
            <Select
              defaultValue={{ value: fontFamily }}
              onChange={(value) => this.handleFontFamilyChange(value)}
              onKeyDown={(e) => {
                e.stopPropagation();
              }}
              disabled={isOnlyOneOption}
            >
              { options.map((option) => (
                <Option value={option.value} label={option.label}>
                  {renderOption(option)}
                </Option>
              )) }
            </Select>
          </div>
        </div>
      );
    }
    if (isMobile()) {
      const options = FontFuncs.availableFontFamilies.map((option) => {
        const fontName = FontFuncs.fontNameMap.get(option);
        const label = (
          <span style={{ fontFamily: option }}>
            {typeof fontName === 'string' ? fontName : option}
          </span>
        );
        return { value: option, label };
      });
      return (
        <ObjectPanelItem.Select
          id="font_family"
          selected={{ value: fontFamily, label: fontFamily }}
          options={options}
          onChange={this.handleFontFamilyChange}
          label={LANG.font_family}
        />
      );
    }
    const options = FontFuncs.availableFontFamilies.map((option: string) => {
      const fontName = FontFuncs.fontNameMap.get(option);
      const label = typeof fontName === 'string' ? fontName : option;
      return (
        <option value={option} key={option} style={{ fontFamily: option }}>
          {label}
        </option>
      );
    });
    const isOnlyOneOption = options.length === 1;
    return (
      <div className="option-block">
        <div className="label">{LANG.font_family}</div>
        <div className="select-container">
          <select
            value={fontFamily}
            onChange={(e) => this.handleFontFamilyChange(e.target.value)}
            className={classNames({ 'no-triangle': isOnlyOneOption })}
            disabled={isOnlyOneOption}
          >
            {options}
          </select>
        </div>
      </div>
    );
  };

  private handleFontStyleChange = async (val: string) => {
    const { updateDimensionValues, updateObjectPanel, textElement } = this.props;
    const { fontFamily } = this.state;
    const font = FontFuncs.requestFontByFamilyAndStyle({
      family: fontFamily,
      style: val,
    });
    const batchCmd = new history.BatchCommand('Change Font Style');
    let cmd = textEdit.setFontPostscriptName(font.postscriptName, true, [textElement]);
    batchCmd.addSubCommand(cmd);
    if (usePostscriptAsFamily) {
      cmd = textEdit.setFontFamily(font.postscriptName, true, [textElement]);
      batchCmd.addSubCommand(cmd);
    }
    cmd = textEdit.setItalic(font.italic, true, textElement);
    batchCmd.addSubCommand(cmd);
    cmd = textEdit.setFontWeight(font.weight, true, textElement);
    batchCmd.addSubCommand(cmd);
    svgCanvas.undoMgr.addCommandToHistory(batchCmd);

    if (window.FLUX.version === 'web') {
      await this.waitForWebFont();
    }

    updateDimensionValues({ fontStyle: val });
    this.setState({
      fontStyle: val,
    });
    updateObjectPanel();
  };

  renderFontStyleBlock = (): JSX.Element => {
    const { fontFamily, fontStyle } = this.state;
    const fontStyles = FontFuncs.requestFontsOfTheFontFamily(fontFamily).map((f) => f.style);
    if (isMobile()) {
      const options = fontStyles.map((option: string) => ({ value: option, label: option }));
      return (
        <ObjectPanelItem.Select
          id="font_style"
          selected={{ value: fontStyle, label: fontStyle }}
          options={options}
          onChange={this.handleFontStyleChange}
          label={LANG.font_style}
        />
      );
    }
    const options = fontStyles.map((option) => (
      <option key={option} value={option}>{option}</option>
    ));
    const isOnlyOneOption = options.length === 1;
    return (
      <div className="option-block">
        <div className="label">{LANG.font_style}</div>
        <div className="select-container">
          <select
            value={fontStyle}
            onChange={(e) => this.handleFontStyleChange(e.target.value)}
            className={classNames({ 'no-triangle': isOnlyOneOption })}
            disabled={isOnlyOneOption}
          >
            {options}
          </select>
        </div>
      </div>
    );
  };

  handleFontSizeChange = (val: number): void => {
    const { textElement } = this.props;
    textEdit.setFontSize(val, [textElement]);
    this.setState({
      fontSize: val,
    });
  };

  renderFontSizeBlock = (): JSX.Element => {
    const { fontSize } = this.state;
    return isMobile() ? (
      <ObjectPanelItem.Number
        id="font_size"
        label={LANG.font_size}
        value={fontSize}
        updateValue={this.handleFontSizeChange}
        unit="px"
        decimal={0}
      />
    ) : (
      <div className="option-block">
        <div className="label">{LANG.font_size}</div>
        <UnitInput
          id="font_size"
          min={1}
          unit="px"
          decimal={0}
          className={{ 'option-input': true }}
          defaultValue={fontSize}
          getValue={(val) => this.handleFontSizeChange(val)}
        />
      </div>
    );
  };

  handleLetterSpacingChange = (val: number): void => {
    const { textElement } = this.props;
    textEdit.setLetterSpacing(val, textElement);
    this.setState({
      letterSpacing: val,
    });
  };

  renderLetterSpacingBlock = (): JSX.Element => {
    const { letterSpacing } = this.state;
    return isMobile() ? (
      <ObjectPanelItem.Number
        id="letter_spacing"
        label={LANG.letter_spacing}
        value={letterSpacing}
        updateValue={this.handleLetterSpacingChange}
        unit="em"
      />
    ) : (
      <div className="option-block">
        <div className="label">{LANG.letter_spacing}</div>
        <UnitInput
          id="letter_spacing"
          unit="em"
          step={0.05}
          className={{ 'option-input': true }}
          defaultValue={letterSpacing}
          getValue={(val) => this.handleLetterSpacingChange(val)}
        />
      </div>
    );
  };

  handleLineSpacingChange = (val: number): void => {
    textEdit.setLineSpacing(val);
    this.setState({
      lineSpacing: val,
    });
  };

  renderLineSpacingBlock = (): JSX.Element => {
    const { lineSpacing } = this.state;
    return isMobile() ? (
      <ObjectPanelItem.Number
        id="line_spacing"
        label={LANG.line_spacing}
        value={lineSpacing}
        updateValue={this.handleLineSpacingChange}
        unit=""
        decimal={1}
      />
    ) : (
      <div className="option-block">
        <div className="label">{LANG.line_spacing}</div>
        <UnitInput
          id="line_spacing"
          unit=""
          min={0.8}
          step={0.1}
          decimal={1}
          className={{ 'option-input': true }}
          defaultValue={lineSpacing}
          getValue={(val) => this.handleLineSpacingChange(val)}
        />
      </div>
    );
  };

  handleVerticalTextClick = (): void => {
    const { isVerti } = this.state;
    textEdit.setIsVertical(!isVerti);
    this.setState({ isVerti: !isVerti });
  };

  renderVerticalTextSwitch = (): JSX.Element => {
    const { isVerti } = this.state;
    return isMobile() ? (
      <ObjectPanelItem.Item
        id="vertical-text"
        content={<Switch checked={isVerti} />}
        label="Vertical"
        onClick={this.handleVerticalTextClick}
      />
    ) : (
      <div className={classNames('option-block')}>
        <Switch defaultChecked={isVerti} onChange={this.handleVerticalTextClick} />
      </div>
    );
  };

  handleStartOffsetChange = (val: number): void => {
    const { textElement } = this.props;
    textPathEdit.setStartOffset(val, textElement);
    this.setState({
      startOffset: val,
    });
  };

  handleVerticalAlignChange = (val: VerticalAlign): void => {
    const { textElement } = this.props;
    textPathEdit.setVerticalAlign(textElement, val);
    this.setState({
      verticalAlign: val,
    });
  };

  renderMultiLineTextOptions(): JSX.Element {
    const { elem } = this.props;
    return (
      <>
        {this.renderLineSpacingBlock()}
        {this.renderVerticalTextSwitch()}
        <InFillBlock elem={elem} />
      </>
    );
  }

  renderTextPathOptions(): JSX.Element {
    const { elem, textElement } = this.props;
    const path = elem.querySelector('path');
    const { startOffset, verticalAlign } = this.state;
    return (
      <>
        <StartOffsetBlock
          value={startOffset}
          onValueChange={this.handleStartOffsetChange}
        />
        <VerticalAlignBlock
          value={verticalAlign}
          onValueChange={this.handleVerticalAlignChange}
        />
        <InFillBlock elem={textElement} label={LANG.text_infill} />
        <InFillBlock elem={path} label={LANG.path_infill} id="path_infill" />
      </>
    );
  }

  render(): JSX.Element {
    const { isTextPath } = this.props;
    return isMobile() ? (
      <>
        {this.renderFontFamilyBlock()}
        {this.renderFontStyleBlock()}
        {this.renderFontSizeBlock()}
        {this.renderLetterSpacingBlock()}
        {isTextPath ? this.renderTextPathOptions() : this.renderMultiLineTextOptions()}
      </>
    ) : (
      <div className="text-options">
        {this.renderFontFamilyBlock()}
        {this.renderFontStyleBlock()}
        {this.renderFontSizeBlock()}
        {this.renderLetterSpacingBlock()}
        {isTextPath ? this.renderTextPathOptions() : this.renderMultiLineTextOptions()}
      </div>
    );
  }
}

export default TextOptions;
