/* eslint-disable no-await-in-loop */
import JSZip from 'jszip';

import alertCaller from 'app/actions/alert-caller';
import deviceMaster from 'helpers/device-master';
import dialog from 'implementations/dialog';
import formatDuration from 'helpers/duration-formatter';
import i18n from 'helpers/i18n';
import progressCaller from 'app/actions/progress-caller';
import storage from 'implementations/storage';

export const downloadCameraData = async (deviceName: string): Promise<void> => {
  const tBackup = i18n.lang.camera_data_backup;
  const progressId = 'camera-data-backup';
  progressCaller.openSteppingProgress({
    id: progressId,
    message: tBackup.checking_pictures,
  });
  const zip = new JSZip();
  try {
    let canceled = false;
    const downloadFiles = async (names: string[], dirName: string) => {
      if (canceled) return;
      const s = Date.now();
      zip.folder(dirName);
      for (let i = 0; i < Math.min(names.length, 10); i += 1) {
        const fileName = names[i];
        const res = await deviceMaster.downloadFile(dirName, fileName, ({ left, size }) => {
          const current = 1 - left / size;
          const totalProgress = (current + i) / names.length;
          const timeElapsed = (Date.now() - s) / 1000;
          const timeLeft = formatDuration(timeElapsed / totalProgress - timeElapsed);
          progressCaller.update(progressId, {
            message: `${tBackup.downloading_data} ${dirName} ${i + 1}/${names.length}<br/>${
              tBackup.estimated_time_left
            } ${timeLeft}`,
            percentage: Math.round(100 * totalProgress),
          });
        });
        if (canceled) return;
        const [, blob] = res;
        zip.file(`${dirName}/${fileName}`, blob);
      }
    };
    const dirs = ['camera_calib', 'auto_leveling', 'fisheye'];
    let anyFolderHasFiles = false;
    progressCaller.popById(progressId);
    for (let i = 0; i < dirs.length; i += 1) {
      const dir = dirs[i];
      if (canceled) return;
      progressCaller.openSteppingProgress({
        id: progressId,
        message: tBackup.downloading_data,
        // eslint-disable-next-line @typescript-eslint/no-loop-func
        onCancel: () => {
          canceled = true;
        },
      });
      try {
        const ls = await deviceMaster.ls(dir);
        if (ls.files.length > 0) {
          anyFolderHasFiles = true;
          await downloadFiles(ls.files, dir);
        }
      } catch (e) {
        console.error(`Failed to backup ${dir}`, e);
      }
      progressCaller.popById(progressId);
    }
    if (!anyFolderHasFiles) {
      alertCaller.popUpError({ message: tBackup.no_picture_found });
      return;
    }
    progressCaller.openNonstopProgress({ id: progressId, message: tBackup.downloading_data})
    const path = await dialog.writeFileDialog(
      () => zip.generateAsync({ type: 'blob' }),
      tBackup.title,
      deviceName,
      [{ name: window.os === 'MacOS' ? 'zip (*.zip)' : 'zip', extensions: ['zip'] }]
    );
    progressCaller.popById(progressId);
    if (path) {
      alertCaller.popUp({ message: tBackup.download_success });
      storage.set('ador-backup-path', path);
    }
  } catch (e) {
    console.error('Failed backup camera data', e);
    let errMsg: string;
    if (e instanceof Error) {
      errMsg = e.message;
    } else {
      try {
        errMsg = JSON.stringify(e);
      } catch {
        errMsg = String(e);
      }
    }
    alertCaller.popUpError({ message: `Failed backup camera data: ${errMsg}` });
  } finally {
    progressCaller.popById(progressId);
  }
};

export const uploadCameraData = async (): Promise<void> => {
  const file = await dialog.getFileFromDialog({
    defaultPath: storage.get('ador-backup-path') ?? '',
    properties: ['openFile'],
    filters: [{ name: 'zip (*.zip)', extensions: ['zip'] }],
  });
  if (!file) return;
  let canceled = false;
  const tBackup = i18n.lang.camera_data_backup;
  const progressId = 'camera-data-backup';
  progressCaller.openSteppingProgress({
    id: progressId,
    message: tBackup.uploading_data,
    onCancel: () => {
      canceled = true;
    },
  });
  try {
    const arrayBuffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);
    const dirs = new Set(['camera_calib', 'auto_leveling', 'fisheye']);
    const filteredFiles = zip.filter((relativePath, f) => !f.dir && dirs.has(relativePath.split('/')[0]));
    if (filteredFiles.length === 0) {
      alertCaller.popUpError({ message: tBackup.incorrect_folder });
      return;
    }
    const s = Date.now();
    for (let i = 0; i < filteredFiles.length; i += 1) {
      if (canceled) return;
      const splitedName = filteredFiles[i].name.split('/');
      // eslint-disable-next-line no-continue
      if (splitedName.length !== 2) continue;
      const [dir, fileName] = splitedName;

      const blob = await zip.file(filteredFiles[i].name).async('blob');
      // eslint-disable-next-line no-continue
      if (blob.size === 0) continue;
      await deviceMaster.uploadToDirectory(blob, dir, fileName, ({ step, total }) => {
        const current = step / total;
        const totalProgress = (current + i) / filteredFiles.length;
        const timeElapsed = (Date.now() - s) / 1000;
        const timeLeft = formatDuration(timeElapsed / totalProgress - timeElapsed);
        progressCaller.update('camera-data-backup', {
          message: `${tBackup.uploading_data} ${i + 1}/${filteredFiles.length}<br/>${
            tBackup.estimated_time_left
          } ${timeLeft}`,
          percentage: Math.round(100 * totalProgress),
        });
      });
    }
    alertCaller.popUp({ message: tBackup.upload_success });
  } catch (e) {
    console.error('Failed to upload backup camera data', e);
    let errMsg: string;
    if (e instanceof Error) {
      errMsg = e.message;
    } else {
      try {
        errMsg = JSON.stringify(e);
      } catch {
        errMsg = String(e);
      }
    }
    alertCaller.popUpError({ message: `Failed to upload backup camera data: ${errMsg}` });
  } finally {
    progressCaller.popById(progressId);
  }
};

export default {
  downloadCameraData,
  uploadCameraData,
}
