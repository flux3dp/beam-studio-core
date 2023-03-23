import React, { MouseEvent, memo, ReactNode, useContext } from 'react';
import { Breadcrumb } from 'antd';
import { HomeOutlined } from '@ant-design/icons';

import { MonitorContext } from 'app/contexts/MonitorContext';

import styles from './Breadcrumbs.module.scss';

const Breadcrumbs = (): JSX.Element => {
  const { currentPath, onSelectFolder } = useContext(MonitorContext);
  const breadcrumbItems: { title: ReactNode, onClick: () => void }[] = [
    { title: <HomeOutlined />, onClick: () => onSelectFolder('', true) }
  ];
  currentPath.forEach((folder, i) => {
    const handleClick = () => onSelectFolder(currentPath.slice(0, i + 1).join('/'), true);
    breadcrumbItems.push({ title: folder, onClick: handleClick });
  });

  // Somehow onClick in items is not used by antd, write a custom itemRender to add event
  const itemRender = (item: { title: ReactNode, onClick: (e: MouseEvent) => void }) => {
    const { title, onClick } = item;
    return <span className={styles.item} onClick={onClick}>{title}</span>;
  };

  return (
    <Breadcrumb itemRender={itemRender} items={breadcrumbItems} />
  );
};

export default memo(Breadcrumbs);
