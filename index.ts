import { EXOEmberClient } from './src/ember/Client';
import { EXOoscClient } from './src/osc/Client';
import * as fs from 'fs';

interface Configuration {
  ember_client: string;
  osc_client: string;
  parameter: [
    {
      ember_path: string;
      osc_path: string;
    }
  ];
}

const configFilePath = process.argv[2];
if (configFilePath == '' || !configFilePath) {
  console.error(
    'NO PATH TO CONFIG FILE GIVEN!!! Please run program like: node index.js path/to/config.json'
  );
  process.exit(1);
}
const configFile = fs.readFileSync(process.argv[2]);
const config: Configuration = JSON.parse(configFile.toString());

const oscClient = new EXOoscClient(config.osc_client);
const emberClient = new EXOEmberClient(config.ember_client);

emberClient.connect().then(() => {
  for (const param of config.parameter) {
    emberClient
      .subscribe(param.ember_path, (value) => {
        console.log('RECEIVED EMBER-VALUE:', param.ember_path, '->', value);
        oscClient
          .send(param.osc_path, value)
          .then(({ path, args }) => {
            console.log('REDIRECTED TO OSC:', path, args);
          })
          .catch((error) =>
            console.error('NOT REDIRECTED TO OSC, REASON:', error)
          );
      })
      .then(() => {
        oscClient.register(param.osc_path, (value) => {
          console.log('RECEIVED OSC-VALUE:', param.osc_path, '->', value);
          emberClient
            .send(param.ember_path, value)
            .then((value) => {
              console.log('REDIRECTED TO EMBER:', param.ember_path, value);
            })
            .catch((error) =>
              console.error('NOT REDIRECTED TO EMBER, REASON:', error)
            );
        });
      });
  }
});

// emberClient.connect().then(() => {
//   console.log('connected to ember');
//   oscClient
//     .register('/fader/1', (value) => {
//       console.log('received new osc value');
//       emberClient.send('2.2.2.1.1.4.12.1', value).catch((error) => {
//         console.error(error);
//       });
//     })
//     .then(() => {
//       emberClient.subscribe('2.2.2.1.1.4.12.1', (value) => {
//         console.log('received new ember value');
//         oscClient.send('/fader/1', value).catch((error) => {
//           console.error(error);
//         });
//       });
//     })
//     .catch((error) => {
//       console.error(error);
//     });
// });
