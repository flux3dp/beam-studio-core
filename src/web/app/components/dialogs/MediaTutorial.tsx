import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';

import ButtonGroup from 'app/widgets/ButtonGroup';
import i18n from 'helpers/i18n';
import Modal from 'app/widgets/Modal';
import { IButton } from 'interfaces/IButton';
import { IMediaTutorial } from 'interfaces/ITutorial';

interface Props {
  data: IMediaTutorial[],
  onClose: () => void,
}

function MediaTutorial({ data, onClose }: Props): JSX.Element {
  const LANG = i18n.lang.buttons;
  const [step, setStep] = useState(0);
  const videoRef = useRef<HTMLVideoElement>();

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, [step]);

  const { mediaSources, isVideo, description } = data[step];

  const mediaContent = () => {
    if (isVideo) {
      return (
        <video autoPlay loop muted ref={videoRef}>
          {mediaSources.map(({ src, type }) => <source src={src} type={type} />)}
        </video>
      );
    }
    return (<img src={mediaSources[0].src} />);
  };

  const buttons: IButton[] = [];
  if (step !== 0) {
    buttons.push({ label: LANG.back, onClick: () => setStep(step - 1) });
  }
  if (step === data.length - 1) {
    buttons.push({ label: LANG.done, onClick: () => onClose(), className: 'btn-default primary' });
  } else {
    buttons.push({ label: LANG.next, onClick: () => setStep(step + 1), className: 'btn-default primary' });
  }

  return (
    <Modal>
      <div className="media-tutorial">
        <div className={classNames('close-btn')} onClick={onClose}>
          <img src="img/icon-clear.svg" />
        </div>
        <div className="media-container">
          {mediaContent()}
        </div>
        <div className="description">{description}</div>
        <div className="step">{`${step + 1}/${data.length}`}</div>
        <ButtonGroup
          buttons={buttons}
        />
      </div>
    </Modal>
  );
}

export default MediaTutorial;
