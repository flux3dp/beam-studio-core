import React from 'react';
import classNames from 'classnames';

import UnitInput from 'app/widgets/Unit-Input-v2';
import i18n from 'helpers/i18n';

const PropTypes = requireNode('prop-types');

const LANG = i18n.lang.beambox.tool_panels;

interface Props {
  row?: number,
  column?: number,
  onValueChange?: (rc: { row: number, column: number }) => void,
}

interface State {
  row: number,
  column: number,
  isCollapsed: boolean,
}

class RowColumn extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      row: this.props.row,
      column: this.props.column,
      isCollapsed: false,
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    this.setState({
      row: nextProps.row,
      column: nextProps.column,
    });
  }

  onRawChanged = (val: number) => {
    const { onValueChange } = this.props;
    const { column } = this.state;
    onValueChange({
      row: val,
      column,
    });
    this.setState({ row: val });
  }

  onColumnChanged = (val: number) => {
    const { onValueChange } = this.props;
    const { row } = this.state;
    onValueChange({
      row,
      column: val,
    });
    this.setState({ column: val });
  }

  getValueCaption = () => {
    const row = this.state.row,
      column = this.state.column;
    return `${row} X ${column}`;
  }

  render() {
    const { isCollapsed } = this.state;
    return (
      <div className="tool-panel">
        <label className="controls accordion">
          <input type="checkbox" className="accordion-switcher" defaultChecked={true} />
          <p className="caption" onClick={() => this.setState({ isCollapsed: !isCollapsed })}>
            {LANG.array_dimension}
            <span className="value">{this.getValueCaption()}</span>
          </p>
          <div className={classNames('tool-panel-body', { collapsed: isCollapsed })}>
            <div className="control">
              <div className="text-center header">{LANG.columns}</div>
              <UnitInput
                min={1}
                unit=""
                decimal={0}
                defaultValue={this.state.column || 1}
                getValue={this.onColumnChanged}
              />
            </div>
            <div className="control">
              <div className="text-center header">{LANG.rows}</div>
              <UnitInput
                min={1}
                unit=""
                decimal={0}
                defaultValue={this.state.row || 1}
                getValue={this.onRawChanged}
              />
            </div>
          </div>
        </label>
      </div>
    );
  }
};

export default RowColumn;
