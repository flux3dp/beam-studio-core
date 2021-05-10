import React from 'react';

interface Props {
  status: string,
  progress: string,
}

export default class MonitorInfo extends React.PureComponent<Props>{
    render() {
        const { status, progress } = this.props;
        return (
            <div className="wrapper">
                <div className="row">
                    <div className="status right">
                        {status}
                    </div>
                </div>
                <div className="row">
                    <div className="time-left right">{progress}</div>
                </div>
            </div>
        );
    }
};
