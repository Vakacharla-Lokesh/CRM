class DatabaseState {
  constructor() {
    this._dbWorker = null;
    this._isDbReady = false;
    this._listeners = [];
  }

  get dbWorker() {
    return this._dbWorker;
  }

  set dbWorker(worker) {
    this._dbWorker = worker;
    this._notifyListeners();
  }

  get isDbReady() {
    return this._isDbReady;
  }

  set isDbReady(ready) {
    this._isDbReady = ready;
    this._notifyListeners();
  }

  subscribe(callback) {
    this._listeners.push(callback);
    return () => {
      this._listeners = this._listeners.filter((cb) => cb !== callback);
    };
  }

  _notifyListeners() {
    this._listeners.forEach((callback) => {
      callback({
        dbWorker: this._dbWorker,
        isDbReady: this._isDbReady,
      });
    });
  }

  initialize(worker) {
    this._dbWorker = worker;
  }
}

export const dbState = new DatabaseState();
