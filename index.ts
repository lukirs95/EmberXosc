import * as fs from 'fs';
import { EXOServiceConfig } from './src/service/Conifguration';
import { EXOService } from './src/service/Service';

const configFilePath = process.argv[2];
if (configFilePath == '' || !configFilePath) {
  console.error(
    'NO PATH TO CONFIG FILE GIVEN!!! Please run program like: node index.js path/to/config.json'
  );
  process.exit(1);
}
const configFile = fs.readFileSync(process.argv[2]);
const config: EXOServiceConfig = JSON.parse(configFile.toString());

const service = new EXOService();

service.on('error', (error) => console.error('SERVICE ERROR ::', error));
service.on('info', (info) => console.info(info));

service
  .connect(config)
  .then(() => console.log('connected'))
  .catch((error) => console.error('ERROR ::', error));
