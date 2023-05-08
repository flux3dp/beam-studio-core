/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable max-len */
import React from 'react';
import Icon from '@ant-design/icons';
import type { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

const CropSvg = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="12 12 24 24">
    <g transform="translate(13.679 13.802)">
      <path d="M4,.75V16.042H19.19" transform="translate(0.483 0.219)" fill="none" stroke="#5b5b5b" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
      <path d="M15.943,18.97V3.678H.75" transform="translate(0.218 0.457)" fill="none" stroke="#5b5b5b" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </g>
  </svg>
);

const GraycaleSvg = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="12 12 24 24">
    <g transform="translate(16.435 16.071)">
      <path d="M.75.75V16.608H15.88" transform="translate(-0.75 -0.75)" fill="none" stroke="#5b5b5b" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
      <path d="M15.421,1.9v.545a5.328,5.328,0,0,1-5.2,5.449A5.859,5.859,0,0,0,4.509,13.89" transform="translate(-0.916 -0.801)" fill="none" stroke="#969696" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </g>
  </svg>
);

const InvertSvg = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="12 12 24 24">
    <g transform="translate(14.737 14.737)">
      <path d="M2.107.064A2.076,2.076,0,0,0,.644.645,2.077,2.077,0,0,0,.063,2.108v14.31a2.077,2.077,0,0,0,.581,1.463,2.076,2.076,0,0,0,1.463.581h14.31a1.985,1.985,0,0,0,2.045-1.924q0-.06,0-.12V2.108a2.072,2.072,0,0,0-.58-1.463A2.078,2.078,0,0,0,16.417.064ZM16.417,2.27V16.58H2.108l3.541-3.541a5.11,5.11,0,1,1,7.227-7.227ZM12.875,5.65,5.649,12.876a5.11,5.11,0,0,0,7.227-7.227Z" fill="#5c5c5c" />
      <path d="M17.539,18.526H.986A.987.987,0,0,1,0,17.54V.987A.988.988,0,0,1,.986,0H17.539a.988.988,0,0,1,.987.987V17.54a.988.988,0,0,1-.987.986M1,1V17.54l16.539-.014L17.526.987Z" fill="#5c5c5c" />
    </g>
  </svg>
);

const ArraySvg = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="12 12 24 24">
    <g transform="translate(-1093.717 -1787.408)">
      <path d="M673.33,231.507a3.45,3.45,0,1,0,3.45,3.45A3.45,3.45,0,0,0,673.33,231.507Z" transform="translate(439.168 1571.445)" fill="none" stroke="#5c5c5c" strokeWidth="2" />
      <path d="M673.33,231.507a3.45,3.45,0,1,0,3.45,3.45A3.45,3.45,0,0,0,673.33,231.507Z" transform="translate(449.606 1571.445)" fill="none" stroke="#5c5c5c" strokeWidth="2" />
      <path d="M673.33,231.507a3.45,3.45,0,1,0,3.45,3.45A3.45,3.45,0,0,0,673.33,231.507Z" transform="translate(439.168 1581.457)" fill="none" stroke="#5c5c5c" strokeWidth="2" />
    </g>
  </svg>
);

const SharpenSvg = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="12 12 24 24">
    <path d="M676.357,241.024a1.634,1.634,0,0,0-1.455.832l-4.849,9.027a1.458,1.458,0,0,0,.723,2.019,1.716,1.716,0,0,0,.719.159h9.7a1.564,1.564,0,0,0,1.617-1.5,1.419,1.419,0,0,0-.17-.673l-4.849-9.027A1.631,1.631,0,0,0,676.357,241.024Z" transform="translate(-652.346 -223.043)" fill="none" stroke="#5c5c5c" strokeWidth="1.5" />
  </svg>
);

const BevelSvg = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="12 12 24 24">
    <g transform="translate(14.394 15.22)">
      <path d="M17.532,1.42,1.407,1.853,1.4,8.65l1.307,7.5H17.532Zm1,15.731H1.868L.408,8.737V.881L18.532.4Z" transform="translate(0.273 0)" fill="#8c8c8c" />
      <g transform="translate(0.157 0.158)">
        <path d="M.691,8.827a5.511,5.511,0,0,0,.984-.09L3.17,15.9H17.556V1.677l-9.622.26a5.846,5.846,0,0,0,.184-1.5L18.288.158a.762.762,0,0,1,.542.213.749.749,0,0,1,.226.537V16.652a.75.75,0,0,1-.75.75H2.563a.749.749,0,0,1-.733-.593L.161,8.833c0-.01,0-.021,0-.032.174.016.349.026.532.026" transform="translate(-0.159 -0.158)" fill="#969696" />
        <path d="M10.3,9.165h8.51V.656H10.3Zm7.509-1h-6.51V1.656H17.8Z" transform="translate(-10.044 -0.158)" fill="#8c8c8c" />
      </g>
      <path d="M10.794,16.669a.75.75,0,0,0,.467-1.338L2.1,8.076A.75.75,0,0,0,1.17,9.252l9.159,7.255a.748.748,0,0,0,.465.162" transform="translate(6.782 0)" fill="#8c8c8c" />
      <path d="M10.8,9.415h7.509a.75.75,0,0,0,.75-.75V1.156a.75.75,0,0,0-.75-.75H10.8a.75.75,0,0,0-.75.75V8.665a.75.75,0,0,0,.75.75m6.759-1.5h-6.01V1.906h6.01Z" transform="translate(-9.888 0)" fill="#5c5c5c" />
    </g>
  </svg>
);

