export interface Tab {
  id: number;
  title: string;
  isCloud: boolean;
  isLoading: boolean;
  isPreviewing?: boolean;
}

export default Tab;
