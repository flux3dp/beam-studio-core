import { WebFont } from 'interfaces/IFont';

const fonts: WebFont[] = [
  // Passengers Script
  {
    family: 'passengers script',
    italic: false,
    postscriptName: 'PassengersScript-Regular',
    style: 'Regular',
    weight: 400,
    fileName: 'PassengersScript.ttf',
    supportLangs: ['en', 'es', 'de'],
  },
  // Carlito
  {
    family: 'carlito',
    italic: false,
    postscriptName: 'Carlito-Regular',
    style: 'Regular',
    weight: 400,
    fileName: 'Carlito-Regular.ttf',
    supportLangs: ['en', 'es', 'de'],
  },
  {
    family: 'Carlito',
    italic: true,
    postscriptName: 'Carlito-Italic',
    style: 'Italic',
    weight: 400,
    fileName: 'Carlito-Italic.ttf',
    supportLangs: ['en', 'es', 'de'],
  },
  {
    family: 'Carlito',
    italic: false,
    postscriptName: 'Carlito-Bold',
    style: 'Bold',
    weight: 700,
    fileName: 'Carlito-Bold.ttf',
    supportLangs: ['en', 'es', 'de'],
  },
  {
    family: 'Carlito',
    italic: true,
    postscriptName: 'Carlito-BoldItalic',
    style: 'Bold Italic',
    weight: 700,
    fileName: 'Carlito-BoldItalic.ttf',
    supportLangs: ['en', 'es', 'de'],
  },
  // Arrow
  {
    family: 'arrow',
    italic: false,
    postscriptName: 'ArrowSerif',
    style: 'Regular',
    weight: 400,
    fileName: 'Almo_Andrea_FontlabARROW.ttf',
    supportLangs: ['en', 'es', 'de'],
  },
  // Chanticleer Roman NF
  {
    family: 'ChanticleerRomanNF',
    italic: false,
    postscriptName: 'ChanticleerRomanNF-Regular',
    style: 'Regular',
    weight: 400,
    fileName: 'ChanticleerRomanNF.ttf',
    supportLangs: ['en', 'es', 'de'],
  },
  {
    family: 'ChanticleerRomanNF',
    italic: false,
    postscriptName: 'ChanticleerRomanNF-Bold',
    style: 'Bold',
    weight: 700,
    fileName: 'ChanticleerRomanNF-Bold.ttf',
    supportLangs: ['en', 'es', 'de'],
  },
  // Alegreya
  {
    family: 'Alegreya',
    italic: false,
    postscriptName: 'Alegreya-Regular',
    style: 'Regular',
    weight: 400,
    fileName: 'Alegreya-Regular.otf',
    supportLangs: ['en', 'es', 'de'],
  },
  {
    family: 'Alegreya',
    italic: true,
    postscriptName: 'Alegreya-Italic',
    style: 'Italic',
    weight: 400,
    fileName: 'Alegreya-Italic.otf',
    supportLangs: ['en', 'es', 'de'],
  },
  {
    family: 'Alegreya',
    italic: false,
    postscriptName: 'Alegreya-Bold',
    style: 'Bold',
    weight: 700,
    fileName: 'Alegreya-Bold.otf',
    supportLangs: ['en', 'es', 'de'],
  },
  {
    family: 'Alegreya',
    italic: true,
    postscriptName: 'Alegreya-BoldItalic',
    style: 'Bold Italic',
    weight: 700,
    fileName: 'Alegreya-BoldItalic.otf',
    supportLangs: ['en', 'es', 'de'],
  },
  // AlegreyaSC
  {
    family: 'Alegreya SC',
    italic: false,
    postscriptName: 'AlegreyaSC-Regular',
    style: 'Regular',
    weight: 400,
    fileName: 'AlegreyaSC-Regular.otf',
    supportLangs: ['en', 'es', 'de'],
  },
  {
    family: 'Alegreya SC',
    italic: true,
    postscriptName: 'AlegreyaSC-Italic',
    style: 'Italic',
    weight: 400,
    fileName: 'AlegreyaSC-Italic.otf',
    supportLangs: ['en', 'es', 'de'],
  },
  {
    family: 'Alegreya SC',
    italic: false,
    postscriptName: 'AlegreyaSC-Bold',
    style: 'Bold',
    weight: 700,
    fileName: 'AlegreyaSC-Bold.otf',
    supportLangs: ['en', 'es', 'de'],
  },
  {
    family: 'Alegreya SC',
    italic: true,
    postscriptName: 'AlegreyaSC-BoldItalic',
    style: 'Bold Italic',
    weight: 700,
    fileName: 'AlegreyaSC-BoldItalic.otf',
    supportLangs: ['en', 'es', 'de'],
  },
  // Amethysta
  {
    family: 'amethysta',
    italic: false,
    postscriptName: 'Amethysta-Regular',
    style: 'Regular',
    weight: 400,
    fileName: 'Amethysta-Regular.ttf',
    supportLangs: ['en', 'es', 'de'],
  },
  // Old Standard TT
  {
    family: 'old standard TT',
    italic: false,
    postscriptName: 'OldStandard-Regular',
    style: 'Regular',
    weight: 400,
    fileName: 'OldStandard-Regular.ttf',
    supportLangs: ['en', 'es', 'de'],
  },
  {
    family: 'old standard TT',
    italic: true,
    postscriptName: 'OldStandard-Italic',
    style: 'Italic',
    weight: 400,
    fileName: 'OldStandard-Italic.ttf',
    supportLangs: ['en', 'es', 'de'],
  },
  {
    family: 'old standard TT',
    italic: false,
    postscriptName: 'OldStandard-Bold',
    style: 'Bold',
    weight: 700,
    fileName: 'OldStandard-Bold.ttf',
    supportLangs: ['en', 'es', 'de'],
  },
  // Lavigne
  {
    family: 'lavigne',
    italic: false,
    postscriptName: 'Lavigne-Regular',
    style: 'Regular',
    weight: 400,
    fileName: 'Lavigne.ttf',
    supportLangs: ['en', 'es', 'de'],
  },
  // FatCow
  {
    family: 'fatcow',
    italic: false,
    postscriptName: 'FatCow-Regular',
    style: 'Regular',
    weight: 400,
    fileName: 'FatCow.ttf',
    supportLangs: ['en', 'es', 'de'],
  },
  {
    family: 'fatcow',
    italic: true,
    postscriptName: 'FatCow-Italic',
    style: 'Italic',
    weight: 400,
    fileName: 'FatCow-Italic.ttf',
    supportLangs: ['en', 'es', 'de'],
  },
  // Modern Sans
  {
    family: 'Modern Sans',
    italic: false,
    postscriptName: 'Modern Sans-Light',
    style: 'Regular',
    weight: 400,
    fileName: 'ModernSans-Light.otf',
    supportLangs: ['en', 'es', 'de'],
  },
  // Phantomonia
  {
    family: 'phantomonia',
    italic: false,
    postscriptName: 'Phantomonia-Regular',
    style: 'Regular',
    weight: 400,
    fileName: 'Phantomonia.ttf',
    supportLangs: ['en', 'es', 'de'],
  },
  // Kong Quest
  {
    family: 'kong quest',
    italic: false,
    postscriptName: 'Kong Quest-Regular',
    style: 'Regular',
    weight: 400,
    fileName: 'KongQuest-Regular.otf',
    supportLangs: ['en', 'es', 'de'],
  },
  // Plexifont BV
  {
    family: 'plexifont bv',
    italic: false,
    postscriptName: 'Plexifont BV-Regular',
    style: 'Regular',
    weight: 400,
    fileName: 'plexifont.ttf',
    supportLangs: ['en', 'es', 'de'],
  },
  // Oldies Cartoon
  {
    family: 'Oldies Cartoon',
    italic: false,
    postscriptName: 'Oldies Cartoon-Medium',
    style: 'Regular',
    weight: 400,
    fileName: 'oldies cartoon.ttf',
    supportLangs: ['en', 'es', 'de'],
  },
  // Don Graffiti
  {
    family: 'Don Graffiti',
    italic: false,
    postscriptName: 'Don Graffiti-Regular',
    style: 'Regular',
    weight: 400,
    fileName: 'DonGraffiti.otf',
    supportLangs: ['en', 'es', 'de'],
  },
  // Eddie
  {
    family: 'Eddie',
    italic: false,
    postscriptName: 'Eddie-Regular',
    style: 'Regular',
    weight: 400,
    fileName: 'eddie.ttf',
    supportLangs: ['en', 'es', 'de'],
  },
  // Shagadelic
  {
    family: 'shagadelic',
    italic: false,
    postscriptName: 'Shagadelic-Bold',
    style: 'Bold',
    weight: 700,
    fileName: 'shagade.ttf',
    supportLangs: ['en', 'es', 'de'],
  },
  // Fanzine
  {
    family: 'fanzine',
    italic: false,
    postscriptName: 'Fanzine-Regular',
    style: 'Regular',
    weight: 400,
    fileName: 'fanzine.ttf',
    supportLangs: ['en', 'es', 'de'],
  },
  // Impact Label
  {
    family: 'ImpactLabel',
    italic: false,
    postscriptName: 'Impact Label-Regular',
    style: 'Regular',
    weight: 400,
    fileName: 'Impact_Label.ttf',
    supportLangs: ['en', 'es', 'de'],
  },
  // Impact Label Reversed
  {
    family: 'Impact Label Reversed',
    italic: false,
    postscriptName: 'Impact Label Reversed-Regular',
    style: 'Regular',
    weight: 400,
    fileName: 'Impact_Label_Reversed.ttf',
    supportLangs: ['en', 'es', 'de'],
  },
  // Mr Bedfort
  {
    family: 'Mr Bedfort',
    italic: false,
    postscriptName: 'Mr Bedfort-Regular',
    style: 'Regular',
    weight: 400,
    fileName: 'MrBedfort-Regular.ttf',
    supportLangs: ['en', 'es', 'de'],
  },
  // Allura
  {
    family: 'allura',
    italic: false,
    postscriptName: 'Allura-Regular',
    style: 'Regular',
    weight: 400,
    fileName: 'Allura-Regular.otf',
    supportLangs: ['en', 'es', 'de'],
  },
  // Cedarville-Cursive
  {
    family: 'CedarvilleCursive',
    italic: false,
    postscriptName: 'CedarvilleCursive-Regular',
    style: 'Regular',
    weight: 400,
    fileName: 'Cedarville-Cursive.ttf',
    supportLangs: ['en', 'es', 'de'],
  },
  // Robert
  {
    family: 'robert',
    italic: false,
    postscriptName: 'Robert-Regular',
    style: 'Regular',
    weight: 400,
    fileName: 'Robert.ttf',
    supportLangs: ['en', 'es', 'de'],
  },
  // Rhesmanisa
  {
    family: 'Rhesmanisa',
    italic: false,
    postscriptName: 'Rhesmanisa-Regular',
    style: 'Regular',
    weight: 400,
    fileName: 'Rhesmanisa.otf',
    supportLangs: ['en', 'es', 'de'],
  },
  // Flanella
  {
    family: 'Flanella',
    italic: false,
    postscriptName: 'Flanella-Regular',
    style: 'Regular',
    weight: 400,
    fileName: 'Flanella.ttf',
    supportLangs: ['en', 'es', 'de'],
  },
  // Radicalis
  {
    family: 'Radicalis',
    italic: false,
    postscriptName: 'Radicalis-Regular',
    style: 'Regular',
    weight: 400,
    fileName: 'Radicalis.ttf',
    supportLangs: ['en', 'es', 'de'],
  },
  // Raustila
  {
    family: 'raustila',
    italic: false,
    postscriptName: 'Raustila-Regular',
    style: 'Regular',
    weight: 400,
    fileName: 'raustila-Regular.ttf',
    supportLangs: ['en', 'es', 'de'],
  },
  // Lemon Tuesday
  {
    family: 'lemon tuesday',
    italic: false,
    postscriptName: 'LemonTuesday-Regular',
    style: 'Regular',
    weight: 400,
    fileName: 'LemonTuesday.otf',
    supportLangs: ['en', 'es', 'de'],
  },
  // Nickainley
  {
    family: 'nickainley',
    italic: false,
    postscriptName: 'Nickainley-Regular',
    style: 'Regular',
    weight: 400,
    fileName: 'Nickainley-Normal.ttf',
    supportLangs: ['en', 'es', 'de'],
  },
  // Volaroid Sans
  {
    family: 'volaroid Sans',
    italic: false,
    postscriptName: 'Volaroid Sans-Regular',
    style: 'Regular',
    weight: 400,
    fileName: 'Volaroid-sans.otf',
    supportLangs: ['en', 'es', 'de'],
  },
  // Volaroid Script
  {
    family: 'VolaroidScript',
    italic: false,
    postscriptName: 'Volaroid Script-Regular',
    style: 'Regular',
    weight: 400,
    fileName: 'Volaroid-Script.ttf',
    supportLangs: ['en', 'es', 'de'],
  },
  // Grenadier NF
  {
    family: 'Grenadier NF',
    italic: false,
    postscriptName: 'Grenadier NF-Regular',
    style: 'Regular',
    weight: 400,
    fileName: 'GrenadierNF.ttf',
    supportLangs: ['en', 'es', 'de'],
  },
  // Airstream NF
  {
    family: 'AirstreamNF',
    italic: false,
    postscriptName: 'Airstream NF-Regular',
    style: 'Regular',
    weight: 400,
    fileName: 'AirstreamNF.ttf',
    supportLangs: ['en', 'es', 'de'],
  },
  // Life Savers
  {
    family: 'life savers',
    italic: false,
    postscriptName: 'LifeSavers-Regular',
    style: 'Regular',
    weight: 400,
    fileName: 'LifeSavers-Regular.ttf',
    supportLangs: ['en', 'es', 'de'],
  },
  {
    family: 'life savers',
    italic: false,
    postscriptName: 'LifeSavers-Bold',
    style: 'Bold',
    weight: 700,
    fileName: 'LifeSavers-Bold.ttf',
    supportLangs: ['en', 'es', 'de'],
  },
  // Dymaxion Script
  {
    family: 'dymaxionscript',
    italic: false,
    postscriptName: 'DymaxionScript-Regular',
    style: 'Regular',
    weight: 400,
    fileName: 'DymaxionScript.ttf',
    supportLangs: ['en', 'es', 'de'],
  },
  // Riesling
  {
    family: 'Riesling',
    italic: false,
    postscriptName: 'Riesling-Regular',
    style: 'Regular',
    weight: 400,
    fileName: 'riesling.ttf',
    supportLangs: ['en', 'es', 'de'],
  },
  // Carnivalee Freakshow
  {
    family: 'Carnivalee Freakshow',
    italic: false,
    postscriptName: 'CarnivaleeFreakshow-Regular',
    style: 'Regular',
    weight: 400,
    fileName: 'CarnevaleeFreakshow.ttf',
    supportLangs: ['en', 'es', 'de'],
  },
  // Park Lane NF
  {
    family: 'Park Lane NF',
    italic: false,
    postscriptName: 'Park Lane NF-Regular',
    style: 'Regular',
    weight: 400,
    fileName: 'ParkLaneNF.ttf',
    supportLangs: ['en', 'es', 'de'],
  },
  // True Crimes
  {
    family: 'True Crimes',
    italic: false,
    postscriptName: 'True Crimes-Regular',
    style: 'Regular',
    weight: 400,
    fileName: 'true-crimes.ttf',
    supportLangs: ['en', 'es', 'de'],
  },
  // 楷書
  {
    family: 'TW-MOE-Std-Kai',
    italic: false,
    postscriptName: 'TW-MOE-Std-Kai',
    style: 'Regular',
    weight: 400,
    fileName: 'edukai-4.0.ttf',
    supportLangs: ['zh-tw'],
  },
  // GenYoGothic TW
  {
    family: 'GenYoGothic TW',
    italic: false,
    postscriptName: 'GenYoGothicTW-R',
    style: 'Regular',
    weight: 400,
    fileName: 'GenYoGothic-R.ttc',
    supportLangs: ['zh-tw'],
  },
  {
    family: 'GenYoGothic TW',
    italic: false,
    postscriptName: 'GenYoGothicTW-B',
    style: 'Bold',
    weight: 700,
    fileName: 'GenYoGothic-B.ttc',
    supportLangs: ['zh-tw'],
  },
  // GenYoGothic JP
  {
    family: 'GenYoGothic JP',
    italic: false,
    postscriptName: 'GenYoGothicJP-R',
    style: 'Regular',
    weight: 400,
    fileName: 'GenYoGothic-R.ttc',
    supportLangs: ['ja'],
  },
  {
    family: 'GenYoGothic JP',
    italic: false,
    postscriptName: 'GenYoGothicJP-B',
    style: 'Bold',
    weight: 700,
    fileName: 'GenYoGothic-B.ttc',
    supportLangs: ['ja'],
  },
  // GenRyuMin TW
  {
    family: 'GenRyuMin TW',
    italic: false,
    postscriptName: 'GenRyuMinTW-R',
    style: 'Regular',
    weight: 400,
    fileName: 'GenRyuMin-R.ttc',
    supportLangs: ['zh-tw'],
  },
  {
    family: 'GenRyuMin TW',
    italic: false,
    postscriptName: 'GenRyuMinTW-B',
    style: 'Bold',
    weight: 700,
    fileName: 'GenRyuMin-B.ttc',
    supportLangs: ['zh-tw'],
  },
  // GenRyuMin JP
  {
    family: 'GenRyuMin JP',
    italic: false,
    postscriptName: 'GenRyuMinJP-R',
    style: 'Regular',
    weight: 400,
    fileName: 'GenRyuMin-R.ttc',
    supportLangs: ['ja'],
  },
  {
    family: 'GenRyuMin JP',
    italic: false,
    postscriptName: 'GenRyuMinJP-B',
    style: 'Bold',
    weight: 700,
    fileName: 'GenRyuMin-B.ttc',
    supportLangs: ['ja'],
  },
  // GenWanMin TW
  {
    family: 'GenWanMin TW',
    italic: false,
    postscriptName: 'GenWanMinTW-R',
    style: 'Regular',
    weight: 400,
    fileName: 'GenWanMin-R.ttc',
    supportLangs: ['zh-tw'],
  },
  {
    family: 'GenWanMin TW',
    italic: false,
    postscriptName: 'GenWanMinTW-SB',
    style: 'Bold',
    weight: 700,
    fileName: 'GenWanMin-SB.ttc',
    supportLangs: ['zh-tw'],
  },
  // GenWanMin JP
  {
    family: 'GenWanMin JP',
    italic: false,
    postscriptName: 'GenWanMinJP-R',
    style: 'Regular',
    weight: 400,
    fileName: 'GenWanMin-R.ttc',
    supportLangs: ['ja'],
  },
  {
    family: 'GenWanMin JP',
    italic: false,
    postscriptName: 'GenWanMinJP-SB',
    style: 'Bold',
    weight: 700,
    fileName: 'GenWanMin-SB.ttc',
    supportLangs: ['ja'],
  },
  // GenSekiGothic TW
  {
    family: 'GenSekiGothic TW',
    italic: false,
    postscriptName: 'GenSekiGothicTW-R',
    style: 'Regular',
    weight: 400,
    fileName: 'GenSekiGothic-R.ttc',
    supportLangs: ['zh-tw'],
  },
  {
    family: 'GenSekiGothic TW',
    italic: false,
    postscriptName: 'GenSekiGothicTW-B',
    style: 'Bold',
    weight: 700,
    fileName: 'GenSekiGothic-B.ttc',
    supportLangs: ['zh-tw'],
  },
  // GenSekiGothic JP
  {
    family: 'GenSekiGothic JP',
    italic: false,
    postscriptName: 'GenSekiGothicJP-R',
    style: 'Regular',
    weight: 400,
    fileName: 'GenSekiGothic-R.ttc',
    supportLangs: ['ja'],
  },
  {
    family: 'GenSekiGothic JP',
    italic: false,
    postscriptName: 'GenSekiGothicJP-B',
    style: 'Bold',
    weight: 700,
    fileName: 'GenSekiGothic-B.ttc',
    supportLangs: ['ja'],
  },
  // GenSenRounded TW
  {
    family: 'GenSenRounded TW',
    italic: false,
    postscriptName: 'GenSenRoundedTW-R',
    style: 'Regular',
    weight: 400,
    fileName: 'GenSenRounded-R.ttc',
    supportLangs: ['zh-tw'],
  },
  {
    family: 'GenSenRounded TW',
    italic: false,
    postscriptName: 'GenSenRoundedTW-B',
    style: 'Bold',
    weight: 700,
    fileName: 'GenSenRounded-B.ttc',
    supportLangs: ['zh-tw'],
  },
  // GenSenRounded JP
  {
    family: 'GenSenRounded JP',
    italic: false,
    postscriptName: 'GenSenRoundedJP-R',
    style: 'Regular',
    weight: 400,
    fileName: 'GenSenRounded-R.ttc',
    supportLangs: ['ja'],
  },
  {
    family: 'GenSenRounded JP',
    italic: false,
    postscriptName: 'GenSenRoundedJP-B',
    style: 'Bold',
    weight: 700,
    fileName: 'GenSenRounded-B.ttc',
    supportLangs: ['ja'],
  },
  // Gen Shin Gothic
  {
    family: 'Gen Shin Gothic',
    italic: false,
    postscriptName: 'Gen Shin Gothic',
    style: 'Regular',
    weight: 400,
    fileName: 'GenShinGothic-Regular.ttf',
    supportLangs: ['ja', 'zh-tw'],
  },
  {
    family: 'Gen Shin Gothic',
    italic: false,
    postscriptName: 'Gen Shin Gothic Bold',
    style: 'Bold',
    weight: 700,
    fileName: 'GenShinGothic-Bold.ttf',
    supportLangs: ['ja', 'zh-tw'],
  },
  // Gen Shin Gothic P
  {
    family: 'Gen Shin Gothic P',
    italic: false,
    postscriptName: 'Gen Shin Gothic P',
    style: 'Regular',
    weight: 400,
    fileName: 'GenShinGothic-P-Regular.ttf',
    supportLangs: ['ja', 'zh-tw'],
  },
  {
    family: 'Gen Shin Gothic P',
    italic: false,
    postscriptName: 'Gen Shin Gothic P Bold',
    style: 'Bold',
    weight: 700,
    fileName: 'GenShinGothic-P-Bold.ttf',
    supportLangs: ['ja', 'zh-tw'],
  },
  // Gen Shin Gothic Monospace
  {
    family: 'Gen Shin Gothic Monospace',
    italic: false,
    postscriptName: 'Gen Shin Gothic Monospace',
    style: 'Regular',
    weight: 400,
    fileName: 'GenShinGothic-Monospace-Regular.ttf',
    supportLangs: ['ja', 'zh-tw'],
  },
  {
    family: 'Gen Shin Gothic Monospace',
    italic: false,
    postscriptName: 'Gen Shin Gothic Monospace Bold',
    style: 'Bold',
    weight: 700,
    fileName: 'GenShinGothic-Monospace-Bold.ttf',
    supportLangs: ['ja', 'zh-tw'],
  },
  // TaipeiSansTC
  {
    family: 'Taipei Sans TC Beta',
    italic: false,
    postscriptName: 'TaipeiSansTC-Regular',
    style: 'Regular',
    weight: 400,
    fileName: 'TaipeiSansTCBeta-Regular.ttf',
    supportLangs: ['zh-tw'],
  },
  {
    family: 'Taipei Sans TC Beta',
    italic: false,
    postscriptName: 'TaipeiSansTC-Bold',
    style: 'Bold',
    weight: 700,
    fileName: 'TaipeiSansTCBeta-Bold.ttf',
    supportLangs: ['zh-tw'],
  },
  // GenEi Gothic M
  {
    family: 'GenEi Gothic M',
    italic: false,
    postscriptName: 'GenEi Gothic M',
    style: 'Regular',
    weight: 400,
    fileName: 'GenEiGothicM-Regular.ttf',
    supportLangs: ['ja', 'zh-tw'],
  },
  {
    family: 'GenEi Gothic M',
    italic: false,
    postscriptName: 'GenEi Gothic M Bold',
    style: 'Bold',
    weight: 700,
    fileName: 'GenEiGothicM-Bold.ttf',
    supportLangs: ['ja', 'zh-tw'],
  },
  // Chiron Sans HK Pro
  {
    family: 'Chiron Sans HK Pro',
    italic: false,
    postscriptName: 'Chiron Sans HK Pro',
    style: 'Regular',
    weight: 400,
    fileName: 'ChironSansHKPro-Regular.otf',
    supportLangs: ['zh-tw'],
  },
  {
    family: 'Chiron Sans HK Pro',
    italic: false,
    postscriptName: 'Chiron Sans HK Pro-Bold',
    style: 'Bold',
    weight: 700,
    fileName: 'ChironSansHKPro-Bold.otf',
    supportLangs: ['zh-tw'],
  },
  {
    family: 'Chiron Sans HK Pro',
    italic: true,
    postscriptName: 'Chiron Sans HK Pro-Italic',
    style: 'Italic',
    weight: 400,
    fileName: 'ChironSansHKPro-Italic.otf',
    supportLangs: ['zh-tw'],
  },
  {
    family: 'Chiron Sans HK Pro',
    italic: true,
    postscriptName: 'Chiron Sans HK Pro-BoldIt',
    style: 'Bold Italic',
    weight: 700,
    fileName: 'ChironSansHKPro-BoldIt.otf',
    supportLangs: ['zh-tw'],
  },
  // Huayuan Gothic
  {
    family: 'Huayuan Gothic',
    italic: false,
    postscriptName: 'Huayuan Gothic',
    style: 'Regular',
    weight: 400,
    fileName: 'HuayuanGothic-Regular.ttf',
    supportLangs: ['zh-tw'],
  },
  {
    family: 'Huayuan Gothic',
    italic: false,
    postscriptName: 'Huayuan Gothic Bold',
    style: 'Bold',
    weight: 700,
    fileName: 'HuayuanGothic-Bold.ttf',
    supportLangs: ['zh-tw'],
  },
  // GlowSans TC
  {
    family: 'Glow Sans TC',
    italic: false,
    postscriptName: 'GlowSans TC',
    style: 'Regular',
    weight: 400,
    fileName: 'GlowSansTC-Normal-Regular.otf',
    supportLangs: ['zh-tw'],
  },
  {
    family: 'Glow Sans TC',
    italic: false,
    postscriptName: 'Glow Sans TC',
    style: 'Bold',
    weight: 700,
    fileName: 'GlowSansTC-Normal-Bold.otf',
    supportLangs: ['zh-tw'],
  },
  // GlowSans SC
  {
    family: 'GlowSans SC',
    italic: false,
    postscriptName: 'GlowSans SC',
    style: 'Regular',
    weight: 400,
    fileName: 'GlowSansSC-Normal-Regular.otf',
    supportLangs: ['zh-cn'],
  },
  {
    family: 'Glow Sans SC',
    italic: false,
    postscriptName: 'Glow Sans SC',
    style: 'Bold',
    weight: 700,
    fileName: 'GlowSansSC-Normal-Bold.otf',
    supportLangs: ['zh-cn'],
  },
  // Glow Sans J
  {
    family: 'Glow Sans J',
    italic: false,
    postscriptName: 'GlowSans J',
    style: 'Regular',
    weight: 400,
    fileName: 'GlowSansJ-Normal-Regular.otf',
    supportLangs: ['ja'],
  },
  {
    family: 'Glow Sans J',
    italic: false,
    postscriptName: 'Glow Sans J',
    style: 'Bold',
    weight: 700,
    fileName: 'GlowSansJ-Normal-Bold.otf',
    supportLangs: ['ja'],
  },
  // 07TetsubinGothic
  {
    family: '07TetsubinGothic',
    italic: false,
    postscriptName: '07TetsubinGothic',
    style: 'Regular',
    weight: 400,
    fileName: '07TetsubinGothic.otf',
    supportLangs: ['ja', 'zh-tw'],
  },
  // M PLUS 1
  {
    family: 'M PLUS 1',
    italic: false,
    postscriptName: 'M PLUS 1',
    style: 'Regular',
    weight: 400,
    fileName: 'Mplus1-Regular.ttf',
    supportLangs: ['ja', 'zh-tw'],
  },
  {
    family: 'M PLUS 1',
    italic: false,
    postscriptName: 'M PLUS 1 Bold',
    style: 'Bold',
    weight: 700,
    fileName: 'Mplus1-Bold.ttf',
    supportLangs: ['ja', 'zh-tw'],
  },
  // M PLUS 2
  {
    family: 'M PLUS 2',
    italic: false,
    postscriptName: 'M PLUS 2',
    style: 'Regular',
    weight: 400,
    fileName: 'Mplus2-Regular.ttf',
    supportLangs: ['ja', 'zh-tw'],
  },
  {
    family: 'M PLUS 2',
    italic: false,
    postscriptName: 'M PLUS 2 Bold',
    style: 'Bold',
    weight: 700,
    fileName: 'Mplus2-Bold.ttf',
    supportLangs: ['ja', 'zh-tw'],
  },
  // M PLUS 1 Code
  {
    family: 'M PLUS 1 Code',
    italic: false,
    postscriptName: 'M PLUS 1 Code',
    style: 'Regular',
    weight: 400,
    fileName: 'Mplus1Code-Regular.ttf',
    supportLangs: ['ja', 'zh-tw'],
  },
  {
    family: 'M PLUS 1 Code',
    italic: false,
    postscriptName: 'M PLUS 1 Code Bold',
    style: 'Bold',
    weight: 700,
    fileName: 'Mplus1Code-Bold.ttf',
    supportLangs: ['ja', 'zh-tw'],
  },
  // M PLUS Code Latin
  {
    family: 'M PLUS Code Latin',
    italic: false,
    postscriptName: 'M PLUS Code Latin',
    style: 'Regular',
    weight: 400,
    fileName: 'MplusCodeLatin50-Regular.ttf',
    supportLangs: ['ja', 'zh-tw'],
  },
  {
    family: 'M PLUS Code Latin',
    italic: false,
    postscriptName: 'M PLUS Code Latin Bold',
    style: 'Bold',
    weight: 700,
    fileName: 'MplusCodeLatin50-Bold.ttf',
    supportLangs: ['ja', 'zh-tw'],
  },
  // Togalite
  {
    family: 'Togalite',
    italic: false,
    postscriptName: 'Togalite',
    style: 'Regular',
    weight: 400,
    fileName: 'Togalite-Regular.otf',
    supportLangs: ['ja', 'zh-tw'],
  },
  {
    family: 'Togalite',
    italic: false,
    postscriptName: 'Togalite Bold',
    style: 'Bold',
    weight: 700,
    fileName: 'Togalite-Bold.otf',
    supportLangs: ['ja', 'zh-tw'],
  },
  // Senobi Gothic
  {
    family: 'Senobi Gothic',
    italic: false,
    postscriptName: 'Senobi Gothic',
    style: 'Regular',
    weight: 400,
    fileName: 'Senobi-Gothic-Regular.ttf',
    supportLangs: ['ja', 'zh-tw'],
  },
  {
    family: 'Senobi Gothic',
    italic: false,
    postscriptName: 'Senobi Gothic Bold',
    style: 'Bold',
    weight: 700,
    fileName: 'Senobi-Gothic-Bold.ttf',
    supportLangs: ['ja', 'zh-tw'],
  },
  // Genkaimincho
  {
    family: 'Genkaimincho',
    italic: false,
    postscriptName: 'Genkaimincho',
    style: 'Regular',
    weight: 400,
    fileName: 'genkai-mincho.ttf',
    supportLangs: ['ja', 'zh-tw'],
  },
  // SoukouMincho
  {
    family: 'SoukouMincho',
    italic: false,
    postscriptName: 'SoukouMincho',
    style: 'Regular',
    weight: 400,
    fileName: 'SoukouMincho.ttf',
    supportLangs: ['ja', 'zh-tw'],
  },
  // Isego
  {
    family: 'Isego',
    italic: false,
    postscriptName: 'Isego',
    style: 'Regular',
    weight: 400,
    fileName: 'Isego.otf',
    supportLangs: ['ja', 'zh-tw'],
  },
  // Isemin
  {
    family: 'isemin',
    italic: false,
    postscriptName: 'Isemin',
    style: 'Regular',
    weight: 400,
    fileName: 'Isemin.otf',
    supportLangs: ['ja', 'zh-tw'],
  },
  // HanaMinPlus
  {
    family: 'HanaMinPlus',
    italic: false,
    postscriptName: 'HanaMinPlus',
    style: 'Regular',
    weight: 400,
    fileName: 'HanaMinPlus.ttf',
    supportLangs: ['ja', 'zh-tw'],
  },
  // IPAexMincho
  {
    family: 'IPAexMincho',
    italic: false,
    postscriptName: 'IPAexMincho',
    style: 'Regular',
    weight: 400,
    fileName: 'ipaexm.ttf',
    supportLangs: ['ja', 'zh-tw'],
  },
  // I.Ming
  {
    family: 'I.Ming',
    italic: false,
    postscriptName: 'I.Ming',
    style: 'Regular',
    weight: 400,
    fileName: 'I.Ming-7.01.ttf',
    supportLangs: ['ja', 'zh-tw', 'zh-cn'],
  },
  // Koku Mincho Regular
  {
    family: 'Koku Mincho Regular',
    italic: false,
    postscriptName: 'Koku Mincho Regular',
    style: 'Regular',
    weight: 400,
    fileName: 'font_1_kokumr_1.00_rls.ttf',
    supportLangs: ['ja', 'zh-tw'],
  },
  // Oradano-mincho-GSRR
  {
    family: 'Oradano-mincho-GSRR',
    italic: false,
    postscriptName: 'Oradano-mincho-GSRR',
    style: 'Regular',
    weight: 400,
    fileName: 'OradanoGSRR.ttf',
    supportLangs: ['ja', 'zh-tw'],
  },
  // Huiwen-mincho
  {
    family: 'Huiwen-mincho',
    italic: false,
    postscriptName: 'Huiwen-mincho',
    style: 'Regular',
    weight: 400,
    fileName: 'Huiwen-mincho.otf',
    supportLangs: ['ja', 'zh-tw', 'zh-cn'],
  },
  // Swei Gothic CJK TC
  {
    family: 'Swei Gothic CJK TC',
    italic: false,
    postscriptName: 'Swei Gothic CJK TC',
    style: 'Regular',
    weight: 400,
    fileName: 'SweiGothicCJKtc-Regular.ttf',
    supportLangs: ['zh-tw'],
  },
  {
    family: 'Swei Gothic CJK TC',
    italic: false,
    postscriptName: 'Swei Gothic CJK TC Bold',
    style: 'Bold',
    weight: 700,
    fileName: 'SweiGothicCJKtc-Bold.ttf',
    supportLangs: ['zh-tw'],
  },
  // Swei Gothic CJK JP
  {
    family: 'Swei Gothic CJK JP',
    italic: false,
    postscriptName: 'Swei Gothic CJK JP',
    style: 'Regular',
    weight: 400,
    fileName: 'SweiGothicCJKjp-Regular.ttf',
    supportLangs: ['ja'],
  },
  {
    family: 'Swei Gothic CJK JP',
    italic: false,
    postscriptName: 'Swei Gothic CJK JP Bold',
    style: 'Bold',
    weight: 700,
    fileName: 'SweiGothicCJKjp-Bold.ttf',
    supportLangs: ['ja'],
  },
  // Swei Gothic CJK SC
  {
    family: 'Swei Gothic CJK SC',
    italic: false,
    postscriptName: 'Swei Gothic CJK SC',
    style: 'Regular',
    weight: 400,
    fileName: 'SweiGothicCJKsc-Regular.ttf',
    supportLangs: ['zh-cn'],
  },
  {
    family: 'Swei Gothic CJK SC',
    italic: false,
    postscriptName: 'Swei Gothic CJK SC Bold',
    style: 'Bold',
    weight: 700,
    fileName: 'SweiGothicCJKsc-Bold.ttf',
    supportLangs: ['zh-cn'],
  },
  // Gen Jyuu Gothic
  {
    family: 'Gen Jyuu Gothic',
    italic: false,
    postscriptName: 'Gen Jyuu Gothic',
    style: 'Regular',
    weight: 400,
    fileName: 'GenJyuuGothic-Regular.ttf',
    supportLangs: ['ja', 'zh-tw'],
  },
  {
    family: 'Gen Jyuu Gothic',
    italic: false,
    postscriptName: 'Gen Jyuu Gothic Bold',
    style: 'Bold',
    weight: 700,
    fileName: 'GenJyuuGothic-Bold.ttf',
    supportLangs: ['ja', 'zh-tw'],
  },
  // Corporate Logo Rounded ver2
  {
    family: 'Corporate Logo Rounded ver2',
    italic: false,
    postscriptName: 'Corporate Logo Rounded ver2',
    style: 'Bold',
    weight: 700,
    fileName: 'Corporate-Logo-Rounded.ttf',
    supportLangs: ['ja', 'zh-tw'],
  },
  // jf-openhuninn-1.1
  {
    family: 'jf-openhuninn-1.1',
    italic: false,
    postscriptName: 'jf-openhuninn-1.1',
    style: 'Regular',
    weight: 400,
    fileName: 'jf-openhuninn-1.1.ttf',
    supportLangs: ['zh-tw'],
  },
  // irohamaru
  {
    family: 'irohamaru',
    italic: false,
    postscriptName: 'irohamaru',
    style: 'Regular',
    weight: 400,
    fileName: 'irohamaru-Regular.ttf',
    supportLangs: ['zh-tw'],
  },
  {
    family: 'irohamaru',
    italic: false,
    postscriptName: 'irohamaru Bold',
    style: 'Bold',
    weight: 700,
    fileName: 'irohamaru-Medium.ttf',
    supportLangs: ['zh-tw', 'ja'],
  },
  // timemachine wa
  {
    family: 'timemachine wa',
    italic: false,
    postscriptName: 'timemachine wa',
    style: 'Regular',
    weight: 400,
    fileName: 'timemachine-wa.ttf',
    supportLangs: ['zh-tw', 'ja'],
  },
  // SetoFont
  {
    family: 'SetoFont',
    italic: false,
    postscriptName: 'SetoFont',
    style: 'Regular',
    weight: 400,
    fileName: 'setofont.ttf',
    supportLangs: ['zh-tw', 'ja'],
  },
  // 內海字體
  {
    family: 'NaikaiFont',
    italic: false,
    postscriptName: '內海字體',
    style: 'Regular',
    weight: 400,
    fileName: 'NaikaiFont-Regular.ttf',
    supportLangs: ['zh-tw'],
  },
  {
    family: 'NaikaiFont',
    italic: false,
    postscriptName: '內海字體 Bold',
    style: 'Bold',
    weight: 700,
    fileName: 'NaikaiFont-Bold.ttf',
    supportLangs: ['zh-tw'],
  },
  // 內海字體 JP
  {
    family: '內海字體JP',
    italic: false,
    postscriptName: '內海字體JP',
    style: 'Regular',
    weight: 400,
    fileName: 'NaikaiFontJP-Regular.ttf',
    supportLangs: ['ja'],
  },
  {
    family: '內海字體JP',
    italic: false,
    postscriptName: '內海字體JP Bold',
    style: 'Bold',
    weight: 700,
    fileName: 'NaikaiFontJP-Bold.ttf',
    supportLangs: ['ja'],
  },
  // Mamelon
  {
    family: 'mamelon',
    italic: false,
    postscriptName: 'Mamelon',
    style: 'Regular',
    weight: 400,
    fileName: 'Mamelon-4-Hi-Regular.otf',
    supportLangs: ['zh-tw', 'ja'],
  },
  // Ronde-B
  {
    family: 'ronde-B',
    italic: false,
    postscriptName: 'Ronde-B',
    style: 'Regular',
    weight: 400,
    fileName: 'Ronde-B_square.otf',
    supportLangs: ['zh-tw', 'ja'],
  },
  // Nagurigaki Crayon
  {
    family: 'Nagurigaki Crayon',
    italic: false,
    postscriptName: 'Nagurigaki Crayon',
    style: 'Regular',
    weight: 400,
    fileName: 'crayon_1-1.ttf',
    supportLangs: ['zh-tw', 'ja'],
  },
  // Tanuki Permanent Marker
  {
    family: 'Tanuki Permanent Marker',
    italic: false,
    postscriptName: 'Tanuki Permanent Marker',
    style: 'Regular',
    weight: 400,
    fileName: 'TanukiMagic.ttf',
    supportLangs: ['zh-tw', 'ja'],
  },
  // AsobiMemogaki
  {
    family: 'AsobiMemogaki',
    italic: false,
    postscriptName: 'AsobiMemogaki',
    style: 'Regular',
    weight: 400,
    fileName: 'AsobiMemogaki-Regular-1-01.ttf',
    supportLangs: ['zh-tw', 'ja'],
  },
  // Mukasi Mukasi
  {
    family: 'mukasi mukasi',
    italic: false,
    postscriptName: 'Mukasi Mukasi',
    style: 'Regular',
    weight: 400,
    fileName: 'gomarice_mukasi_mukasi.ttf',
    supportLangs: ['zh-tw', 'ja'],
  },
  // ShigotoMemogaki
  {
    family: 'ShigotoMemogaki',
    italic: false,
    postscriptName: 'ShigotoMemogaki',
    style: 'Regular',
    weight: 400,
    fileName: 'ShigotoMemogaki-Regular-1-01.ttf',
    supportLangs: ['zh-tw', 'ja'],
  },
  // DartsFont
  {
    family: 'DartsFont',
    italic: false,
    postscriptName: 'DartsFont',
    style: 'Regular',
    weight: 400,
    fileName: 'DartsFont.ttf',
    supportLangs: ['zh-tw', 'ja'],
  },
  // Mushin
  {
    family: 'Mushin',
    italic: false,
    postscriptName: 'Mushin',
    style: 'Regular',
    weight: 400,
    fileName: 'mushin.otf',
    supportLangs: ['zh-tw', 'ja'],
  },
  // おつとめフォント
  {
    family: 'おつとめフォント',
    italic: false,
    postscriptName: 'おつとめフォント',
    style: 'Bold',
    weight: 700,
    fileName: 'OtsutomeFont_Ver3.ttf',
    supportLangs: ['zh-tw', 'ja'],
  },
  // 851MkPOP
  {
    family: '851MkPOP',
    italic: false,
    postscriptName: '851MkPOP',
    style: 'Regular',
    weight: 400,
    fileName: '851MkPOP_100.ttf',
    supportLangs: ['zh-tw', 'ja'],
  },
  // 001Shirokuma
  {
    family: '001Shirokuma',
    italic: false,
    postscriptName: '001Shirokuma',
    style: 'Regular',
    weight: 400,
    fileName: '001Shirokuma-Regular.otf',
    supportLangs: ['zh-tw', 'ja'],
  },
  // KAWAIITEGAKIMOJI
  {
    family: 'kawaiitegakimoji',
    italic: false,
    postscriptName: 'KAWAIITEGAKIMOJI',
    style: 'Regular',
    weight: 400,
    fileName: 'KTEGAKI.ttf',
    supportLangs: ['zh-tw', 'ja'],
  },
  // 851CHIKARA-DZUYOKU-KANA-B
  {
    family: '851CHIKARA-DZUYOKU-KANA-B',
    italic: false,
    postscriptName: '851CHIKARA-DZUYOKU-KANA-B',
    style: 'Regular',
    weight: 400,
    fileName: '851CHIKARA-DZUYOKU_kanaB_004.ttf',
    supportLangs: ['zh-tw', 'ja'],
  },
  // Aoyagireisyosimo2
  {
    family: 'Aoyagireisyosimo2',
    italic: false,
    postscriptName: 'aoyagireisyosimo2',
    style: 'Regular',
    weight: 400,
    fileName: 'aoyagireisyosimo_ttf_2_01.ttf',
    supportLangs: ['zh-tw', 'ja'],
  },
  // AoyagiKouzanFontT
  {
    family: 'AoyagiKouzanFontT',
    italic: false,
    postscriptName: 'AoyagiKouzanFontT',
    style: 'Regular',
    weight: 400,
    fileName: '青柳衡山フォントT.ttf',
    supportLangs: ['zh-tw', 'ja'],
  },
  // Bakudai
  {
    family: 'Bakudai',
    italic: false,
    postscriptName: 'Bakudai',
    style: 'Regular',
    weight: 400,
    fileName: 'Bakudai-Regular.ttf',
    supportLangs: ['zh-tw', 'ja'],
  },
  {
    family: 'Bakudai',
    italic: false,
    postscriptName: 'Bakudai Bold',
    style: 'Bold',
    weight: 700,
    fileName: 'Bakudai-Bold.ttf',
    supportLangs: ['zh-tw', 'ja'],
  },
  // Klee One
  {
    family: 'Klee One',
    italic: false,
    postscriptName: 'Klee One',
    style: 'Regular',
    weight: 400,
    fileName: 'KleeOne-Regular.ttf',
    supportLangs: ['zh-tw', 'ja'],
  },
  {
    family: 'Klee One',
    italic: false,
    postscriptName: 'Klee One Bold',
    style: 'Bold',
    weight: 700,
    fileName: 'KleeOne-SemiBold.ttf',
    supportLangs: ['zh-tw', 'ja'],
  },
  // Kaisotai
  {
    family: 'Kaisotai',
    italic: false,
    postscriptName: 'Kaisotai',
    style: 'Regular',
    weight: 400,
    fileName: 'Kaisotai-Next-UP-B.ttf',
    supportLangs: ['zh-tw', 'ja'],
  },
  // Makinas
  {
    family: 'makinas',
    italic: false,
    postscriptName: 'Makinas',
    style: 'Regular',
    weight: 400,
    fileName: 'Makinas-4-Flat.otf',
    supportLangs: ['zh-tw', 'ja'],
  },
  // 851Gkktt
  {
    family: '851Gkktt',
    italic: false,
    postscriptName: '851Gkktt',
    style: 'Regular',
    weight: 400,
    fileName: '851Gkktt_005.ttf',
    supportLangs: ['zh-tw', 'ja'],
  },
  // Chogokuboso Gothic
  {
    family: 'Chogokuboso Gothic',
    italic: false,
    postscriptName: 'Chogokuboso Gothic',
    style: 'Regular',
    weight: 400,
    fileName: 'chogokubosogothic_5.ttf',
    supportLangs: ['zh-tw', 'ja'],
  },
  // BoutiqueBitmap7x7
  {
    family: 'BoutiqueBitmap7x7',
    italic: false,
    postscriptName: 'BoutiqueBitmap7x7',
    style: 'Regular',
    weight: 400,
    fileName: 'BoutiqueBitmap7x7.ttf',
    supportLangs: ['zh-tw', 'ja'],
  },
];

const applyStyle = (fontsInUse: WebFont[]): void => {
  const style = document.createElement('style');
  let styleText = '';
  for (let i = 0; i < fontsInUse.length; i += 1) {
    const font = fontsInUse[i];
    styleText += `
    @font-face {
      font-family: '${font.family}';
      font-style: ${font.italic ? 'italic' : 'normal'};
      font-weight: ${font.weight};
      font-display: swap;
      src : url('https://beam-studio-web.s3.ap-northeast-1.amazonaws.com/fonts/${font.fileName}');
    }`;
  }

  const head = document.querySelector('head');
  style.innerHTML = styleText;
  head?.appendChild(style);
};

const getAvailableFonts = (lang?: string): WebFont[] => {
  if (!lang) return fonts;
  return fonts.filter((font) => {
    if (!font.supportLangs) return true;
    return font.supportLangs.includes(lang);
  });
};

export default {
  getAvailableFonts,
  applyStyle,
};
