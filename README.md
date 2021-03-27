# Electron-parsely

## Getting started
```sh
// execute
git clone https://github.com/lindsayjspencer/electron-parsely.git
```

Then install all the `node_modules` needed by executing the following command:
```sh
cd electron-parsely
npm install --also-dev
```

Finally execute the following command to start Webpack in development mode and 
watch the changes on source files for live rebuild on code changes.
```sh
npm run dev
```

The `npm run dev` command won't start your app and get your app shows on the 
screen. To start your app, execute the following command:
```sh
npm start
```

## Building the installer for your Electron app

For macOS, execute:
```sh
npm run prod
npm run build:mac
```

For Windows, execute:
```sh
npm run prod
npm run build:win
```
_**`asar` archiving may cause errors while running the installed Electron app 
based on pervious experiences, whereas the macOS build with `asar` enabled 
works just fine. You can turn it off by changing `asar` to `false` in
`package.json` line 26.**_

### Extra options
The build scripts are pre-configured to build 64 bit installers since 64 bit 
should be the standard for a modern applications. 32 bit builds are still 
possible by changing the build scripts in `package.json` as below:
```json
// from
"scripts": {
    ...
    "build:win": "electron-builder build --win --x64",
    "build:mac": "electron-builder build --mac --x64"
},

// to
"scripts": {
    ...
    "build:win": "electron-builder build --win --ia32",
    // Works only on macOS version < 10.15
    "build:mac": "electron-builder build --mac --ia32"
},
```

Builds for Linux, armv71, and arm64 can also be configured by modifying the 
build scripts in `package.json`, but those aren't tested yet. For details, 
please refer to [documents of `electron-builder`](https://www.electron.build/cli).

## Known issues
1. As Apple introduced the [notarization requirements] with the public release
   of `macOS 10.14.5`, apps built for `macOS` are now needed to be signed with
   a valid Developer ID certificate and let Apple notarizes it for you. This
   boilerplate doesn't include the notarization setup as of the `3.0.0` release,
   but up until now, you should still be able to run your Electron app by
   allowing your app to be opened in `System Preferences -> Security & Privacy
   -> General` without notarizing it for still (tested on `macOS 11.1`).

   If you want to notarization your app using this boilerplate before those
   settings are included in the future updates, you can try follow the guides on
   issue [electron-builder #3870].

2. [`electron-builder@22.10.4`] added Apple Silicon and universal binary
   supports, but it's still a pre-release instead of a stable one so the one
   included in this boilerplate is still staying on `22.9.1` which doesn't
   support building the universal binary yet.