const TraceSvg = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="12 12 24 24">
    <g id="Group_136" data-name="Group 136" transform="translate(14.407 14.929)">
      <path id="Path_220" data-name="Path 220" d="M10.7,10.07l3.253,3.217a.691.691,0,0,0,.29.941.707.707,0,0,0,.952-.286A.692.692,0,0,0,14.9,13a.712.712,0,0,0-.661,0L10.927,9.722a2.354,2.354,0,0,1-.23.348" fill="#484949" />
      <path id="Path_221" data-name="Path 221" d="M10.7,10.07l3.253,3.217a.691.691,0,0,0,.29.941.707.707,0,0,0,.952-.286A.692.692,0,0,0,14.9,13a.712.712,0,0,0-.661,0L10.927,9.722a2.354,2.354,0,0,1-.23.348" fill="none" stroke="#484949" strokeWidth="0.5" />
      <path id="Path_222" data-name="Path 222" d="M16.441,11.407,11.279,9.643a.528.528,0,0,0-.653.357.514.514,0,0,0,0,.3l1.679,5.192a.7.7,0,0,0,.342.437L15.124,17.5a.674.674,0,0,0,.819,0l2.6-2.554a.687.687,0,0,0,0-.836l-1.654-2.375A.7.7,0,0,0,16.441,11.407Z" fill="none" stroke="#484949" strokeMiterlimit="10" strokeWidth="1" />
      <circle id="Ellipse_31" data-name="Ellipse 31" cx="1.602" cy="1.602" r="1.602" transform="translate(9.36 0.75)" fill="none" stroke="#969696" strokeMiterlimit="10" strokeWidth="1.5" />
      <circle id="Ellipse_32" data-name="Ellipse 32" cx="1.562" cy="1.562" r="1.562" transform="translate(0.75 9.135)" fill="none" stroke="#969696" strokeMiterlimit="10" strokeWidth="1.5" />
      <path id="Path_223" data-name="Path 223" d="M10.962,3.609A7.088,7.088,0,0,1,3.874,10.7" fill="none" stroke="#969696" strokeMiterlimit="10" strokeWidth="1.5" />
    </g>
  </svg>
);

const ReplaceSvg = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="12 12 24 24">
    <g transform="translate(15.579 15.101)">
      <path d="M16.091,0H5.612a.75.75,0,0,0-.75.75V4.683a5.11,5.11,0,0,1,1.5.244V1.5h8.979V13H10.747a11.417,11.417,0,0,1-.09,1.5h5.434a.75.75,0,0,0,.75-.75V.75a.75.75,0,0,0-.75-.75" fill="#5c5c5c" />
      <path d="M10.043,16.3H1.5V5.388h8.543V7.239a.217.217,0,0,0,.217.217h1.066a.217.217,0,0,0,.217-.217v-2.6a.75.75,0,0,0-.75-.75H.75a.75.75,0,0,0-.75.75V17.049a.75.75,0,0,0,.75.75H10.793a.75.75,0,0,0,.75-.75V12.338a.153.153,0,0,0-.152-.153h-1.2a.153.153,0,0,0-.152.153Z" fill="#5c5c5c" />
      <path d="M13.777,10.665c.01-.748,0-1.495,0-2.242a.42.42,0,1,0-.832.013c.016.254.006.509.008.764,0,.129,0,.259,0,.388,0,.029-.062.056-.085.042a.107.107,0,0,1-.019-.018s-.294-.194-.426-.31a4.8,4.8,0,0,0-.654-.484,4.671,4.671,0,0,0-1.163-.509,6.622,6.622,0,0,0-.723-.149A6.86,6.86,0,0,0,8.569,8.2a4.919,4.919,0,0,0-1.023.3,4.736,4.736,0,0,0-.713.372,5.261,5.261,0,0,0-.8.639,3.442,3.442,0,0,0-.459.526,5.654,5.654,0,0,0-.423.689.367.367,0,0,0,.563.451c.112-.183.347-.547.44-.671a4.036,4.036,0,0,1,.754-.774A4.1,4.1,0,0,1,7.994,9.12a3.572,3.572,0,0,1,1.042-.23,3.886,3.886,0,0,1,1.443.16,4.141,4.141,0,0,1,.948.431,3.994,3.994,0,0,1,.866.737c.022.016.045.033.033.061-.019.046-.069.022-.1.022-.4,0-.8,0-1.206,0a.372.372,0,0,0-.256.084.443.443,0,0,0-.105.548l.147.147a.822.822,0,0,0,.344.048c.721,0,1.443,0,2.164,0a.411.411,0,0,0,.467-.464m-1.05-.824a1.529,1.529,0,0,1-.342.319l.342-.319" fill="#969696" />
      <path d="M13.777,10.665c.01-.748,0-1.495,0-2.242a.42.42,0,1,0-.832.013c.016.254.006.509.008.764,0,.129,0,.259,0,.388,0,.029-.062.056-.085.042a.107.107,0,0,1-.019-.018s-.294-.194-.426-.31a4.8,4.8,0,0,0-.654-.484,4.671,4.671,0,0,0-1.163-.509,6.622,6.622,0,0,0-.723-.149A6.86,6.86,0,0,0,8.569,8.2a4.919,4.919,0,0,0-1.023.3,4.736,4.736,0,0,0-.713.372,5.261,5.261,0,0,0-.8.639,3.442,3.442,0,0,0-.459.526,5.654,5.654,0,0,0-.423.689.367.367,0,0,0,.563.451c.112-.183.347-.547.44-.671a4.036,4.036,0,0,1,.754-.774A4.1,4.1,0,0,1,7.994,9.12a3.572,3.572,0,0,1,1.042-.23,3.886,3.886,0,0,1,1.443.16,4.141,4.141,0,0,1,.948.431,3.994,3.994,0,0,1,.866.737c.022.016.045.033.033.061-.019.046-.069.022-.1.022-.4,0-.8,0-1.206,0a.372.372,0,0,0-.256.084.443.443,0,0,0-.105.548l.147.147a.822.822,0,0,0,.344.048c.721,0,1.443,0,2.164,0A.411.411,0,0,0,13.777,10.665Zm-1.05-.824a1.529,1.529,0,0,1-.342.319Z" fill="none" stroke="#969696" strokeWidth="0.25" />
    </g>
  </svg>
);

