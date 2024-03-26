/* eslint-disable no-await-in-loop */
import React, { useCallback, useEffect, useState } from 'react';
import { Modal } from 'antd';

import alertCaller from 'app/actions/alert-caller';
import deviceMaster from 'helpers/device-master';
import formatDuration from 'helpers/duration-formatter';
import fs from 'implementations/fileSystem';
import PathInput, { InputType } from 'app/widgets/PathInput';
import progressCaller from 'app/actions/progress-caller';
import storage from 'implementations/storage';
import useI18n from 'helpers/useI18n';

import styles from './CameraDataBackup.module.scss';

interface Props {
  deviceName: string;
  type: 'download' | 'upload';
  onClose: () => void;
}

const CameraDataBackup = ({ deviceName, type, onClose }: Props): JSX.Element => {
  const lang = useI18n();
  const tBackup = lang.camera_data_backup;
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [selectedPath, setSelectedPath] = useState(
    type === 'download'
      ? fs.join(fs.getPath('documents'), 'Beam Studio', deviceName)
      : (storage.get('ador-backup-path') ?? '')
  );

  useEffect(() => {
    const checkDataExist = async () => {
      progressCaller.openNonstopProgress({
        id: 'camera-data-backup',
        message: tBackup.checking_pictures,
      });
      try {
        const res = await deviceMaster.ls('camera_calib');
        if (res.files.length > 0) {
          setFileNames(res.files);
        } else {
          alertCaller.popUpError({ message: tBackup.no_picture_found });
          onClose();
        }
      } catch (e) {
        alertCaller.popUpError({ message: 'Failed to check data' });
        onClose();
      } finally {
        progressCaller.popById('camera-data-backup');
      }
    };
    if (type === 'download') checkDataExist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOk = useCallback(async () => {
    let canceled = false;
    try {
      if (type === 'download') {
        storage.set('ador-backup-path', selectedPath);
        const downloadFiles = async (names: string[], dirName: string) => {
          if (canceled) return;
          const s = Date.now();
          await fs.mkdir(fs.join(selectedPath, dirName), true);
          for (let i = 0; i < names.length; i += 1) {
            const fileName = names[i];
            const res = await deviceMaster.downloadFile(dirName, fileName, ({ left, size }) => {
              const current = 1 - left / size;
              const totalProgress = (current + i) / names.length;
              const timeElapsed = (Date.now() - s) / 1000;
              const timeLeft = formatDuration(timeElapsed / totalProgress - timeElapsed);
              progressCaller.update('camera-data-backup', {
                message: `${tBackup.downloading_data} ${dirName} ${i + 1}/${names.length}<br/>${
                  tBackup.estimated_time_left
                } ${timeLeft}`,
                percentage: Math.round(100 * totalProgress),
              });
            });
            if (canceled) return;
            const [, blob] = res;
            const buffer = Buffer.from(await blob.arrayBuffer());
            fs.writeFile(fs.join(selectedPath, dirName, fileName), buffer);
          }
        };
        progressCaller.openSteppingProgress({
          id: 'camera-data-backup',
          message: tBackup.downloading_data,
          onCancel: () => {
            canceled = true;
          },
        });
        await downloadFiles(fileNames, 'camera_calib');
        progressCaller.popById('camera-data-backup');
        if (canceled) return;
        const extraDirs = ['auto_leveling', 'fisheye'];
        for (let i = 0; i < extraDirs.length; i += 1) {
          const dir = extraDirs[i];
          if (canceled) return;
          progressCaller.openSteppingProgress({
            id: 'camera-data-backup',
            message: tBackup.downloading_data,
            // eslint-disable-next-line @typescript-eslint/no-loop-func
            onCancel: () => {
              canceled = true;
            },
          });
          try {
            const ls = await deviceMaster.ls(dir);
            if (ls.files.length > 0) {
              await downloadFiles(ls.files, dir);
            }
            progressCaller.popById('camera-data-backup');
          } catch (e) {
            console.log(`Failed to backup ${dir}`, e);
          }
        }
        alertCaller.popUp({ message: tBackup.download_success });
      } else {
        if (!fs.exists(selectedPath)) {
          alertCaller.popUpError({ message: tBackup.folder_not_exists });
          return;
        }
        const dirs = ['camera_calib', 'auto_leveling', 'fisheye'];
        for (let i = 0; i < dirs.length; i += 1) {
          progressCaller.openSteppingProgress({
            id: 'camera-data-backup',
            message: tBackup.uploading_data,
            // eslint-disable-next-line @typescript-eslint/no-loop-func
            onCancel: () => {
              canceled = true;
            },
          });
          const dir = dirs[i];
          if (canceled) return;
          const s = Date.now();
          try {
            const files = fs.readdirSync(fs.join(selectedPath, dir));
            for (let j = 0; j < files.length; j += 1) {
              if (canceled) return;
              const fileName = files[j];
              const buffer = fs.readFile(fs.join(selectedPath, dir, fileName));
              const blob = new Blob([buffer]);
              await deviceMaster.uploadToDirectory(blob, dir, fileName, ({ step, total }) => {
                const current = step / total;
                const totalProgress = (current + j) / files.length;
                const timeElapsed = (Date.now() - s) / 1000;
                const timeLeft = formatDuration(timeElapsed / totalProgress - timeElapsed);
                progressCaller.update('camera-data-backup', {
                  message: `${tBackup.uploading_data} ${dir} ${j + 1}/${files.length}<br/>${
                    tBackup.estimated_time_left
                  } ${timeLeft}`,
                  percentage: Math.round(100 * totalProgress),
                });
              });
            }
          } catch (e) {
            console.log(`Failed to restore ${dir}`, e);
          }
          progressCaller.popById('camera-data-backup');
        }
        alertCaller.popUp({ message: tBackup.upload_success });
      }
    } finally {
      progressCaller.popById('camera-data-backup');
    }
    onClose();
  }, [tBackup, selectedPath, type, fileNames, onClose]);

  const onInputValue = useCallback((val: string, isValid: boolean) => {
    if (isValid) setSelectedPath(val);
  }, []);

  return (
    <Modal
      open
      centered
      title={tBackup.title}
      cancelText={lang.alert.cancel}
      onCancel={onClose}
      okText={lang.alert.confirm}
      onOk={handleOk}
      okButtonProps={{ disabled: !selectedPath }}
    >
      <div>
        {type === 'download' ? tBackup.select_folder_download : tBackup.select_folder_upload}
      </div>
      <PathInput
        className={styles.pathInput}
        buttonTitle={lang.general.choose_folder}
        defaultValue={selectedPath}
        type={InputType.FOLDER}
        getValue={onInputValue}
      />
    </Modal>
  );
};

export default CameraDataBackup;
