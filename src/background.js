"use strict";

import {
  app,
  protocol,
  BrowserWindow,
  Menu,
  globalShortcut,
  ipcMain,
  screen,
  webContents,
} from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import * as path from "path";
import { format as formatUrl } from "url";
import log from "electron-log";

const isDevelopment = process.env.NODE_ENV !== "production";

// 必须提前定义好，存储视频流数据
global.sharedObject = {
  videoFrames: {},
};

let win;
let externalWindow;

let number = ""; // 会议号
const PROTOCOL = "xy-vue-electron";

// app.removeAsDefaultProtocolClient(PROTOCOL, process.execPath, [path.resolve(process.argv[1] || '')])

function registerScheme() {
  if (process.platform === "win32") {
    let args = [];
    if (!app.isPackaged) {
      args.push(path.resolve(process.argv[1]));
    }
    args.push("--");

    if (!app.isDefaultProtocolClient(PROTOCOL, process.execPath, args)) {
      app.setAsDefaultProtocolClient(PROTOCOL, process.execPath, args);
    }
    app.setAsDefaultProtocolClient(PROTOCOL, process.execPath, args);

    handleArgv(args);
  } else {
    if (!app.isDefaultProtocolClient(PROTOCOL)) {
      app.setAsDefaultProtocolClient(PROTOCOL);
    }
  }
}

registerScheme();

function handleArgv(argv) {
  const prefix = `${PROTOCOL}:`;

  const offset = app.isPackaged ? 1 : 2;
  const url = argv.find((arg, i) => i >= offset && arg.startsWith(prefix));
  if (url) handleUrl(url);
}

function handleUrl(url) {
  // xy-vue-electron://joinMeeting?number=123
  const urlObj = new URL(url);
  const { searchParams } = urlObj;
  number = searchParams.get("number") || "";

  // createWindow可传入此参数，做其他业务处理
  log.info("handleUrl number:", number);
}

function createWindow() {
  console.log(
    "process.env.ELECTRON_NODE_INTEGRATION: ",
    process.env.ELECTRON_NODE_INTEGRATION
  );

  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      contextIsolation: false,
      enableRemoteModule: true,
    },
  });

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    if (!process.env.IS_TEST) win.webContents.openDevTools();
  } else {
    createProtocol("app");
    win.loadURL("app://./index.html");
  }

  win.on("closed", () => {
    win = null;
  });

  ipcMain.on("relaunch", (event, arg) => {
    if (arg) {
      app.relaunch();
      app.exit(0);
    }
  });

  ipcMain.on("externalLayout", (event, msg) => {
    if (msg && externalWindow) {
      externalWindow.webContents.send("externalLayout", msg);
    }
  });

  ipcMain.on("closeExternalWindow", (event, msg) => {
    if (msg) {
      externalWindow && externalWindow.close();
    }
  });

  ipcMain.on("ScreenInfo", (event, msg) => {
    if (msg && externalWindow) {
      externalWindow.webContents.send("ScreenInfo", msg);
    }
  });

  ipcMain.on("set-video-frame", (event, msg) => {
    if (msg && externalWindow) {
      externalWindow.webContents.send("set-video-frame", msg);
    }
  });

  // 打开外接屏
  ipcMain.on("openWindow", (event, arg) => {
    if (arg) {
      const displays = screen.getAllDisplays();

      const externalDispaly = displays.find((display) => {
        return display.bounds.x !== 0 || display.bounds.y !== 0;
      });

      console.log("args: ", arg);
      console.log("displays: ", displays);
      console.log("externalDispaly: ", externalDispaly);

      if (externalWindow) {
        externalWindow.close();
      }

      if (externalDispaly) {
        externalWindow = new BrowserWindow({
          x: externalDispaly.bounds.x + 50,
          y: externalDispaly.bounds.y + 50,
          width: 1000,
          height: 660,
          backgroundColor: "#fff",
          titleBarStyle: "hidden",
          webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
          },
          title: "小鱼Electron 外接屏幕",
          icon: path.join(__static, "logo.png"),
        });

        if (isDevelopment) {
          externalWindow.loadURL(
            process.env.WEBPACK_DEV_SERVER_URL + "#/external"
          );

          if (!process.env.IS_TEST) externalWindow.webContents.openDevTools();
        } else {
          externalWindow.loadURL(
            formatUrl({
              pathname: path.join(__dirname, "index.html"),
              protocol: "file",
              slashes: false,
              hash: "external",
            })
          );
        }

        // 监听页面是否加载完成，完成之后则开始进行数据的传递
        externalWindow.webContents.on("did-finish-load", () => {
          win.webContents.send("domReady", true);
        });

        externalWindow.webContents.on("did-fail-load", () => {
          console.log("did-fail-load");
        });

        externalWindow.once("ready-to-show", () => {
          externalWindow.show();
        });

        externalWindow.on("closed", () => {
          externalWindow = null;

          if (win) {
            win.webContents.send("closedExternalWindow", true);
          }
        });
      } else {
        win.webContents.send("secondWindow", false);
      }
    }
  });
}

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  // Quit when all windows are closed.
  app.on("window-all-closed", () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== "darwin") {
      app.quit();
    }
  });

  app.on("second-instance", (event, argv) => {
    handleArgv(argv);
  });

  app.on("activate", () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on("ready", async () => {
    if (isDevelopment && !process.env.IS_TEST) {
      // Install Vue Devtools
      // Devtools extensions are broken in Electron  6/7/<8.25 on Windows
      // See https://github.com/nklayman/vue-cli-plugin-electron-builder/issues/378 for more info
      // Electron will not launch with Devtools extensions installed on Windows 10 with dark mode
      // If you are not using Windows 10 dark mode, you may uncomment the following lines (and the import at the top of the file)
      // In addition, if you upgrade to Electron ^8.2.5 or ^9.0.0 then devtools should work fine
      // try {
      //   await installExtension(VUEJS_DEVTOOLS)
      // } catch (e) {
      //   console.error('Vue Devtools failed to install:', e.toString())
      // }
    }
    createWindow();
  });
}

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === "win32") {
    process.on("message", (data) => {
      if (data === "graceful-exit") {
        app.quit();
      }
    });
  } else {
    process.on("SIGTERM", () => {
      app.quit();
    });
  }
}
