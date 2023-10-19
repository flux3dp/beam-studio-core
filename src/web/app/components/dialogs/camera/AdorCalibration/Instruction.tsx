import React, { useRef } from 'react';
import { Button, Modal } from 'antd';

import useDidUpdateEffect from 'helpers/hooks/useDidUpdateEffect';

import styles from './Instruction.module.scss';

interface Props {
  animationSrcs: { src: string; type: string }[];
  title: string;
  text?: string;
  buttons: { label: string; type?: 'primary' | 'default'; onClick: () => void }[];
  onClose?: (done?: boolean) => void;
}

const Instruction = ({ animationSrcs, title, text, buttons, onClose }: Props): JSX.Element => {
  const videoRef = useRef<HTMLVideoElement>(null);
  useDidUpdateEffect(() => {
    videoRef.current?.load();
  }, [animationSrcs]);

  return (
    <Modal
      width={400}
      open
      centered
      maskClosable={false}
      title={title}
      className={styles.container}
      closable={!!onClose}
      onCancel={() => onClose?.(false)}
      footer={buttons.map(({ label, type, onClick }) => (
        <Button key={label} type={type} onClick={onClick}>
          {label}
        </Button>
      ))}
    >
      {text}
      <video className={styles.video} ref={videoRef} autoPlay loop muted>
        {animationSrcs.map(({ src, type }) => (
          <source key={src} src={src} type={type} />
        ))}
      </video>
    </Modal>
  );
};

export default Instruction;
