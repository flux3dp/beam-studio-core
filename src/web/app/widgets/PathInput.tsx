import * as React from 'react';
import classNames from 'classnames';
import dialog from 'implementations/dialog';
import fs from 'implementations/fileSystem';
import { DialogFilter, OpenDialogProperties } from 'interfaces/IDialog';

const { useEffect, useRef, useState } = React;

export enum InputType {
  FILE = 0,
  FOLDER = 1,
  BOTH = 2,
}

const propertiesMap = {
  0: ['openFile'],
  1: ['openDirectory', 'createDirectory', 'promptToCreate'],
  2: ['openFile', 'openDirectory', 'createDirectory', 'promptToCreate'],
};

interface Props {
  buttonTitle: string,
  className: string
  defaultValue: string,
  forceValidValue: boolean,
  type: InputType,
  getValue: (val: string, isValid: boolean) => void,
  // eslint-disable-next-line react/require-default-props
  onBlur?: () => void,
  // eslint-disable-next-line react/require-default-props
  filters?: DialogFilter[],
}

const PathInput = ({
  buttonTitle,
  className,
  defaultValue,
  getValue,
  forceValidValue = true,
  onBlur = () => { },
  type,
  filters = [],
}: Props) => {
  const [displayValue, setDisplayValue] = useState(defaultValue);
  const [savedValue, setSavedValue] = useState(defaultValue);
  const inputEl = useRef(null);

  useEffect(() => {
    setDisplayValue(defaultValue);
    setSavedValue(defaultValue);
  }, [defaultValue]);

  const validateValue = (val: string) => {
    if (fs.exists(val)) {
      if (type === InputType.BOTH) return true;
      return (type === InputType.FILE && fs.isFile(val))
        || (type === InputType.FOLDER && fs.isDirectory(val));
    }
    return false;
  };

  const updateValue = () => {
    const isValid = validateValue(displayValue);
    if (!forceValidValue || isValid) {
      if (displayValue !== savedValue) {
        setSavedValue(displayValue);
        if (getValue) {
          getValue(displayValue, isValid);
        }
      }
    } else {
      setDisplayValue(savedValue);
    }
  };

  const handleBlur = () => {
    updateValue();
    if (onBlur) {
      onBlur();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    setDisplayValue(target.value);
  };

  const handleKeyUp = (e: React.KeyboardEvent) => {
    // backspace somehow does not trigger onchange event
    const target = e.target as HTMLInputElement;
    if (target.value !== displayValue) {
      setDisplayValue(target.value);
    }
  };

  const setValueFromDialog = async () => {
    const properties = propertiesMap[type] as OpenDialogProperties[];
    const option = {
      properties,
      filters,
      defaultPath: savedValue,
    };
    const { filePaths, canceled } = await dialog.showOpenDialog(option);
    if (!canceled) {
      const isValid = validateValue(filePaths[0]);
      if (!forceValidValue || isValid) {
        setSavedValue(filePaths[0]);
        setDisplayValue(filePaths[0]);
        if (getValue) {
          getValue(filePaths[0], isValid);
        }
      }
    }
  };

  const openDialogButton = (
    <div className="dialog-btn" title={buttonTitle} onClick={setValueFromDialog}>
      <img src="img/right-panel/icon-import.svg" />
    </div>
  );

  return (
    <div className={classNames('path-input', className)}>
      <input
        type="text"
        value={displayValue}
        onBlur={handleBlur}
        onChange={handleChange}
        onKeyUp={handleKeyUp}
        ref={inputEl}
      />
      {openDialogButton}
    </div>
  );
};

export default PathInput;
