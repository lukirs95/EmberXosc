interface RegistryEntry {
  path: string;
  cb: (value: any) => void;
}

export class EXOoscRegistry {
  private _reg: RegistryEntry[];

  constructor() {
    this._reg = [];
  }

  add(path: string, callback: (value: any) => void) {
    const index = this._reg.findIndex((entry) => entry.path == path);
    if (index == -1) {
      this._reg.push({ path: path, cb: callback });
    } else {
      throw `${path} already in registry`;
    }
  }

  delete(path: string) {
    const index = this._reg.findIndex((entry) => entry.path == path);
    if (index != -1) {
      delete this._reg[index];
    }
  }

  getEntry(path: string) {
    return this._reg.find((entry) => entry.path == path);
  }
}
