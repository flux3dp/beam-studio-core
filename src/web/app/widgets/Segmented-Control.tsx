import * as React from 'react';
import classNames from 'classnames';

interface Props {
  segments: {
    id?: string;
    imgSrc?: string;
    title: string;
    value: number;
    text?: string;
  }[];
  selectedIndexes: number[];
  selectedIndex?: number;
  isDisabled: boolean;
  className?: string;
  onChanged: (type: number) => void;
}


// This Component is fully controled, i.e. every time it is changed, you have to rerender its parent to refresh it.
class SegmentedControl extends React.Component<Props> {
    constructor(props) {
        super(props);
        if (this.props.segments) {
            const { segments } = this.props;
            if (segments.length < 2) {
                console.warn('Segmented Control with segments less than 2');
            } else if (segments.length > 5) {
                console.warn('Segmented Control with segments more than 5, maybe too many.');
            }
        }
        if (this.props.selectedIndex !== null && (!this.props.selectedIndexes || this.props.selectedIndexes.length === 0)) {
            this.props.selectedIndexes.push(this.props.selectedIndex);
        }
        if (this.props.selectedIndexes.length > 1) {
            console.warn('Selected more than 1 items for exclusive control');
            this.props.selectedIndexes.splice(1, this.props.selectedIndexes.length - 1);
        }
    }

    onClick = (index) => {
        if (this.props.isDisabled) {
            return;
        }
        const { segments, onChanged, selectedIndexes } = this.props;
        if (selectedIndexes[0] !== index) {
            selectedIndexes[0] = index;
            const value = segments[index].value || index;
            onChanged(value);
            return value;
        }
    }

    renderItems() {
        const { segments, selectedIndexes } = this.props;
        const items = [];
        for (let i = 0; i < segments.length; i++) {
            const segment = segments[i];
            const isSelected = selectedIndexes.includes(i);
            items.push(
                <div id={segment.id} key={i} className={classNames('seg-item', {'selected' :isSelected})} title={segment.title} onClick={() => this.onClick(i)}>
                    {segment.imgSrc ?
                        <img src={segment.imgSrc} className='seg-item-image' />
                        :
                        <div className='seg-item-text'>
                            {segment.text}
                        </div>
                    }
                </div>
            );
        }
        return items;
    }

    render() {
        const { isDisabled } = this.props;
        return (
            <div className={classNames('segmented-control', this.props.className, {disabled: isDisabled})}>
                {this.renderItems()}
            </div>
        );
    }
};

// SegmentedControl.defaultProps = {
//     isDisabled: false,
//     className: '',
//     segments: [
//         {
//             imgSrc: null,
//             text: '1',
//             title: 'Placeholder 1',
//             value: 1,
//         },
//         {
//             imgSrc: null,
//             text: '2',
//             title: 'Placeholder 2',
//             value: 2,
//         }
//     ],
//     selectedIndex: null,
//     selectedIndexes: [],
//     onChanged: (selectedIndexes) => {
//         console.log(selectedIndexes)
//     }
// };

export default SegmentedControl;
