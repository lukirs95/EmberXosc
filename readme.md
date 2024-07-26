# EmberBridgeOSC

This simple little tool lets you bridge whatever Ember+ device to OSC. You need to have NodeJS installed on your system.

## HOWTO

``` sh
npm install && tsc && node dist/index.js examples/config.json
```

It connects to "ember_client" on port 9000, sends OSC commands to "osc_client" on port 9000 and listens on port 9000.
