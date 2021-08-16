import React from 'react';

import i18n from 'helpers/i18n';
import { TopBarHintsContext } from 'app/contexts/TopBarHintsContext';

const LANG = i18n.lang.topbar;

const TopBarHints = (): JSX.Element => {
  const context = React.useContext(TopBarHintsContext);
  const renderContent = () => {
    const { hintType } = context;
    if (!hintType) {
      return null;
    }
    if (hintType === 'POLYGON') {
      return (
        <div>
          {LANG.hint.polygon}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="hint-container">
      {renderContent()}
    </div>
  );
};

export default TopBarHints;
