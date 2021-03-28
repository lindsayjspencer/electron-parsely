/**
 * Entry point of the Election app.
 */
// eslint-disable-next-line import/no-extraneous-dependencies
import { app, BrowserWindow, dialog, ipcMain, Menu } from "electron";
import xlsx from 'node-xlsx';
import * as path from "path";
import * as url from "url";
import Store from "./Store";
import { AccountRow, InputRow, OutputRow } from "./types";

const parsely = require("./parsely");
const jsonexport = require("jsonexport");
const csv = require("csvtojson");
const moment = require("moment");
const fs = require("fs");

let accounts: AccountRow[] | null;
let currentInput: InputRow[] | null;
let outputData: OutputRow[] | null;

let mainWindow: Electron.BrowserWindow | null;

function createWindow(): void {
	// Create the browser window.
	mainWindow = new BrowserWindow({
		height: 600,
		width: 800,
		webPreferences: {
			nodeIntegration: true, // is default value after Electron v5
			contextIsolation: false, // protect against prototype pollution
			enableRemoteModule: true, // turn off remote
			webSecurity: false,
			devTools: process.env.NODE_ENV !== "production",
		},
	});

	// and load the index.html of the app.
	mainWindow
		.loadURL(
			url.format({
				pathname: path.join(__dirname, "./index.html"),
				protocol: "file:",
				slashes: true,
			})
		)
		.finally(() => {
			/* no action */
		});

	// Emitted when the window is closed.
	mainWindow.on("closed", () => {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		mainWindow = null;
	});

	var menu = Menu.buildFromTemplate([
		{
			label: "File",
			submenu: [
				{
					label: "Import accounts file",
					click() {
						getAccountsJSON();
					},
				},
				{
					label: "Import input file",
					click() {
						getInputJSON();
					},
				},
				{
					label: "Save output",
					click() {
						writeOutput();
					},
				},
				{ type: 'separator'},
				{
					label: "Quit",
					click() {
						app.quit();
					},
				},
			],
		},
		{
			label: "Devtools",
			submenu: [
				{
					label: "Reset accounts file",
					click() {
						resetAccountsFile();
					},
				},
				{
					label: "Reset input file",
					click() {
						resetInputFile();
					},
				},
				{
					label: "Open dev tools",
					click() {
						mainWindow?.webContents.openDevTools();
					}
				}
			],
		},
	]);
	Menu.setApplicationMenu(menu);

	accounts = store.get('accounts');
	currentInput = store.get('currentInput');
	checkFilesAndParsely();
	
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", () => {
	// On OS X it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform !== "darwin") {
		app.quit();
	}
});

app.on("activate", () => {
	// On OS X it"s common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (mainWindow === null) {
		createWindow();
	}
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.

const store = new Store({
	configName: "accounts-data",
	defaults: {
		accounts: null,
		currentInput: null,
	},
});

const resetAccountsFile = () => {
	store.set("accounts", null);
	accounts = null;
	mainWindow?.webContents.send("accountsData", null);
};

const resetInputFile = () => {
	store.set("currentInput", null);
	currentInput = null;
	mainWindow?.webContents.send("inputData", null);
};

const acceptedExtensions = ["csv", "xls", "xlsx", "txt"];

// Get state
ipcMain.on("getAccountsData", async (event, arg) => {
	event.reply("accountsData", accounts);
	checkFilesAndParsely();
});
ipcMain.on("getInputData", async (event, arg) => {
	event.reply("inputData", accounts);
	checkFilesAndParsely();
});
ipcMain.on("getOutputData", async (event, arg) => {
	event.reply("outputData", accounts);
	checkFilesAndParsely();
});

const sendStatus = (status: string) => {
	mainWindow?.webContents.send("status", status);
}

const validateExtension = (extensions: Array<string>, filename: string) => {

	// Extensions
	var extension = getFileExtension(filename);
	if(extensions.indexOf(extension)==-1) {
		sendStatus("Bad extension");
		return false;
	}
	return true;

}

const getFileExtension = (filename: string) => {
	var pieces = filename.split(".");
	return pieces[pieces.length-1];
}

const loadFileSwitch = (filename: string) => {

	const extension = getFileExtension(filename);
	switch(extension) {
		case "csv":
			return csv().fromFile(filename);
		case "xls":
			return xlsx.parse(filename);
		case "xlsx":
			return xlsx.parse(filename);
	}
}

const getAccountsJSON = async () => {
	if (!mainWindow) return;

	dialog.showOpenDialog(mainWindow).then(async (res) => {
		if (res.canceled) {
			sendStatus("No file selected");
			return;
		}

		if(!validateExtension(acceptedExtensions, res.filePaths[0])) return;

		const accountsJSON = await loadFileSwitch(res.filePaths[0]);

		console.log(accountsJSON);

		if (!Array.isArray(accountsJSON)) return;
		store.set("accounts", accountsJSON);

		mainWindow?.webContents.send("accountsData", accountsJSON);

		checkFilesAndParsely();

	});
};

const getInputJSON = async () => {
	if (!mainWindow) return;

	dialog.showOpenDialog(mainWindow).then(async (res) => {
		if (res.canceled) {
			sendStatus("No file selected");
			return;
		}

		if(!validateExtension(acceptedExtensions, res.filePaths[0])) return;

		const inputJSON = await csv().fromFile(res.filePaths[0]);

		if (!Array.isArray(inputJSON)) return;
		store.set("currentInput", inputJSON);

		mainWindow?.webContents.send("inputData", inputJSON);

		checkFilesAndParsely();

	});
};

const writeOutput = async () => {
	if (!mainWindow || !outputData) return;

	dialog.showSaveDialog(mainWindow).then(async (res) => {
		if (res.canceled) {
			sendStatus("No file selected");
			return;
		}
		jsonexport(outputData, function (err: string, file: string) {
			fs.writeFile(res.filePath, file, function (err: string) {
				if (err) {
					return;
				}
			});
		});
	});
};

const checkFilesAndParsely = async () => {
	
	if(!accounts) return;
	if(!currentInput) return;
	if(!Array.isArray(accounts)) return;
	if(!Array.isArray(currentInput)) return;

	const { outputJSON, errors } = await parsely(accounts, currentInput);
	outputData = [...outputJSON];

	mainWindow?.webContents.send("outputData", outputJSON);

}