const PenSvg = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="12 12 24 24">
    <g transform="translate(15.917 15.924)">
      <path d="M1.467,18l5-5a1.082,1.082,0,1,0-.447-.448L.926,17.646A3.835,3.835,0,0,1,1.467,18" transform="translate(-0.771 -1.986)" fill="#484949" stroke="#484949" strokeWidth="0.5" />
      <path d="M11.665,3.064,15.9,7.3a.479.479,0,0,0,.673.037L18.1,5.818a.479.479,0,0,0-.037-.673L13.822.907a.478.478,0,0,0-.673-.036l-1.521,1.52A.478.478,0,0,0,11.665,3.064Z" transform="translate(-2.052 -0.749)" fill="none" stroke="#484949" strokeMiterlimit="10" strokeWidth="1.5" />
      <path d="M3.524,8.447.782,16.381a.811.811,0,0,0,1.015,1L9.867,14.8a1.081,1.081,0,0,0,.679-.526L13,10.472a1.028,1.028,0,0,0,0-1.259l-3.97-4a1.078,1.078,0,0,0-1.3,0L4.039,7.755A1.083,1.083,0,0,0,3.524,8.447Z" transform="translate(-0.75 -1.263)" fill="none" stroke="#484949" strokeMiterlimit="10" strokeWidth="1.5" />
    </g>
  </svg>
);

const OffsetSvg = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="12 12 24 24">
    <path d="M14.927,19.091A1.484,1.484,0,0,1,14.32,19a21.9,21.9,0,0,1-3.384-2.343,8.726,8.726,0,0,0-.868-.607c-.174.174-.521.347-.868.607A21.027,21.027,0,0,1,5.729,19a1.29,1.29,0,0,1-.608.088,2.078,2.078,0,0,1-1.214-.434,2.2,2.2,0,0,1-.868-1.563c0-.26.087-.78,1.128-3.9.174-.434.261-.868.347-1.128-.173-.174-.607-.434-.955-.695C.869,9.459.436,9.025.348,8.851a2.243,2.243,0,0,1-.26-1.822,1.956,1.956,0,0,1,1.3-1.3A24.375,24.375,0,0,1,5.468,5.64H6.684c.087-.26.26-.694.346-1.041C8.072,1.475,8.332.868,8.506.695A2.167,2.167,0,0,1,10.068,0a2.293,2.293,0,0,1,1.648.781c.174.173.347.694,1.388,3.9.174.434.261.781.347,1.041h1.041c3.384,0,3.992.088,4.252.174a2.146,2.146,0,0,1,1.3,1.3,2.236,2.236,0,0,1-.261,1.821c-.087.174-.521.608-3.3,2.6a8.544,8.544,0,0,1-.867.607c.087.261.173.607.346,1.041A21.73,21.73,0,0,1,17.1,17.269a2.237,2.237,0,0,1-.868,1.648,6.68,6.68,0,0,1-1.3.174M2.084,6.942H1.911a1.01,1.01,0,0,0-.521.521.654.654,0,0,0,.087.695l.087.087.087.087c.087.087,1.475,1.128,2.516,1.909,1.649,1.215,1.649,1.215,1.736,1.3a.315.315,0,0,1,.087.26c0,.087-1.562,5.12-1.562,5.12v.173a.582.582,0,0,0,.347.608c0,.087.173.173.346.173h.261a.3.3,0,0,1,.173-.087c.088-.087,1.563-1.129,2.6-1.822l1.735-1.215c.088,0,.088-.087.174-.087s.173,0,.173.087l4.252,3.038a.305.305,0,0,1,.174.087c.087,0,.173.087.26.087a.663.663,0,0,0,.434-.173.879.879,0,0,0,.347-.607v-.261c-.087-.261-1.563-4.946-1.563-5.033a.522.522,0,0,1,.088-.346s3.557-2.69,4.252-3.124l.173-.173a.656.656,0,0,0,.087-.695.781.781,0,0,0-.521-.521h-.173s-5.207-.087-5.293-.087c-.174,0-.261-.087-.347-.261s-1.649-4.773-1.649-4.946a.309.309,0,0,1-.087-.173c0-.088-.173-.174-.26-.261l-.088-.087a.516.516,0,0,0-.346-.087.618.618,0,0,0-.521.26A37.169,37.169,0,0,0,8.072,5.294c-.347,1.128-.434,1.3-.434,1.387-.087.174-.174.174-.347.261Z" transform="translate(13.932 14.451)" fill="#5c5c5c" stroke="#5c5c5c" strokeWidth="0.5" />
    <path d="M8.041,8.087l-2.864.055a.414.414,0,0,0-.238.748L7.253,10.6a.414.414,0,0,1,.148.461L6.538,13.7a.414.414,0,0,0,.634.465l2.27-1.62a.413.413,0,0,1,.481,0l2.3,1.643a.414.414,0,0,0,.637-.459l-.819-2.675a.416.416,0,0,1,.15-.455L14.51,8.89a.415.415,0,0,0-.238-.748L11.4,8.087a.415.415,0,0,1-.383-.278l-.933-2.69a.415.415,0,0,0-.786.007L8.427,7.8a.414.414,0,0,1-.386.286" transform="translate(14.276 14.445)" fill="#969696" />
  </svg>
);

