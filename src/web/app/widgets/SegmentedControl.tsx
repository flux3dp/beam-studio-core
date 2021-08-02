import * as React from 'react';
import classNames from 'classnames';

interface Props {
  segments: {
    imgSrc: string;
    title: string;
    value: number;
  }[];
  selectedIndexes: number[];
  isDisabled: boolean;
  onChanged: (type: number) => void;
}

function SegmentedControl({
  segments, selectedIndexes, isDisabled, onChanged,
}: Props): JSX.Element {
  if (selectedIndexes.length > 1) {
    console.warn('Selected more than 1 items for exclusive control');
    selectedIndexes.splice(1, selectedIndexes.length - 1);
  }

  const onClick = (index) => {
    if (isDisabled) {
      return;
    }
    if (selectedIndexes[0] !== index) {
      const value = segments[index].value || index;
      onChanged(value);
    }
  };

  const renderItems = () => {
    const items = [];
    for (let i = 0; i < segments.length; i += 1) {
      const segment = segments[i];
      const isSelected = selectedIndexes.includes(i);
      items.push(
        <div key={i} className={classNames('seg-item', { selected: isSelected })} title={segment.title} onClick={() => onClick(i)}>
          <img src={segment.imgSrc} className="seg-item-image" />
        </div>,
      );
    }
    return items;
  };

  return (
    <div className={classNames('segmented-control', { disabled: isDisabled })}>
      {renderItems()}
    </div>
  );
}

export default SegmentedControl;
