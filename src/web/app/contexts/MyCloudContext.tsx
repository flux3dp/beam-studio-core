import React, {
  createContext,
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from 'react';

import Alert from 'app/actions/alert-caller';
import alertConstants from 'app/constants/alert-constants';
import BeamFileHelper from 'helpers/beam-file-helper';
import dialog from 'implementations/dialog';
import dialogCaller from 'app/actions/dialog-caller';
import Progress from 'app/actions/progress-caller';
import useI18n from 'helpers/useI18n';
import { axiosFluxId, getDefaultHeader, ResponseWithError } from 'helpers/api/flux-id';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import { IFile } from 'interfaces/IMyCloud';

let svgCanvas;
getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
});

interface MyCloudContextType {
  sortBy: string;
  setSortBy: Dispatch<SetStateAction<string>>;
  files: IFile[] | undefined;
  editingId: string | null;
  setEditingId: Dispatch<SetStateAction<string | null>>;
  selectedId: string | null;
  setSelectedId: Dispatch<SetStateAction<string | null>>;
  onClose: () => void;
  fileOperation: {
    open: (file: IFile) => Promise<void>;
    duplicate: (file: IFile) => Promise<void>;
    download: (file: IFile) => Promise<void>;
    rename: (file: IFile, newName: string) => Promise<void>;
    delete: (file: IFile) => Promise<void>;
  };
}

export const MyCloudContext = createContext<MyCloudContextType>({
  sortBy: 'recent',
  setSortBy: () => {},
  files: [],
  editingId: null,
  setEditingId: () => {},
  selectedId: null,
  setSelectedId: () => {},
  onClose: () => {},
  fileOperation: {
    open: async () => {},
    duplicate: async () => {},
    download: async () => {},
    rename: async () => {},
    delete: async () => {},
  },
});

interface MyCloudProviderProps {
  children: React.ReactNode;
  onClose: () => void;
}

