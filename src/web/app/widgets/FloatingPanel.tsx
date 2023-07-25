import * as React from 'react';
import classNames from 'classnames';
import { FloatingPanel as AntdFloatingPanel } from 'antd-mobile';

import ActionIcon from 'app/icons/action-panel/ActionPanelIcons';
import Icon from '@ant-design/icons';

import styles from './FloatingPanel.module.scss';

interface Props {
  className?: string;
  anchors: number[];
  title: string;
  fixedContent?: React.ReactNode;
  children: React.ReactNode;
  forceClose?: boolean;
  onClose?: () => void;
}

const FloatingPanel = ({
  className,
  anchors,
  title,
  fixedContent,
  children,
  forceClose = false,
  onClose,
}: Props): JSX.Element => {
  const panelRef = React.useRef(null);
  const [panelHeight, setPanelHeight] = React.useState(anchors[0]);
  const [hasClosed, setHasClosed] = React.useState(false);

  React.useEffect(() => {
    const targetHeight = forceClose ? 0 : anchors.find((anchor) => anchor > 0);
    panelRef.current.setHeight(targetHeight);
  }, [panelRef, forceClose]);

  const onHeightChange = (height: number, animating: boolean) => {
    setPanelHeight(height);
    if (height <= 0 && !hasClosed) {
      setHasClosed(true);
      onClose?.();
    }
  };

  return (
    <AntdFloatingPanel
      className={classNames(className, styles.panel)}
      ref={panelRef}
      anchors={anchors}
      handleDraggingOfContent={false}
      onHeightChange={onHeightChange}
      style={{ height: panelHeight }}
    >
      <Icon
        className={styles['close-icon']}
        component={ActionIcon.Delete}
        viewBox="0 0 32 32"
        onClick={() => panelRef.current.setHeight(0)}
      />
      <div className={styles.title}>{title}</div>
      {fixedContent}
      <div className={styles['scroll-content']}>{children}</div>
    </AntdFloatingPanel>
  );
};

export default FloatingPanel;
