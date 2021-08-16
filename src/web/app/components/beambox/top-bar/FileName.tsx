import React from 'react';

import i18n from 'helpers/i18n';

const LANG = i18n.lang.topbar;

interface Props {
  fileName: string;
  hasUnsavedChange: boolean;
}

function FileName({ fileName, hasUnsavedChange }: Props): JSX.Element {
  if (window.os === 'Windows') {
    return null;
  }

  return (
    <div className="file-title">
      {(fileName || LANG.untitled) + (hasUnsavedChange ? '*' : '')}
    </div>
  );
}

export default FileName;