const SeparateSvg = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="12 12 24 24">
    <g transform="translate(15.163 15.419)">
      <path d="M16.358,0H7.277A1.371,1.371,0,0,0,5.961,1.417V3.629H1.316A1.371,1.371,0,0,0,0,5.046V15.739a1.371,1.371,0,0,0,1.316,1.417H10.4v0a1.371,1.371,0,0,0,1.315-1.417V13.527h4.646v0a1.371,1.371,0,0,0,1.316-1.417V1.417A1.371,1.371,0,0,0,16.358,0m-.185,12.027H10.964a.753.753,0,0,0-.753.753v2.876H1.5V5.129H6.709a.753.753,0,0,0,.753-.753V1.5h8.712Z" fill="#5c5c5c" />
      <path d="M8.38,6.349c-.048-.122-.092-.244-.144-.364a.332.332,0,0,0-.4-.187.311.311,0,0,0-.247.372,3.351,3.351,0,0,0,.284.772.339.339,0,0,0,.442.155A.357.357,0,0,0,8.5,6.638a2.055,2.055,0,0,1-.115-.288" transform="translate(0 -0.319)" fill="#969696" />
      <path d="M8.38,6.349c-.048-.122-.092-.244-.144-.364a.332.332,0,0,0-.4-.187.311.311,0,0,0-.247.372,3.351,3.351,0,0,0,.284.772.339.339,0,0,0,.442.155A.357.357,0,0,0,8.5,6.638,2.055,2.055,0,0,1,8.38,6.349Z" transform="translate(0 -0.319)" fill="none" stroke="#969696" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.25" />
      <path d="M9.225,8.509a1.874,1.874,0,0,1,.137.414.33.33,0,0,1-.274.348.293.293,0,0,1-.341-.15,2.909,2.909,0,0,1-.313-.8.334.334,0,0,1,.223-.366.357.357,0,0,1,.422.187c.05.112.09.228.146.37" transform="translate(0.118 -0.018)" fill="#969696" />
      <path d="M9.225,8.509a1.874,1.874,0,0,1,.137.414.33.33,0,0,1-.274.348.293.293,0,0,1-.341-.15,2.909,2.909,0,0,1-.313-.8.334.334,0,0,1,.223-.366.357.357,0,0,1,.422.187C9.129,8.25,9.169,8.367,9.225,8.509Z" transform="translate(0.118 -0.018)" fill="none" stroke="#969696" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.25" />
      <path d="M10.054,10.626c.043.111.088.221.13.333a.334.334,0,0,1-.527.378.407.407,0,0,1-.145-.195c-.065-.177-.144-.349-.2-.527a.385.385,0,0,1,.044-.431.348.348,0,0,1,.565.1c.048.113.09.228.135.343" transform="translate(0.235 0.282)" fill="#969696" />
      <path d="M10.054,10.626c.043.111.088.221.13.333a.334.334,0,0,1-.527.378.407.407,0,0,1-.145-.195c-.065-.177-.144-.349-.2-.527a.385.385,0,0,1,.044-.431.348.348,0,0,1,.565.1C9.967,10.4,10.009,10.511,10.054,10.626Z" transform="translate(0.235 0.282)" fill="none" stroke="#969696" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.25" />
    </g>
  </svg>
);

const DivideSvg = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="12 12 24 24">
    <g transform="translate(15.016 14.568)">
      <line x2="17.967" transform="translate(0 9.432)" fill="none" stroke="#969696" strokeLinecap="round" strokeWidth="2" />
      <path d="M8.993,5.584a2.342,2.342,0,1,1,2.342-2.342A2.345,2.345,0,0,1,8.993,5.584" transform="translate(-0.044 0.108)" fill="#fff" />
      <path d="M9.1,2.015A1.334,1.334,0,1,0,10.437,3.35,1.337,1.337,0,0,0,9.1,2.015M9.1,0a3.349,3.349,0,1,1-3.35,3.35A3.35,3.35,0,0,1,9.1,0" transform="translate(-0.152)" fill="#5c5c5c" />
      <path d="M9.024,16.449a2.342,2.342,0,1,1,2.342-2.342,2.345,2.345,0,0,1-2.342,2.342" transform="translate(-0.04 1.408)" fill="#fff" />
      <path d="M9.132,12.879a1.334,1.334,0,1,0,1.335,1.335,1.337,1.337,0,0,0-1.335-1.335m0-2.015a3.349,3.349,0,1,1-3.35,3.35,3.35,3.35,0,0,1,3.35-3.35" transform="translate(-0.148 1.3)" fill="#5c5c5c" />
    </g>
  </svg>
);

