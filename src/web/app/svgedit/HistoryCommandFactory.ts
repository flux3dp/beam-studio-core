import history from 'app/svgedit/history';

class HistoryCommandFactory {
  static createBatchCommand(text: string) {
    return new history.BatchCommand(text);
  }
}

export default HistoryCommandFactory;
