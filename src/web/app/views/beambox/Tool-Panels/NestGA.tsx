import React from 'react';
import UnitInput from 'app/widgets/Unit-Input-v2';

interface Props {
  nestOptions: {
    generations: number,
    population: number,
  }
  updateNestOptions: (options: {
    generations?: number,
    population?: number,
  }) => void,
}

interface State {
  generations: number,
  population: number,
}

class NestGAPanel extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      generations: props.nestOptions.generations,
      population: props.nestOptions.population
    };
  }

  updateGen = (val: number) => {
    const { updateNestOptions } = this.props;
    updateNestOptions({ generations: val });
    this.setState({ generations: val });
  }

  updatePopu = (val: number) => {
    const { updateNestOptions } = this.props;
    updateNestOptions({ population: val });
    this.setState({ population: val });
  }

  getValueCaption() {
    const { generations, population } = this.state;
    return `G${generations}, P${population}`
  }

  render() {
    return (
      <div className="tool-panel">
        <label className="controls accordion">
          <input type="checkbox" className="accordion-switcher" defaultChecked={true} />
          <p className="caption">
            {'GA'}
            <span className="value">{this.getValueCaption()}</span>
          </p>
          <label className='accordion-body'>
            <div>
              <span className="text-center header">Generations</span>
              <div className='control'>
                <UnitInput
                  min={1}
                  unit=''
                  decimal={0}
                  defaultValue={this.state.generations}
                  getValue={this.updateGen}
                />
              </div>
              <span className="text-center header">Population</span>
              <div className='control'>
                <UnitInput
                  min={2}
                  unit=''
                  decimal={0}
                  defaultValue={this.state.population}
                  getValue={this.updatePopu}
                />
              </div>
            </div>
          </label>
        </label>
      </div>
    );
  }
};

export default NestGAPanel;