const SimplifySvg = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="12 12 24 24">
    <ellipse cx="1.515" cy="1.515" rx="1.515" ry="1.515" transform="translate(14.021 30.959)" fill="none" stroke="#484949" strokeMiterlimit="10" strokeWidth="1.5" />
    <ellipse cx="1.478" cy="1.478" rx="1.478" ry="1.478" transform="translate(30.948 30.996)" fill="none" stroke="#484949" strokeMiterlimit="10" strokeWidth="1.5" />
    <ellipse cx="1.478" cy="1.478" rx="1.478" ry="1.478" transform="translate(30.986 16.966) rotate(-90)" fill="none" stroke="#484949" strokeMiterlimit="10" strokeWidth="1.5" />
    <ellipse cx="1.478" cy="1.478" rx="1.478" ry="1.478" transform="translate(25.052 17.004) rotate(180)" fill="none" stroke="#bcbcbc" strokeMiterlimit="10" strokeWidth="1.5" />
    <ellipse cx="1.515" cy="1.515" rx="1.515" ry="1.515" transform="translate(30.948 33.894) rotate(-90)" fill="none" stroke="#484949" strokeMiterlimit="10" strokeWidth="1.5" />
    <ellipse cx="1.478" cy="1.478" rx="1.478" ry="1.478" transform="translate(17.052 17.004) rotate(180)" fill="none" stroke="#969696" strokeMiterlimit="10" strokeWidth="1.5" />
    <ellipse cx="1.478" cy="1.478" rx="1.478" ry="1.478" transform="translate(25.052 17.004) rotate(180)" fill="none" stroke="#969696" strokeMiterlimit="10" strokeWidth="1.5" />
    <ellipse cx="1.515" cy="1.515" rx="1.515" ry="1.515" transform="translate(17.052 14.106) rotate(90)" fill="none" stroke="#484949" strokeMiterlimit="10" strokeWidth="1.5" />
    <ellipse cx="1.478" cy="1.478" rx="1.478" ry="1.478" transform="translate(17.052 25.526) rotate(180)" fill="none" stroke="#969696" strokeMiterlimit="10" strokeWidth="1.5" />
    <line x2="5.278" transform="translate(25.67 32.474)" fill="none" stroke="#484949" strokeMiterlimit="10" strokeWidth="1.5" />
    <line x2="13.448" transform="translate(17.052 32.474)" fill="none" stroke="#484949" strokeMiterlimit="10" strokeWidth="1.5" />
    <line y1="9.363" transform="translate(32.464 21.5)" fill="none" stroke="#484949" strokeMiterlimit="10" strokeWidth="1.5" />
    <line x2="5.278" transform="translate(32.464 22.244) rotate(-90)" fill="none" stroke="#484949" strokeMiterlimit="10" strokeWidth="1.5" />
    <line x2="5.241" transform="translate(30.948 15.526) rotate(180)" fill="none" stroke="#484949" strokeMiterlimit="10" strokeWidth="1.5" />
    <line x2="5.278" transform="translate(22.33 15.526) rotate(180)" fill="none" stroke="#484949" strokeMiterlimit="10" strokeWidth="1.5" />
    <line x2="5.241" transform="translate(15.536 17.137) rotate(90)" fill="none" stroke="#484949" strokeMiterlimit="10" strokeWidth="1.5" />
    <line x2="5.278" transform="translate(15.536 25.756) rotate(90)" fill="none" stroke="#484949" strokeMiterlimit="10" strokeWidth="1.5" />
  </svg>
);

const PathConnect = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="12 12 24 24">
    <g transform="translate(14.365 17.945)">
      <line x1="5.313" y2="6.127" transform="translate(7.005 2.992)" fill="none" stroke="#969696" strokeMiterlimit="10" strokeWidth="1.5" />
      <line x2="5.241" transform="translate(0.75 9.119)" fill="none" stroke="#969696" strokeLinecap="round" strokeMiterlimit="10" strokeWidth="1.5" />
      <path d="M7.507,11.384A2.264,2.264,0,1,1,9.772,9.12a2.267,2.267,0,0,1-2.265,2.264m0-3.029a.765.765,0,1,0,.765.765.766.766,0,0,0-.765-.765" fill="#5c5c5c" />
      <line x2="5.278" transform="translate(13.243 2.992)" fill="none" stroke="#969696" strokeLinecap="round" strokeMiterlimit="10" strokeWidth="1.5" />
      <path d="M7.005,11.211A2.092,2.092,0,1,1,9.1,9.119a2.094,2.094,0,0,1-2.092,2.092" fill="#fff" />
      <path d="M11.765,5.22a2.228,2.228,0,1,1,2.228-2.227A2.231,2.231,0,0,1,11.765,5.22m0-2.956a.728.728,0,1,0,.728.729.73.73,0,0,0-.728-.729" fill="#5c5c5c" />
      <path d="M7.005,7.928A1.192,1.192,0,1,0,8.2,9.12,1.194,1.194,0,0,0,7.005,7.928m0-1.8A2.992,2.992,0,1,1,4.013,9.12,2.992,2.992,0,0,1,7.005,6.128" fill="#5c5c5c" />
      <path d="M12.107,5.084A2.092,2.092,0,1,1,14.2,2.992a2.094,2.094,0,0,1-2.092,2.092" fill="#fff" />
      <path d="M12.107,1.8A1.192,1.192,0,1,0,13.3,2.992,1.194,1.194,0,0,0,12.107,1.8m0-1.8A2.991,2.991,0,1,1,9.115,2.992,2.992,2.992,0,0,1,12.107,0" fill="#5c5c5c" />
    </g>
  </svg>
);

