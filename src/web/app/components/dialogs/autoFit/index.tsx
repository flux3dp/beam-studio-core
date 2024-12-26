import React from 'react';

import { addDialogComponent, isIdExist, popDialogById } from 'app/actions/dialog-controller';

import { AutoFitContour } from 'interfaces/IAutoFit';

import AutoFitPanel from './AutoFitPanel';

export const showAutoFitPanel = (
  element: SVGElement,
  imageUrl: string,
  data: AutoFitContour[][]
): void => {
  if (!isIdExist('auto-fit-panel')) {
    addDialogComponent(
      'auto-fit-panel',
      <AutoFitPanel
        onClose={() => popDialogById('auto-fit-panel')}
        element={element}
        imageUrl={imageUrl}
        data={data}
      />
    );
  }
};

export default {
  showAutoFitPanel,
};
