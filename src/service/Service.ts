import { EXOEmberClient } from '../ember/Client';
import { EXOoscClient } from '../osc/Client';
import { EXOServiceConfig, ValidateServiceConfig } from './Conifguration';
import { EventEmitter } from 'node:events';

export enum EXOServiceStatus {
  Disconnected,
  Connecting,
  Connected
}

export class EXOService extends EventEmitter {
  private _emberClient!: EXOEmberClient | null;
  private _oscClient!: EXOoscClient | null;

  constructor() {
    super();
  }

  async connect(config: EXOServiceConfig) {
    return new Promise<void>((resolve, reject) => {
      try {
        ValidateServiceConfig(config);

        const [emberHost, EmberPortString] = config.ember_client.split(':');
        const emberPort = parseInt(EmberPortString);
        this._emberClient = new EXOEmberClient(emberHost, emberPort, true);

        const [oscLocalPortString, oscHost, oscRemotePortString] =
          config.osc_client.split(':');
        const oscLocalPort = parseInt(oscLocalPortString);
        const oscRemotePort = parseInt(oscRemotePortString);

        this._oscClient = new EXOoscClient(
          oscHost,
          oscRemotePort,
          oscLocalPort
        );

        this._oscClient.on('connected', () =>
          this.info('Listening for OSC messages')
        );
        this._oscClient.on('error', (error) => this.error(error));
        resolve();
      } catch (error) {
        reject(error);
      }
    })
      .then(() => {
        this._emberClient?.on('connecting', () =>
          this.info('Connecting to EmberPlus device')
        );
        this._emberClient?.on('connected', () =>
          this.info('Connected to EmberPlus device')
        );
        this._emberClient?.on('disconnected', () =>
          this.info('Disconnected from EmberPlus device')
        );
        this._emberClient?.on('error', (error) => this.error(error));

        return this._emberClient?.connect();
      })
      .then(() =>
        Promise.all(
          config.parameter.map((parameter) =>
            this._emberClient
              ?.subscribe(parameter.ember_path, (value) => {
                this.info(
                  `RECEIVED EMBER-VALUE: ${parameter.ember_path} -> ${value}`
                );
                this._oscClient
                  ?.send(parameter.osc_path, value)
                  .then(({ path, args }) => {
                    this.info(`REDIRECTED TO OSC: ${path} -> ${args}`);
                  })
                  .catch((error) =>
                    this.error(
                      new Error(`NOT REDIRECTED TO OSC, REASON: ${error}`)
                    )
                  );
              })
              .then(() =>
                this._oscClient?.register(parameter.osc_path, (value) => {
                  this.info(
                    `RECEIVED OSC-VALUE: ${parameter.osc_path} -> ${value}`
                  );
                  this._emberClient
                    ?.send(parameter.ember_path, value)
                    .then((value) => {
                      this.info(
                        `REDIRECTED TO EMBER: ${parameter.ember_path} -> ${value}`
                      );
                    })
                    .catch((error) =>
                      this.error(
                        new Error(`NOT REDIRECTED TO EMBER, REASON: ${error}`)
                      )
                    );
                })
              )
          )
        )
      );
  }

  async destroy() {
    this.info('destroy osc client...');
    if (this._oscClient) {
      this._oscClient.destroy();
    }
    this.info('destroy ember client...');
    if (this._emberClient) {
      await this._emberClient.disconnect();
    }
    this._oscClient = null;
    this._emberClient = null;

    this.info('destroyed clients');
  }

  private info(message: string) {
    this.emit('info', message);
  }

  private error(error: Error) {
    this.emit('error', error);
  }
}