export function MyCloudProvider({ children, onClose }: MyCloudProviderProps): JSX.Element {
  const LANG = useI18n();
  const [sortBy, setSortBy] = useState('recent');
  const [files, setFiles] = useState<IFile[] | undefined>(undefined);
  const [editingId, setEditingId] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  const checkResp = useCallback(
    async (resp: ResponseWithError) => {
      if (!resp) {
        Alert.popUpError({ message: LANG.flux_id_login.connection_fail });
        return false;
      }
      const { error } = resp;
      if (error) {
        if (!error.response) {
          Alert.popUpError({ message: LANG.flux_id_login.connection_fail });
          return false;
        }
        const { status, statusText } = error.response;
        const { info, message, detail } = error.response.data || {};
        if (status === 403 && detail && detail.startsWith('CSRF Failed: CSRF')) {
          Alert.popUp({
            message: LANG.beambox.popup.ai_credit.relogin_to_use,
            buttonType: alertConstants.CONFIRM_CANCEL,
            onConfirm: dialogCaller.showLoginDialog,
          });
          return false;
        }
        if (info === 'STORAGE_LIMIT_EXCEEDED') {
          Alert.popUpError({ message: LANG.my_cloud.save_file.storage_limit_exceeded });
          return false;
        }
        Alert.popUpError({
          caption: info,
          message: detail || message || `${status}: ${statusText}`,
        });
        return false;
      }
      let { data } = resp;
      if (data instanceof Blob && data.type === 'application/json') {
        data = JSON.parse(await data.text());
      }
      const { status, info, message } = data;
      if (status !== 'error') return true;
      if (info === 'NOT_SUBSCRIBED') {
        onClose();
        dialogCaller.showFluxPlusWarning();
        return false;
      }
      Alert.popUpError({ caption: info, message });
      return false;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [LANG]
  );

  const sortAndSetFiles = (newFiles: IFile[] = files) => {
    if (!newFiles) return;
    newFiles.sort((a: IFile, b: IFile) => {
      if (sortBy === 'old') {
        if (a.last_modified_at < b.last_modified_at) return -1;
        if (a.last_modified_at > b.last_modified_at) return 1;
        return 0;
      }
      if (sortBy === 'a2z') {
        if (a.name < b.name) return -1;
        if (a.name > b.name) return 1;
        return 0;
      }
      if (sortBy === 'z2a') {
        if (a.name > b.name) return -1;
        if (a.name < b.name) return 1;
        return 0;
      }
      // sortBy === 'recent'
      if (a.last_modified_at > b.last_modified_at) return -1;
      if (a.last_modified_at < b.last_modified_at) return 1;
      return 0;
    });
    setFiles([...newFiles]);
  };

  const getFileList = async (): Promise<IFile[]> => {
    try {
      const resp = await axiosFluxId.get('/api/beam-studio/cloud/list', { withCredentials: true });
      return (await checkResp(resp)) ? resp.data.data.files : [];
    } catch (e) {
      console.error(e);
      return [];
    }
  };

  const refresh = async () => {
    const newFiles = await getFileList();
    sortAndSetFiles(newFiles);
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    sortAndSetFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy]);

  const openFile = async (file: IFile) => {
    const id = 'open-cloud-file';
    await Progress.openNonstopProgress({ id });
    try {
      const resp = await axiosFluxId.get(`/api/beam-studio/cloud/file/${file.uuid}`, {
        withCredentials: true,
        responseType: 'blob',
      });
      if (await checkResp(resp)) {
        await BeamFileHelper.readBeam(resp.data);
        svgCanvas.currentFilePath = `cloud:${file.uuid}`;
        svgCanvas.setLatestImportFileName(file.name);
        onClose();
      }
    } catch (e) {
      console.error(e);
      Alert.popUpError({ message: `Error: ${LANG.my_cloud.action.open}` });
    } finally {
      Progress.popById(id);
    }
  };

  const duplicateFile = async (file: IFile) => {
    const id = 'duplicate-cloud-file';
    await Progress.openNonstopProgress({ id });
    let newFile: string;
    try {
      const resp = await axiosFluxId.put(
        `/api/beam-studio/cloud/file/operation/${file.uuid}`,
        { method: 'duplicate' },
        { withCredentials: true, headers: getDefaultHeader() }
      );
      if (await checkResp(resp)) {
        newFile = resp.data.new_file;
      }
    } catch (e) {
      console.error(e);
      Alert.popUpError({ message: `Error: ${LANG.my_cloud.action.duplicate}` });
    } finally {
      Progress.popById(id);
      refresh();
      if (newFile) {
        setEditingId(newFile);
      }
    }
  };

  const downloadFile = async (file: IFile) => {
    const id = 'download-cloud-file';
    await Progress.openNonstopProgress({ id });
    const langFile = LANG.topmenu.file;
    const getContent = async () => {
      const resp = await axiosFluxId.get(`/api/beam-studio/cloud/file/${file.uuid}`, {
        withCredentials: true,
        responseType: 'blob',
      });
      return resp.data;
    };
    try {
      await dialog.writeFileDialog(
        getContent,
        langFile.save_scene,
        window.os === 'Linux' ? `${file.name}.beam` : file.name,
        [
          {
            name: window.os === 'MacOS' ? `${langFile.scene_files} (*.beam)` : langFile.scene_files,
            extensions: ['beam'],
          },
          {
            name: langFile.all_files,
            extensions: ['*'],
          },
        ]
      );
    } catch (e) {
      console.error(e);
      Alert.popUpError({ message: `Error: ${LANG.my_cloud.action.download}` });
    } finally {
      Progress.popById(id);
    }
  };

  const renameFile = async (file: IFile, newName: string) => {
    const id = 'rename-cloud-file';
    if (newName && file.name !== newName) {
      await Progress.openNonstopProgress({ id });
      try {
        const resp = await axiosFluxId.put(
          `/api/beam-studio/cloud/file/operation/${file.uuid}`,
          { method: 'rename', data: newName },
          { withCredentials: true, headers: getDefaultHeader() }
        );
        if (await checkResp(resp)) {
          // eslint-disable-next-line no-param-reassign
          file.name = newName;
          if (svgCanvas.currentFilePath === `cloud:${file.uuid}`) {
            svgCanvas.setLatestImportFileName(file.name);
          }
          sortAndSetFiles();
        }
      } catch (e) {
        console.error(e);
        Alert.popUpError({ message: `Error: ${LANG.my_cloud.action.rename}` });
      } finally {
        Progress.popById(id);
      }
    }
    setEditingId(null);
  };

  const deleteFile = async (file: IFile) => {
    const id = 'delete-cloud-file';
    await Progress.openNonstopProgress({ id });
    try {
      const resp = await axiosFluxId.delete(`/api/beam-studio/cloud/file/${file.uuid}`, {
        withCredentials: true,
        headers: getDefaultHeader(),
      });
      if ((await checkResp(resp)) && svgCanvas.currentFilePath === `cloud:${file.uuid}`) {
        svgCanvas.currentFilePath = null;
      }
    } catch (e) {
      console.error(e);
      Alert.popUpError({ message: `Error: ${LANG.my_cloud.action.delete}` });
    } finally {
      Progress.popById(id);
      refresh();
    }
  };

  return (
    <MyCloudContext.Provider
      value={{
        sortBy,
        setSortBy,
        files,
        editingId,
        setEditingId,
        selectedId,
        setSelectedId,
        onClose,
        fileOperation: {
          open: openFile,
          duplicate: duplicateFile,
          download: downloadFile,
          rename: renameFile,
          delete: deleteFile,
        },
      }}
    >
      {children}
    </MyCloudContext.Provider>
  );
}
