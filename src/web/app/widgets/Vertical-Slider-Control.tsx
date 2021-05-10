import React, { createRef } from 'react';

import keyCodeConstants from 'app/constants/keycode-constants';

interface IProps {
  id?: string,
  defaultValue: number,
  max: number,
  min: number,
  step: number,
  onChange: (val?: number) => void,
}

interface IState {
  value: number,
  displayValue: number|string,
  isDragging: boolean,
}

class VerticalSlider extends React.Component<IProps, IState> {
  static defaultProps = {
    defaultValue: 0,
    max: Number.MAX_SAFE_INTEGER,
    min: Number.MIN_SAFE_INTEGER,
    step: 1,
    onChange: () => {},
  }

  private sliderTrack: React.RefObject<HTMLDivElement>;

  private sliderBar: React.RefObject<HTMLDivElement>;

  private verticalSlider: React.RefObject<HTMLDivElement>;

  constructor(props) {
    super(props);
    this.state = {
      value: this.props.defaultValue,
      displayValue: this.props.defaultValue,
      isDragging: false,
    };
    this.sliderTrack = createRef();
    this.sliderBar = createRef();
  }

  componentDidMount() {
    const { max, min } = this.props;
    const { value } = this.state;
    const sliderTrack = this.sliderTrack.current;
    const sliderHeight = sliderTrack.offsetHeight;
    const sliderBar = this.sliderBar.current;
    const sliderBarRadiusStr = $(sliderBar).css('border-width');
    //This is a hack: Assuming unit is "px", may cause problem
    const sliderBarRadius = parseFloat(sliderBarRadiusStr.match(/[0-9]*/)[0]);
    const sliderTop = (max - value) / (max - min) * sliderHeight - sliderBarRadius;
    $(sliderBar).css({ top: sliderTop });
  }

  componentDidUpdate() {
    const { max, min } = this.props;
    const { value } = this.state;
    const sliderTrack = this.sliderTrack.current;
    const sliderBar = this.sliderBar.current;
    const sliderHeight = sliderTrack.offsetHeight;
    const sliderBarRadiusStr = $(sliderBar).css('border-width');
    //This is a hack: Assuming unit is "px", may cause problem
    const sliderBarRadius = parseFloat(sliderBarRadiusStr.match(/[0-9]*/)[0]);
    let sliderTop = (max - value) / (max - min) * sliderHeight - sliderBarRadius;
    $(sliderBar).css({ top: sliderTop });
  }

  handleMouseDown = (e: React.MouseEvent) => {
    const verticalSlider = this.verticalSlider.current;
    const { max, min, step, onChange } = this.props;
    const { value } = this.state;
    const top = $(verticalSlider).position().top;
    const height = $(verticalSlider).height();
    let newValue = max - (e.clientY - top) / (height) * (max - min);
    newValue = Math.round(newValue / step) * step;
    newValue = Math.max(Math.min(max, newValue), min);
    if (newValue != value) {
      onChange(newValue);
      this.setState({
        value: newValue,
        displayValue: newValue,
        isDragging: true,
      });
    } else {
      this.setState({
        isDragging: true,
      });
    }
  }

  handleMouseMove = (e: React.MouseEvent) => {
    const verticalSlider = this.verticalSlider.current;
    const { isDragging, value } = this.state;
    if (isDragging) {
      const { max, min, step, onChange } = this.props;
      let top = $(verticalSlider).position().top;
      let height = $(verticalSlider).height();
      let newValue = max - (e.clientY - top) / (height) * (max - min);
      newValue = Math.round(newValue / step) * step;
      newValue = Math.max(Math.min(max, newValue), min);
      if (newValue != value) {
        onChange(newValue);
        this.setState({
          value: newValue,
          displayValue: newValue,
        });
      }
    }
  }

  handleMouseUp = (e) => {
    const { isDragging } = this.state;
    if (isDragging) {
      this.setState({ isDragging: false });
    }
  }

  handleInputChange = (e: React.ChangeEvent) => {
    const target = e.target as HTMLInputElement;
    this.setState({ displayValue: target.value });
  }

  handleInputBlur = (e) => {
    this._validateAndUpdateValue(e.target.value);
  }

  handleInputKeydown = (e) => {
    e.stopPropagation();

    switch (e.keyCode) {
      case keyCodeConstants.KEY_RETURN:
        const activeElement = document.activeElement as HTMLInputElement;
        this._validateAndUpdateValue(e.target.value);
        if (activeElement.tagName === 'INPUT') {
          activeElement.blur();
        }

        return;
      case keyCodeConstants.KEY_ESC:
        this.setState({ displayValue: this.state.value });
        return;
      default:
        return;
    }
  }

  _validateAndUpdateValue(val) {
    val = this._validateValue(val);
    if (val !== this.state.value) {
      this.props.onChange(val);
    }
    this.setState({
      value: val,
      displayValue: val
    });
  }

  _validateValue(val) {
    let value = parseFloat(val);

    if (isNaN(value)) {
      if (this.state.value) {
        value = this.state.value;
      }
    } else {
      // check value boundary
      const { step, max, min } = this.props;
      value = Math.round(value / step) * step;
      value = Math.max(Math.min(value, max), min);
    }
    return value;
  }

  render() {
    const { id } = this.props;
    const { displayValue } = this.state;
    return (
      <div id={id} className="vertical-slider-control">
        <div className="vertical-slider"
          ref={this.verticalSlider}
          onMouseDown={this.handleMouseDown}
          onMouseMove={this.handleMouseMove}
          onMouseUp={this.handleMouseUp}
          onMouseLeave={this.handleMouseUp}>
          <div className="slider-track" ref={this.sliderTrack}>
            <div className="slider-bar" ref={this.sliderBar}>
            </div>
          </div>
        </div>
        <div className="input-value">
          <input
            type="text"
            value={displayValue}
            onBlur={this.handleInputBlur}
            onChange={this.handleInputChange}
            onKeyDown={this.handleInputKeydown}
          />
        </div>
      </div>
    );
  }
}

export default VerticalSlider;
