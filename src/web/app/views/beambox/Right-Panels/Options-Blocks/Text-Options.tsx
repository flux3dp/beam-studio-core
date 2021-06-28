/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import * as React from 'react';
import classNames from 'classnames';
import Select from 'react-select';

import FontFuncs from 'app/actions/beambox/font-funcs';
import history from 'app/svgedit/history';
import textEdit from 'app/svgedit/textedit';
import i18n from 'helpers/i18n';
import InFillBlock from 'app/views/beambox/Right-Panels/Options-Blocks/Infill-Block';
import UnitInput from 'app/widgets/Unit-Input-v2';
import { getSVGAsync } from 'helpers/svg-editor-helper';

let svgCanvas;
getSVGAsync((globalSVG) => { svgCanvas = globalSVG.Canvas; });

const LANG = i18n.lang.beambox.right_panel.object_panel.option_panel;
const isMac = window.os === 'MacOS';

interface Props {
  elem: Element;
  updateObjectPanel: () => void;
  updateDimensionValues?: ({
    fontStyle: any,
  }) => void;
}

interface State {
  fontFamily: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fontStyle: any;
  fontSize: number;
  letterSpacing: number;
  lineSpacing: number;
  isVerti: boolean;
}

class TextOptions extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const { elem } = props;
    this.state = this.getStateFromElem(elem as SVGTextElement);
  }

  componentDidUpdate(prevProps: Props): void {
    const lastElem = prevProps.elem;
    const lastId = lastElem.getAttribute('id');
    const { elem } = this.props;
    if (elem.getAttribute('id') !== lastId) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState(this.getStateFromElem(elem as SVGTextElement));
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
      const family = isMac ? textEdit.getFontFamilyData(elem) : textEdit.getFontFamily(elem);
      const weight = textEdit.getFontWeight(elem);
      const italic = textEdit.getItalic(elem);
      font = FontFuncs.requestFontByFamilyAndStyle({ family, weight, italic });
    }
    // eslint-disable-next-line no-console
    console.log(font);
    const sanitizedDefaultFontFamily = (() => {
      // use these font if postscriptName cannot find in user PC
      const fontFamilyFallback = ['PingFang TC', 'Arial', 'Times New Roman', 'Ubuntu', FontFuncs.availableFontFamilies[0]];
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
    return {
      fontFamily: sanitizedDefaultFontFamily,
      fontStyle: font.style,
      fontSize: Number(elem.getAttribute('font-size')),
      letterSpacing: textEdit.getLetterSpacing(elem),
      lineSpacing: parseFloat(elem.getAttribute('data-line-spacing') || '1'),
      isVerti: elem.getAttribute('data-verti') === 'true',
    };
  };

  handleFontFamilyChange = (newFamily) => {
    let family = newFamily;
    if (typeof newFamily === 'object') {
      family = newFamily.value;
    }
    const { updateDimensionValues, updateObjectPanel } = this.props;
    const newFont = FontFuncs.requestFontsOfTheFontFamily(family)[0];
    const batchCmd = new history.BatchCommand('Change Font family');
    let cmd = textEdit.setFontPostscriptName(newFont.postscriptName, true);
    batchCmd.addSubCommand(cmd);
    cmd = textEdit.setItalic(newFont.italic, true);
    batchCmd.addSubCommand(cmd);
    cmd = textEdit.setFontWeight(newFont.weight, true);
    batchCmd.addSubCommand(cmd);
    if (isMac) {
      cmd = textEdit.setFontFamily(newFont.postscriptName, true);
      batchCmd.addSubCommand(cmd);
      cmd = textEdit.setFontFamilyData(family, true);
      batchCmd.addSubCommand(cmd);
    } else {
      cmd = textEdit.setFontFamily(family, true);
      batchCmd.addSubCommand(cmd);
    }
    svgCanvas.undoMgr.addCommandToHistory(batchCmd);
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
    if (window.os === 'MacOS') {
      const options = FontFuncs.availableFontFamilies.map((option) => {
        const label = FontFuncs.fontNameMap.get(option);
        return { value: option, label };
      });
      const styles = {
        option: (style, { data }) => ({
          ...style, fontFamily: data.value,
        }),
        input: (style) => ({
          ...style, margin: 0, padding: 0, height: '19px',
        }),
      };
      const isOnlyOneOption = options.length === 1;
      let label = FontFuncs.fontNameMap.get(fontFamily);
      if (typeof label !== 'string') label = fontFamily;
      return (
        <div className="option-block">
          <div className="label">{LANG.font_family}</div>
          <div className="select-container">
            <Select
              className={classNames('font-react-select-container', { 'no-triangle': isOnlyOneOption })}
              classNamePrefix="react-select"
              value={{ value: fontFamily, label: FontFuncs.fontNameMap.get(fontFamily) }}
              onChange={(value) => this.handleFontFamilyChange(value)}
              onKeyDown={(e) => {
                e.stopPropagation();
              }}
              disabled={isOnlyOneOption}
              options={options}
              styles={styles}
            />
          </div>
        </div>
      );
    }
    const options = FontFuncs.availableFontFamilies.map(
      (option: string) => {
        const fontName = FontFuncs.fontNameMap.get(option);
        const label = typeof fontName === 'string' ? fontName : option;
        return (
          <option value={option} key={option} style={{ fontFamily: option }}>
            {label}
          </option>
        );
      },
    );
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

  handleFontStyleChange = (val: string): void => {
    const { updateDimensionValues, updateObjectPanel } = this.props;
    const { fontFamily } = this.state;
    const font = FontFuncs.requestFontByFamilyAndStyle({
      family: fontFamily,
      style: val,
    });
    const batchCmd = new history.BatchCommand('Change Font Style');
    let cmd = textEdit.setFontPostscriptName(font.postscriptName, true);
    batchCmd.addSubCommand(cmd);
    if (isMac) {
      cmd = textEdit.setFontFamily(font.postscriptName, true);
      batchCmd.addSubCommand(cmd);
    }
    cmd = textEdit.setItalic(font.italic, true);
    batchCmd.addSubCommand(cmd);
    cmd = textEdit.setFontWeight(font.weight, true);
    batchCmd.addSubCommand(cmd);
    svgCanvas.undoMgr.addCommandToHistory(batchCmd);
    updateDimensionValues({ fontStyle: val });
    this.setState({
      fontStyle: val,
    });
    updateObjectPanel();
  };

  renderFontStyleBlock = (): JSX.Element => {
    const { fontFamily, fontStyle } = this.state;
    const fontStyles = FontFuncs.requestFontsOfTheFontFamily(fontFamily).map((f) => f.style);
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
    textEdit.setFontSize(val);
    this.setState({
      fontSize: val,
    });
  };

  renderFontSizeBlock = (): JSX.Element => {
    const { fontSize } = this.state;
    return (
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
    textEdit.setLetterSpacing(val);
    this.setState({
      letterSpacing: val,
    });
  };

  renderLetterSpacingBlock = (): JSX.Element => {
    const { letterSpacing } = this.state;
    return (
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
    return (
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
    return (
      <div className="option-block">
        <div className="label">{LANG.vertical_text}</div>
        <div id="vertical_text" className="onoffswitch" onClick={() => this.handleVerticalTextClick()}>
          <input type="checkbox" className="onoffswitch-checkbox" checked={isVerti} readOnly />
          <label className="onoffswitch-label">
            <span className="onoffswitch-inner" />
            <span className="onoffswitch-switch" />
          </label>
        </div>
      </div>
    );
  };

  render(): JSX.Element {
    const { elem } = this.props;
    return (
      <div className="text-options">
        { this.renderFontFamilyBlock()}
        { this.renderFontStyleBlock()}
        { this.renderFontSizeBlock()}
        { this.renderLetterSpacingBlock()}
        { this.renderLineSpacingBlock()}
        { this.renderVerticalTextSwitch()}
        <InFillBlock elem={elem} />
      </div>
    );
  }
}

export default TextOptions;