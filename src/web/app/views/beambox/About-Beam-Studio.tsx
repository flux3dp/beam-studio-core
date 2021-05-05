import * as React from 'react';
import * as i18n from 'helpers/i18n';
import Modal from 'app/widgets/Modal';

const LANG = i18n.lang.topmenu;
const FLUX = window['FLUX'];

interface Props {
  onClose: () => void;
}

class AboutBeamStudio extends React.Component<Props> {
    _close = () => {
        this.props.onClose();
    }

    render() {
        return (
            <Modal onClose={() => {this._close()}}>
                <div className='about-beam-studio'>
                    <img src='icon.png'/>
                    <div className='app-name'>{'Beam Studio'}</div>
                    <div className='version'>{`${LANG.version} ${FLUX.version}`}</div>
                    <div className='copyright'>{'Copyright ⓒ 2021 FLUX Inc.'}</div>
                    <button
                        className='btn btn-default'
                        onClick={() => this._close()}
                    >{LANG.ok}
                    </button>
                </div>
            </Modal>
        )
    }
};

export default AboutBeamStudio;
