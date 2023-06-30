import React from 'react';

import i18n from 'helpers/i18n';
import { useIsMobile } from 'helpers/system-helper';

const LANG = i18n.lang.topbar;

interface Props {
  fileName: string;
  hasUnsavedChange: boolean;
}

function FileName({ fileName, hasUnsavedChange }: Props): JSX.Element {
  const isMobile = useIsMobile();
  if (window.os === 'Windows' || isMobile) {
    return null;
  }

  return (
    <div className="file-title">
      {(fileName || LANG.untitled) + (hasUnsavedChange ? '*' : '')}
    </div>
  );
}

export default FileName;