const PathDisconnect = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="12 12 24 24">
    <g transform="translate(11.771 21.009)">
      <line x2="5.241" transform="translate(0.75 2.992)" fill="none" stroke="#969696" strokeLinecap="round" strokeMiterlimit="10" strokeWidth="1.5" />
      <path d="M7.507,5.256A2.265,2.265,0,1,1,9.772,2.991h0A2.267,2.267,0,0,1,7.507,5.256m0-3.029a.765.765,0,1,0,.765.765.765.765,0,0,0-.765-.765" fill="#5c5c5c" />
      <line x2="5.278" transform="translate(17.43 2.992)" fill="none" stroke="#969696" strokeLinecap="round" strokeMiterlimit="10" strokeWidth="1.5" />
      <path d="M14.95,5.22a2.228,2.228,0,1,1,2.23-2.227A2.229,2.229,0,0,1,14.95,5.22m0-2.956a.728.728,0,1,0,.728.729.728.728,0,0,0-.728-.729" transform="translate(1)" fill="#5c5c5c" />
      <path d="M7.005,5.083A2.092,2.092,0,1,1,9.1,2.991,2.092,2.092,0,0,1,7.005,5.083" fill="#fff" />
      <path d="M7.005,1.8A1.192,1.192,0,1,0,8.2,2.992,1.192,1.192,0,0,0,7.005,1.8m0-1.8A2.991,2.991,0,1,1,4.013,2.992,2.991,2.991,0,0,1,7.005,0" fill="#5c5c5c" />
      <path d="M15.293,5.083a2.092,2.092,0,1,1,2.092-2.092,2.092,2.092,0,0,1-2.092,2.092" transform="translate(1)" fill="#fff" />
      <path d="M15.293,1.8a1.192,1.192,0,1,0,1.192,1.192A1.192,1.192,0,0,0,15.293,1.8m0-1.8A2.991,2.991,0,1,1,12.3,2.992,2.991,2.991,0,0,1,15.293,0" transform="translate(1)" fill="#5c5c5c" />
    </g>
  </svg>
);

const PathRound = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="12 12 24 24">
    <g transform="translate(15.227 19.571)">
      <path d="M.75,8.108A8.964,8.964,0,0,1,8.714,2.992,8.738,8.738,0,0,1,16.8,8.108" fill="none" stroke="#969696" strokeLinecap="round" strokeWidth="1.5" />
      <path d="M8.714,5.083a2.092,2.092,0,1,1,2.092-2.092A2.094,2.094,0,0,1,8.714,5.083" fill="#fff" />
      <path d="M8.714,1.8A1.192,1.192,0,1,0,9.906,2.992,1.194,1.194,0,0,0,8.714,1.8m0-1.8A2.991,2.991,0,1,1,5.722,2.992,2.992,2.992,0,0,1,8.714,0" fill="#5c5c5c" />
    </g>
  </svg>
);

const PathSharp = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="12 12 24 24">
    <g transform="translate(15.227 19.571)">
      <path d="M.75,8.108,8.714,2.992,16.8,8.108" fill="none" stroke="#969696" strokeLinecap="round" strokeWidth="1.5" />
      <path d="M8.714,5.083a2.092,2.092,0,1,1,2.092-2.092A2.094,2.094,0,0,1,8.714,5.083" fill="#fff" />
      <path d="M8.714,1.8A1.192,1.192,0,1,0,9.906,2.992,1.194,1.194,0,0,0,8.714,1.8m0-1.8A2.991,2.991,0,1,1,5.722,2.992,2.992,2.992,0,0,1,8.714,0" fill="#5c5c5c" />
    </g>
  </svg>
);

const Undo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" width="1em" height="1em" viewBox="0 0 20 20">
    <g id="redo">
      <g id="Group_156" data-name="Group 156" transform="translate(-167.113 -176.315)">
        <g id="Group_155" data-name="Group 155" transform="translate(172.046 181.079)">
          <path fill="#5c5c5c" id="Path_612" data-name="Path 612" d="M350.732,179.149h4.789l-2.938-2.468a.308.308,0,1,1,.331-.52l3.861,3.056a.308.308,0,0,1,0,.52l-3.861,3.056a.308.308,0,1,1-.331-.52l2.938-2.468h-4.788a2.83,2.83,0,0,0,0,5.659h2.2a.328.328,0,1,1,0,.656h-2.2a3.485,3.485,0,0,1,0-6.971Z" transform="translate(-347.015 -175.881)" fill="#fff"/>
          <path fill="#5c5c5c" id="Path_613" data-name="Path 613" d="M351.162,184.584h-2.2a3.718,3.718,0,0,1,0-7.435h4.151l-2.44-2.05a.54.54,0,0,1-.152-.737.542.542,0,0,1,.746-.166l.02.014,3.853,3.05a.54.54,0,0,1,0,.9l-3.874,3.064a.541.541,0,0,1-.745-.166.54.54,0,0,1,.152-.737l2.44-2.05h-4.151a2.6,2.6,0,0,0,0,5.2h2.2a.56.56,0,1,1,0,1.12Zm-2.2-6.971a3.253,3.253,0,1,0,0,6.507h2.2a.1.1,0,1,0,0-.192h-2.2a3.062,3.062,0,0,1,0-6.123h5.426l-3.451,2.9a.077.077,0,0,0-.034.048.074.074,0,0,0,.01.057.078.078,0,0,0,.1.027l3.868-3.059a.076.076,0,0,0,0-.129l-.019-.013-3.849-3.046a.078.078,0,0,0-.1.027.074.074,0,0,0-.01.057.077.077,0,0,0,.034.048l.025.018,3.426,2.878Z" transform="translate(-345.246 -174.112)"/>
        </g>
      </g>
    </g>
  </svg>
);

