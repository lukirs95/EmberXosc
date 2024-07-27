export interface EXOServiceConfig {
  ember_client: string;
  osc_client: string;
  parameter: [
    {
      ember_path: string;
      osc_path: string;
    }
  ];
}

const regexEmberClient = new RegExp(
  /^(\b25[0-5]|\b2[0-4][0-9]|\b[01]?[0-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}:((6553[0-5])|(655[0-2][0-9])|(65[0-4][0-9]{2})|(6[0-4][0-9]{3})|([1-5][0-9]{4})|([0-5]{0,5})|([0-9]{1,4}))$/
);
function validateEmberClient(ember_client: string): boolean {
  return regexEmberClient.test(ember_client);
}

const regexOscClient = new RegExp(
  /^((6553[0-5])|(655[0-2][0-9])|(65[0-4][0-9]{2})|(6[0-4][0-9]{3})|([1-5][0-9]{4})|([0-5]{0,5})|([0-9]{1,4})):(\b25[0-5]|\b2[0-4][0-9]|\b[01]?[0-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}:((6553[0-5])|(655[0-2][0-9])|(65[0-4][0-9]{2})|(6[0-4][0-9]{3})|([1-5][0-9]{4})|([0-5]{0,5})|([0-9]{1,4}))$/
);
function validateOscClient(osc_client: string): boolean {
  return regexOscClient.test(osc_client);
}

const regexEmberPath = new RegExp(/^\d+($|(\.\d+)+$)/);
function validateEmberPath(ember_path: string): boolean {
  return regexEmberPath.test(ember_path);
}

const regexOscPath = new RegExp(/^(\/[a-zA-Z0-9]+)+$/);
function validateOscPath(osc_path: string): boolean {
  return regexOscPath.test(osc_path);
}

export function ValidateServiceConfig(config: EXOServiceConfig) {
  if (!validateEmberClient(config.ember_client)) {
    throw "ember_client invalid: expected format 'IP:PORT (0.0.0.0:9000)'";
  }
  if (!validateOscClient(config.osc_client)) {
    throw "osc_client invalid: expected format LOCAL_PORT:IP:REMOTE_PORT '(9000:0.0.0.0:9000)'";
  }
  for (const parameter of config.parameter) {
    if (!validateEmberPath(parameter.ember_path)) {
      throw "ember_path invalid: expected format '1.2.3.4.5'";
    }
    if (!validateOscPath(parameter.osc_path)) {
      throw "osc_path invalid: expected format '/valid/path'";
    }
  }
}
