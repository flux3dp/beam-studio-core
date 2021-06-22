import * as React from 'react';

import i18n from 'helpers/i18n';
import Modal from 'app/widgets/Modal';

const LANG = i18n.lang.topmenu;
const { FLUX } = window;

interface Props {
  onClose: () => void;
}

function AboutBeamStudio({ onClose }: Props): JSX.Element {
  return (
    <Modal onClose={onClose}>
      <div className="about-beam-studio">
        <img src="img/icon.png" />
        <div className="app-name">Beam Studio</div>
        <div className="version">{`${LANG.version} ${FLUX.version}`}</div>
        <div className="copyright">Copyright ⓒ 2021 FLUX Inc.</div>
        <button
          type="button"
          className="btn btn-default"
          onClick={onClose}
        >
          {LANG.ok}
        </button>
      </div>
    </Modal>
  );
}

export default AboutBeamStudio;