const Redo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" width="1em" height="1em" viewBox="0 0 20 20">
    <g id="Undo">
      <g id="Group_157" data-name="Group 157" transform="translate(4.932 4.764)">
        <path fill="#5c5c5c" id="Path_610" data-name="Path 610" d="M156.367,175.352h-4.789l2.938-2.468a.308.308,0,1,0-.331-.52l-3.861,3.056a.308.308,0,0,0,0,.52L154.185,179a.308.308,0,1,0,.331-.52l-2.938-2.468h4.788a2.829,2.829,0,1,1,0,5.659h-2.2a.328.328,0,1,0,0,.656h2.2a3.485,3.485,0,0,0,0-6.971Z" transform="translate(-149.949 -172.084)" fill="#fff"/>
        <path fill="#5c5c5c" id="Path_611" data-name="Path 611" d="M154.6,180.786h-2.2a.56.56,0,0,1,0-1.12h2.2a2.6,2.6,0,0,0,0-5.195h-4.151l2.44,2.05a.54.54,0,0,1-.594.9l-.021-.014-3.854-3.05a.54.54,0,0,1,0-.9l3.873-3.064a.542.542,0,0,1,.746.166.54.54,0,0,1-.152.737l-2.44,2.05H154.6a3.718,3.718,0,1,1,0,7.435Zm-2.2-.656a.1.1,0,0,0,0,.192h2.2a3.253,3.253,0,1,0,0-6.507h-5.426l3.451-2.9a.076.076,0,0,0,.034-.048.074.074,0,0,0-.01-.057.079.079,0,0,0-.1-.027l-3.868,3.06a.076.076,0,0,0,0,.129l.019.014,3.849,3.046a.078.078,0,0,0,.1-.027.074.074,0,0,0,.01-.056.076.076,0,0,0-.034-.048l-.025-.018-3.426-2.878H154.6a3.062,3.062,0,0,1,0,6.123Z" transform="translate(-148.181 -170.315)" />
      </g>
    </g>
  </svg>
);

const Trash = () => (
  <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" width="32" height="32" viewBox="0 0 32 32">
    <defs>
      <clipPath id="clip-icon-trash">
        <rect width="32" height="32" />
      </clipPath>
    </defs>
    <g id="icon-trash" clipPath="url(#clip-icon-trash)">
      <g id="Group_44" data-name="Group 44" transform="translate(-703.447 -218.136)">
        <path id="Path_94" data-name="Path 94" d="M727.279,226.981l-4.726-.011v-1.236a1.6,1.6,0,0,0-1.6-1.6h-3.121a1.6,1.6,0,0,0-1.6,1.6v.474c0,.241-.006.544-.013.755l-4.606.016a.671.671,0,0,0-.669.669v.235a.671.671,0,0,0,.669.669h15.664a.67.67,0,0,0,.669-.669v-.236A.671.671,0,0,0,727.279,226.981ZM721,225.891v.883a.187.187,0,0,1-.186.187h-2.748a.187.187,0,0,1-.187-.187v-.883a.187.187,0,0,1,.187-.187h2.748A.187.187,0,0,1,721,225.891Z" transform="translate(0 0)" fill="#5c5c5c"/>
        <path id="Path_95" data-name="Path 95" d="M725.553,228.71l-.591-.052a.439.439,0,0,0-.314.1.416.416,0,0,0-.138.206L723.387,241.5c-.05.792-.415.792-.535.792l-7.1.021c-.4-.031-.445-.7-.446-.717l-1.15-12.506A.429.429,0,0,0,714,228.8a.4.4,0,0,0-.319-.1l-.592.053a.425.425,0,0,0-.293.148.433.433,0,0,0-.1.319l1.156,13.064a1.494,1.494,0,0,0,1.444,1.529l8.045-.034a1.214,1.214,0,0,0,.844-.281,2.02,2.02,0,0,0,.619-1.461l1.137-12.851A.434.434,0,0,0,725.553,228.71Z" transform="translate(0.128 0.329)" fill="#5c5c5c" />
        <path id="Path_96" data-name="Path 96" d="M717.029,240.539a.536.536,0,0,0,.073,0,.642.642,0,0,0,.567-.711l-1.051-9.251a.643.643,0,1,0-1.278.144l1.05,9.251A.644.644,0,0,0,717.029,240.539Z" transform="translate(0.32 0.427)" fill="#5c5c5c"/>
        <path id="Path_97" data-name="Path 97" d="M719.632,239.895v-9.251a.643.643,0,1,0-1.286,0v9.251a.643.643,0,1,0,1.286,0Z" transform="translate(0.539 0.427)" fill="#5c5c5c"/>
        <path id="Path_98" data-name="Path 98" d="M721.017,240.539a.643.643,0,0,0,.639-.582l.891-9.251a.646.646,0,0,0-.579-.7.653.653,0,0,0-.7.579l-.89,9.251a.645.645,0,0,0,.579.7Z" transform="translate(0.687 0.427)" fill="#5c5c5c"/>
      </g>
    </g>
  </svg>
);

