import {
  EmberElement,
  NumberedTreeNodeImpl,
  Parameter,
  TreeElement
} from 'emberplus-connection/dist/model';
import { EmberValue } from 'emberplus-connection/dist/types';

interface RegistryEntry {
  path: string;
  node: NumberedTreeNodeImpl<Parameter>;
  cb: (value: EmberValue) => void;
}

export class EXOEmberRegistry {
  private _reg: RegistryEntry[];

  constructor() {
    this._reg = [];
  }

  add(
    path: string,
    node: TreeElement<EmberElement>,
    callback: (value: EmberValue) => void
  ) {
    if (node instanceof NumberedTreeNodeImpl) {
      const index = this._reg.findIndex((entry) => entry.path == path);
      if (index == -1) {
        this._reg.push({ path: path, node: node, cb: callback });
      } else {
        throw `${path} already in registry`;
      }
    } else {
      throw `could not add ${path}. Element not parameter`;
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
