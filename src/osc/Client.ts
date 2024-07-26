import { ArgumentType, Client, Server } from 'node-osc';
import { EventEmitter } from 'node:events';
import { EXOoscRegistry } from './Registry';

export class EXOoscClient extends EventEmitter {
  private _registry: EXOoscRegistry;
  private _client: Client;
  private _server: Server;

  constructor(host: string, sendPort = 9000, receivePort = 9000) {
    super();
    this._registry = new EXOoscRegistry();
    this._client = new Client(host, sendPort);
    this._server = new Server(receivePort, '0.0.0.0');
    this._server.on('listening', () => this.onListening());
    this._server.on('error', (error) => this.onError(error));
    this._server.on('message', (message) => this.onMessage(message));
  }

  async send(path: string, args: any) {
    return new Promise<{ path: string; args: any }>((resolve, reject) => {
      this._client.send(path, args, (error) => {
        if (error !== null) {
          reject(error);
        } else {
          resolve({ path, args });
        }
      });
    });
  }

  register(path: string, callback: (value: any) => void) {
    return new Promise<void>((resolve, reject) => {
      try {
        this._registry.add(path, callback);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  unregister(path: string) {
    this._registry.delete(path);
  }

  private onListening() {
    this.emit('connected');
  }

  private onMessage(message: [string, ...ArgumentType[]]) {
    const entry = this._registry.getEntry(message[0]);
    if (entry) {
      entry.cb(message[1]);
    }
  }

  private onError(error: Error) {
    this.emit('error', error);
  }
}
