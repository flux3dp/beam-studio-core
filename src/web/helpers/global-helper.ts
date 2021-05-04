function getOS() {
  const { platform } = navigator;
  const macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'];
  const windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'];
  if (macosPlatforms.includes(platform)) {
    return 'MacOS';
  }
  if (windowsPlatforms.includes(platform)) {
    return 'Windows';
  }
  if (platform.toLowerCase().includes('linux')) {
    return 'Linux';
  }
  return 'others';
}

const setWindowMember = (): void => {
  window.os = getOS();
};
setWindowMember();

export default {
  setWindowMember,
};
