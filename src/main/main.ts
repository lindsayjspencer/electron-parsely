/**
 * Entry point of the Election app.
 */
// eslint-disable-next-line import/no-extraneous-dependencies
import { app, BrowserWindow, dialog, ipcMain, Menu } from "electron";
import xlsx from 'node-xlsx';
import * as path from "path";
import * as url from "url";
import { v4 as uuid } from 'uuid';
import { formatCurrency } from "_/renderer/helpers";
import Store from "./Store";
import { ImportedAccountRow, InputRow, OutputRow, PaymentRow } from "./types";

const jsonexport = require("jsonexport");
const csv = require("csvtojson");
const fs = require("fs");

let outputData: OutputRow[] | null;

const setAccounts = (data: ImportedAccountRow[] | null) => {
	store.set("accounts", data);
	mainWindow?.webContents.send("accountsData", data);
}

const setCurrentInput = (data: InputRow[] | null) => {
	store.set("currentInput", data);
	mainWindow?.webContents.send("inputData", data);
}

const setOutputData = (data: OutputRow[] | null) => {
	outputData = data;
}

const loadStoreData = () => {
	setAccounts(store.get("accounts"));
	setCurrentInput(store.get("currentInput"));
}

let mainWindow: Electron.BrowserWindow | null;

function createWindow(): void {
	// Create the browser window.
	mainWindow = new BrowserWindow({
		height: 800,
		width: 1200,
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
						requestAccountsJSON();
					},
				},
				{
					label: "Import input file",
					click() {
						requestInputJSON();
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
				},
				{
					label: "Reload",
					click() {
						mainWindow?.reload();
					}
				}
			],
		},
	]);
	Menu.setApplicationMenu(menu);
	
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
	mainWindow?.webContents.send("accountsData", null);
};

const resetInputFile = () => {
	store.set("currentInput", null);
	mainWindow?.webContents.send("inputData", null);
};

const acceptedExtensions = ["csv", "xls", "xlsx", "txt"];

// Get state
ipcMain.on("onLoad", async (event, arg) => {
	loadStoreData();
});
ipcMain.on("newOutputData", async (event, arg) => {
	setOutputData(arg);
});

ipcMain.on("requestAccountsFile", async (event, arg) => {
	requestAccountsJSON();
});
ipcMain.on("requestInputFile", async (event, arg) => {
	requestInputJSON();
});

ipcMain.on("saveAccountsFile", async (event, arg) => {
	saveAccountsFile();
});

ipcMain.on("savePaymentsFile", async (event, arg) => {
	savePaymentsFile(arg);
});

ipcMain.on("setAccountsData", async (event, arg) => {
	setAccounts(arg);
});
// ipcMain.on("requestInputFile", async (event, arg) => {
// 	getInputJSON();
// });

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
		case "xlsx":
			const data = xlsx.parse(filename)[0].data;
			const headers: Array<string> = data[0] as unknown as Array<string>;
			data.shift();
			const returnData = data.map((line) => {
				const returnLine: { [key: string]: any } = {};
				headers.forEach((header, i) => {
					returnLine[header] = line[i];
				});
				return returnLine;
			})
			return returnData;
	}
}

const requestAccountsJSON = async () => {
	if (!mainWindow) return;

	dialog.showOpenDialog(mainWindow).then(async (res) => {
		if (res.canceled) {
			sendStatus("No file selected");
			return;
		}

		if(!validateExtension(acceptedExtensions, res.filePaths[0])) return;

		const accountsJSON = await loadFileSwitch(res.filePaths[0]);

		if (!Array.isArray(accountsJSON)) return;

		const formattedAccountsJSON = accountsJSON.map((row) => {
			return {
				...row,
				uuid: uuid()
			}
		})

		setAccounts(formattedAccountsJSON);
		
		sendStatus("Accounts file selected");		

	});
};

const requestInputJSON = async () => {
	if (!mainWindow) return;

	dialog.showOpenDialog(mainWindow).then(async (res) => {
		if (res.canceled) {
			sendStatus("No file selected");
			return;
		}

		if(!validateExtension(acceptedExtensions, res.filePaths[0])) return;

		const inputJSON = await loadFileSwitch(res.filePaths[0]);

		if (!Array.isArray(inputJSON)) return;

		const formattedInputJSON = inputJSON.map((row) => {
			return {
				...row,
				uuid: uuid()
			}
		})

		setCurrentInput(formattedInputJSON);
		
		sendStatus("Input file selected");		

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
				sendStatus("Output saved succesfully");			
			});
		});
	});
};

const saveAccountsFile = async () => {
	if (!mainWindow) return;

	const accountsData = store.get("accounts") as ImportedAccountRow[];

	if(!accountsData) {
		sendStatus("No data to save");
		return;
	}

	const formattedData = accountsData.map((line) => {
		return {
			Code: line.Code,
			Name: line.Name,
			Account: line.Account,
			Routing: line.Routing,
			Type: line.Type
		}
	});

	dialog.showSaveDialog(mainWindow).then(async (res) => {
		if (res.canceled) {
			sendStatus("No file selected");
			return;
		}
		jsonexport(formattedData, function (err: string, file: string) {
			fs.writeFile(res.filePath, file, function (err: string) {
				if (err) {
					return;
				}
				sendStatus("Accounts saved succesfully");			
			});
		});
	});
};

const savePaymentsFile = async (data: PaymentRow[]) => {
	if (!mainWindow) return;

	if(!data || data.length === 0) {
		sendStatus("No data to save");
		return;
	}

	const filteredData = data.filter((line) => line.account!==undefined);

	const mappedData = filteredData.map((line) => {
		let Amount = 0;
		for (const input of line.inputRows) {
			Amount += +input.Betaalwaarde;
		}
		const formattedAmount = formatCurrency(Amount).replaceAll(",", "");

		return {
			Name: line.account!.Name,
			Account: line.account!.Account,
			Routing: line.account!.Routing,
			Type: line.account!.Type,
			Amount: formattedAmount
		}
	});

	dialog.showSaveDialog(mainWindow).then(async (res) => {
		if (res.canceled) {
			sendStatus("No file selected");
			return;
		}
		jsonexport(mappedData, function (err: string, file: string) {
			fs.writeFile(res.filePath, file, function (err: string) {
				if (err) {
					return;
				}
				sendStatus("Payments saved succesfully");			
			});
		});
	});
};