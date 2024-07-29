# EmberBridgeOSC

This simple little tool lets you bridge whatever Ember+ device to OSC. You need to have NodeJS and Typescript installed on your system.

## HOWTO

``` sh
npm install && tsc && node dist/index.js examples/config.json
```

You need to pass the path to the configuration file as parameter.

Format of the configuration file

``` JSON
{
    "ember_client": "ip-address:port",
    "osc_client": "localport:ip-address:remoteport",
    "parameter": [
        {
            "ember_path": "1.2.3.4.5",
            "osc_path": "/osc/path/whatever"
        },
        {
            "ember_path": "1.3.5.7",
            "osc_path": "/other/osc/path"
        }
    ]
}
```

It connects to "ember_client", sends OSC commands to "osc_client" on remoteport and listens on localport.
