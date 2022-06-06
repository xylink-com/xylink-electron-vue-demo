"use strict";

import {
  app,
  BrowserWindow,
  globalShortcut,
  ipcMain,
  screen,
  protocol,
} from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import * as path from "path";

const isDevelopment = process.env.NODE_ENV !== "production";

console.log("process info:", {
  electron: process.versions.electron,
  architecture: process.env.PROCESSOR_ARCHITECTURE,
  node: process.versions.node,
  chrome: process.versions.chrome,
  userData: app.getPath("userData"),
  appdata: app.getPath("appData"),
  temp: app.getPath("temp"),
  exe: app.getPath("exe"),
  logs: app.getPath("logs"),
  app: app.getAppPath(),
});

// 副屏窗口引用
let externalWindow = null;
// 主窗口引用
let mainWindow;

protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } },
]);

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 660,
    webPreferences: {
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      contextIsolation: false,
      enableRemoteModule: true,
    },
    title: "小鱼Electron Vue Dev",
  });

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    if (!process.env.IS_TEST) mainWindow.webContents.openDevTools();
  } else {
    createProtocol("app");
    mainWindow.loadURL("app://./index.html");
  }

  mainWindow.on("closed", () => {
    mainWindow = null;

    // 关闭主窗口时，也同时关闭副屏窗口
    externalWindow && externalWindow.close();
  });
}

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  globalShortcut.unregister("CommandOrControl+Shift+I");

  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    ipcMain.removeAllListeners();
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createMainWindow();
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  createMainWindow();

  // 注册快捷键
  globalShortcut.register("CommandOrControl+Shift+I", () => {
    let focusWin = BrowserWindow.getFocusedWindow();

    focusWin && focusWin.toggleDevTools();
  });

  ipcMain.on("relaunch", (event, arg) => {
    if (arg) {
      app.relaunch();
      app.exit(0);
    }
  });

  // 主窗口通知主进程关闭外接屏幕窗口
  ipcMain.on("closeExternalWindow", (event, msg) => {
    console.log("closed external window");

    if (msg) {
      externalWindow && externalWindow.close();
    }
  });

  // 打开外接屏
  ipcMain.on("openWindow", (event, arg) => {
    if (arg) {
      const displays = screen.getAllDisplays();
      const externalDisplay = displays.find((display) => {
        return display.bounds.x !== 0 || display.bounds.y !== 0;
      });

      console.log("externalDisplay: ", externalDisplay);

      if (externalWindow) {
        externalWindow.close();
      }

      if (externalDisplay) {
        externalWindow = new BrowserWindow({
          x: externalDisplay.bounds.x + 50,
          y: externalDisplay.bounds.y + 50,
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
            process.env.WEBPACK_DEV_SERVER_URL + "#/slave"
          );

          if (!process.env.IS_TEST) externalWindow.webContents.openDevTools();
        } else {
          createProtocol("app");
          externalWindow.loadURL("app://./index.html#/slave");
        }

        externalWindow.webContents.on("did-finish-load", () => {
          const winId = {
            externalId: externalWindow.webContents.id,
            mainId: mainWindow.webContents.id,
          };

          // 向外接屏幕发送当前窗口和主窗口的窗口id信息，便于渲染进程之间通信
          mainWindow.webContents.send("currentWindowId", winId);
          externalWindow.webContents.send("currentWindowId", winId);

          mainWindow.webContents.send("domReady", true);
        });

        externalWindow.once("ready-to-show", () => {
          externalWindow.show();
        });

        externalWindow.on("close", () => {
          console.log("close external window");

          if (mainWindow) {
            mainWindow.webContents.send("closedExternalWindow", true);
          }

          externalWindow.webContents.send("closedExternalWindow", true);
        });

        externalWindow.on("closed", () => {
          console.log("closed external window");

          externalWindow = null;
        });
      } else {
        mainWindow.webContents.send("secondWindow", false);
      }
    }
  });
});

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
