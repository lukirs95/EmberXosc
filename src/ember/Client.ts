import { EmberClient } from 'emberplus-connection';
import { EXOEmberRegistry } from './Registry';
import { EventEmitter } from 'node:events';
import { Parameter } from 'emberplus-connection/dist/model';
import { EmberValue } from 'emberplus-connection/dist/types';

export class EXOEmberClient extends EventEmitter {
  private _client: EmberClient;
  private _registry: EXOEmberRegistry;
  private _reconnect: boolean;

  constructor(host: string, reconnect = false) {
    super();
    this._client = new EmberClient(host, 9000);
    this._client.on('connected', () => this.onConnect());
    this._client.on('disconnected', () => this.onDisconnect());
    this._client.on('error', (error) => this.onError(error));
    this._client.on('warn', (error) => this.onError(error));

    this._registry = new EXOEmberRegistry();
    this._reconnect = reconnect;
  }

  async connect() {
    this.emit('connecting');
    return this._client
      .connect()
      .then((error) => {
        if (error) {
          throw error;
        }
        return this._client.getDirectory(this._client.tree);
      })
      .then((request) => {
        return request.response;
      })
      .then((root) => {
        if (!root) {
          throw 'could not get root';
        }
      });
  }

  async disconnect() {
    this._reconnect = false;
    return this._client
      .disconnect()
      .then(() => this.onDisconnect())
      .catch((error) => this.onError(error));
  }

  async send(path: string, value: any) {
    const entry = this._registry.getEntry(path);
    if (entry) {
      return this._client
        .setValue(entry.node, value, false)
        .then((req) => req.response);
    }
    return Promise.reject(`${path} not found`);
  }

  async subscribe(path: string, callback: (value: EmberValue) => void) {
    const req = await this._client.getElementByPath(path, (element) => {
      if (
        element.contents.type == 'PARAMETER' &&
        element.contents.value !== undefined
      ) {
        callback(element.contents.value);
      }
    });
    if (req) {
      this._registry.add(path, req, callback);
    } else {
      throw `no parameter found with path ${path}`;
    }
  }

  unsubscribe(path: string) {
    this._registry.delete(path);
  }

  protected onConnect() {
    console.log(`connected to ${this._client.host}`);
    this.emit('connected');
  }

  protected onDisconnect() {
    console.log(`disconnected from ${this._client.host}`);
    this.emit('disconnected');
    if (this._reconnect) {
      console.log(`try reconnecting...`);
      this.connect().catch((error) => this.onError(error));
    }
  }

  protected onError(error: Error) {
    console.log(error);
    this.emit('error', error);
  }
}
