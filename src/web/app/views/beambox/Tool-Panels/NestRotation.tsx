import i18n from 'helpers/i18n';
import React from 'react';
import UnitInput from 'app/widgets/Unit-Input-v2';

const LANG = i18n.lang.beambox.tool_panels;

interface Props {
  rotations: number,
  onValueChange: (val: number) => void,
}

interface State {
  rotations: number,
}

class NestRotationPanel extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    const { rotations } = this.props;
    this.state = {
      rotations,
    };
  }

  updateVal = (val) => {
    this.props.onValueChange(val);
    this.setState({ rotations: val });
  }

  getValueCaption() {
    const rotations = this.state.rotations;
    return rotations.toString();
  }

  render() {

    return (
      <div className="tool-panel">
        <label className="controls accordion">
          <input type="checkbox" className="accordion-switcher" defaultChecked={true} />
          <p className="caption">
            {LANG._nest.rotations}
            <span className="value">{this.getValueCaption()}</span>
          </p>
          <label className="accordion-body">
            <div>
              <div className="control nest-rotations">
                <UnitInput
                  min={1}
                  decimal={0}
                  unit=""
                  defaultValue={this.state.rotations}
                  getValue={this.updateVal}
                />
              </div>
            </div>
          </label>
        </label>
      </div>
    );
  }
};

export default NestRotationPanel;