const Camera = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 21 16">
    <path d="M8.19 0c-.607 0-1.161.342-1.432.884l-.316.632c-.271.541-.825.884-1.431.884H1.6C.716 2.4 0 3.116 0 4v10.4c0 .884.716 1.6 1.6 1.6h17.6c.884 0 1.6-.716 1.6-1.6V4c0-.884-.716-1.6-1.6-1.6h-3.41c-.607 0-1.161-.342-1.432-.884l-.316-.632C13.771.343 13.217 0 12.611 0H8.189zM3.2.8c-.442 0-.8.358-.8.8h2.4c0-.442-.358-.8-.8-.8h-.8zm7.2 2.4c3.088 0 5.6 2.512 5.6 5.6 0 3.088-2.512 5.6-5.6 5.6-3.088 0-5.6-2.512-5.6-5.6 0-3.088 2.512-5.6 5.6-5.6zm7.2.8c.442 0 .8.358.8.8 0 .442-.358.8-.8.8-.442 0-.8-.358-.8-.8 0-.442.358-.8.8-.8zm-7.2.8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z" fill="#5c5c5c" />
  </svg>
);

const commonStyle = { marginRight: '0.2em' };

export const CropIcon = (props: Partial<CustomIconComponentProps>): JSX.Element => (
  <Icon component={CropSvg} style={commonStyle} {...props} />
);

export const GrayscaleIcon = (props: Partial<CustomIconComponentProps>): JSX.Element => (
  <Icon component={GraycaleSvg} style={commonStyle} {...props} />
);

export const InvertIcon = (props: Partial<CustomIconComponentProps>): JSX.Element => (
  <Icon component={InvertSvg} style={commonStyle} {...props} />
);

export const ArrayIcon = (props: Partial<CustomIconComponentProps>): JSX.Element => (
  <Icon component={ArraySvg} style={commonStyle} {...props} />
);

export const SharpenIcon = (props: Partial<CustomIconComponentProps>): JSX.Element => (
  <Icon component={SharpenSvg} style={commonStyle} {...props} />
);

export const BevelIcon = (props: Partial<CustomIconComponentProps>): JSX.Element => (
  <Icon component={BevelSvg} style={commonStyle} {...props} />
);

export const TraceIcon = (props: Partial<CustomIconComponentProps>): JSX.Element => (
  <Icon component={TraceSvg} style={commonStyle} {...props} />
);

export const ReplaceIcon = (props: Partial<CustomIconComponentProps>): JSX.Element => (
  <Icon component={ReplaceSvg} style={commonStyle} {...props} />
);

export const PenIcon = (props: Partial<CustomIconComponentProps>): JSX.Element => (
  <Icon component={PenSvg} style={commonStyle} {...props} />
);

export const OffsetIcon = (props: Partial<CustomIconComponentProps>): JSX.Element => (
  <Icon component={OffsetSvg} style={commonStyle} {...props} />
);

export const SeparateIcon = (props: Partial<CustomIconComponentProps>): JSX.Element => (
  <Icon component={SeparateSvg} style={commonStyle} {...props} />
);

export const DivideIcon = (props: Partial<CustomIconComponentProps>): JSX.Element => (
  <Icon component={DivideSvg} style={commonStyle} {...props} />
);

export const SimplifyIcon = (props: Partial<CustomIconComponentProps>): JSX.Element => (
  <Icon component={SimplifySvg} style={commonStyle} {...props} />
);

export const PathConnectIcon = (props: Partial<CustomIconComponentProps>): JSX.Element => (
  <Icon component={PathConnect} style={commonStyle} {...props} />
);

export const PathDisconnectIcon = (props: Partial<CustomIconComponentProps>): JSX.Element => (
  <Icon component={PathDisconnect} style={commonStyle} {...props} />
);

export const PathRoundIcon = (props: Partial<CustomIconComponentProps>): JSX.Element => (
  <Icon component={PathRound} style={commonStyle} {...props} />
);

export const PathSharpIcon = (props: Partial<CustomIconComponentProps>): JSX.Element => (
  <Icon component={PathSharp} style={commonStyle} {...props} />
);

export const UndoIcon = (props: Partial<CustomIconComponentProps>): JSX.Element => (
  <Icon component={Undo} style={commonStyle} {...props} />
);

export const RedoIcon = (props: Partial<CustomIconComponentProps>): JSX.Element => (
  <Icon component={Redo} style={commonStyle} {...props} />
);

export const TrashIcon = (props: Partial<CustomIconComponentProps>): JSX.Element => (
  <Icon component={Trash} style={commonStyle} {...props} />
);

export const CameraIcon = (props: Partial<CustomIconComponentProps>): JSX.Element => (
  <Icon component={Camera} style={commonStyle} {...props} />
);
