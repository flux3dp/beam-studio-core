import React from 'react';
import classNames from 'classnames';

import SelectView from 'app/widgets/Select';
import i18n from 'helpers/i18n';

const LANG = i18n.lang.beambox.tool_panels;

interface Props {
  cornerType: string,
  onValueChange: (val: string) => void,
}

interface State {
  cornerType: string,
  isCollapsed: boolean,
}

class OffsetCornerPanel extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    const { cornerType } = this.props;
    this.state = {
      cornerType,
      isCollapsed: false,
    };
  }

  updateOffsetCorner(val: string) {
    const { onValueChange } = this.props;
    onValueChange(val);
    this.setState({ cornerType: val });
  }

  getOffsetCornerText() {
    const typeNameMap = {
      'sharp': LANG._offset.sharp,
      'round': LANG._offset.round
    }
    return typeNameMap[this.state.cornerType];
  }

  render() {
    const { isCollapsed } = this.state;
    const options = [
      {
        value: 'sharp',
        label: LANG._offset.sharp,
        selected: this.state.cornerType === 'sharp'
      },
      {
        value: 'round',
        label: LANG._offset.round,
        selected: this.state.cornerType === 'round'
      }
    ];
    return (
      <div className="tool-panel">
        <label className="controls accordion">
          <input type="checkbox" className="accordion-switcher" defaultChecked={true} />
          <p className="caption" onClick={() => this.setState({ isCollapsed: !isCollapsed })}>
            {LANG._offset.corner_type}
            <span className="value">{this.getOffsetCornerText()}</span>
          </p>
          <div className={classNames('tool-panel-body', { collapsed: isCollapsed })}>
            <div className="control offset-corner">
              <SelectView
                id='select-offset-corner'
                options={options}
                onChange={e => this.updateOffsetCorner(e.target.value)}
              />
            </div>
          </div>
        </label>
      </div>
    );
  }
}

export default OffsetCornerPanel;
