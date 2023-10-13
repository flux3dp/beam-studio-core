import * as React from 'react';
import classNames from 'classnames';
import { Button, ConfigProvider, Switch } from 'antd';

import i18n from 'helpers/i18n';
import ObjectPanelItem from 'app/views/beambox/Right-Panels/ObjectPanelItem';
import OptionPanelIcons from 'app/icons/option-panel/OptionPanelIcons';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import { iconButtonTheme } from 'app/views/beambox/Right-Panels/antd-config';
import { isMobile } from 'helpers/system-helper';

import styles from './InFillBlock.module.scss';

let svgCanvas;

getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
});

const LANG = i18n.lang.beambox.right_panel.object_panel.option_panel;

interface Props {
  label?: string;
  elem: Element;
  id?: string;
}

interface State {
  isAnyFilled: boolean;
  isAllFilled: boolean;
  isFillable: boolean;
}

class InFillBlock extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const { elem } = props;
    const isFillable = svgCanvas.isElemFillable(elem);
    const { isAnyFilled, isAllFilled } = svgCanvas.calcElemFilledInfo(elem);
    this.state = {
      isAnyFilled,
      isAllFilled,
      isFillable,
    };
  }

  componentDidUpdate(prevProps: Props): void {
    const lastElem = prevProps.elem;
    const lastId = lastElem.getAttribute('id');
    const { elem } = this.props;
    if (elem.getAttribute('id') !== lastId) {
      const isFillable = svgCanvas.isElemFillable(elem);
      const { isAnyFilled, isAllFilled } = svgCanvas.calcElemFilledInfo(elem);
      this.setState({
        isAnyFilled,
        isAllFilled,
        isFillable,
      });
    }
  }

  onClick = (): void => {
    const { isAnyFilled } = this.state;
    const { elem } = this.props;
    if (isAnyFilled) {
      svgCanvas.setElemsUnfill([elem]);
    } else {
      svgCanvas.setElemsFill([elem]);
    }
    this.setState({
      isAnyFilled: !isAnyFilled,
      isAllFilled: !isAnyFilled,
    });
  };

  render(): JSX.Element {
    const { elem, label, id = 'infill' } = this.props;
    const { isAnyFilled, isAllFilled, isFillable } = this.state;
    const isPartiallyFilled = elem.tagName === 'g' && isAnyFilled && !isAllFilled;
    if (!isFillable) {
      return null;
    }
    // eslint-disable-next-line no-nested-ternary
    return isMobile() ? (
      <ObjectPanelItem.Item
        id={id}
        content={<Switch checked={isAnyFilled} />}
        label={label || LANG.fill}
        onClick={this.onClick}
      />
    ) : label ? (
      <div className="option-block" key="infill">
        <div className="label">{label}</div>
        <Switch size="small" checked={isAnyFilled} onClick={this.onClick} />
      </div>
    ) : (
      <ConfigProvider theme={iconButtonTheme}>
        <Button
          id={id}
          type="text"
          className={classNames({ [styles.filled]: isAllFilled })}
          title={LANG.fill}
          icon={
            isPartiallyFilled ? <OptionPanelIcons.InfillPartial /> : <OptionPanelIcons.Infill />
          }
          onClick={this.onClick}
        />
      </ConfigProvider>
    );
  }
}

export default InFillBlock;
