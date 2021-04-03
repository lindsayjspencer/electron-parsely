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
import { parsely } from "_/renderer/parsely";
import Store from "./Store";
import { ImportedAccountRow, ImportedInputRow, PaymentRow } from "./types";

const jsonexport = require("jsonexport");
const csv = require("csvtojson");
const fs = require("fs");

const setAccounts = (data: ImportedAccountRow[] | null) => {
	store.set("accountsData", data);
}

const setInputData = (data: ImportedInputRow[] | null) => {
	store.set("inputData", data);
}

const setPayments = (data: PaymentRow[] | null) => {
	store.set("paymentsData", data);
}

const checkDataAndAggregate = () => {
	const inputData = store.get("inputData");
	const accountsData = store.get("accountsData");
	if(accountsData && inputData) {
		const paymentsData = parsely(accountsData, inputData);
		setPayments(paymentsData);
		mainWindow?.webContents.send("paymentsData", paymentsData);
	}
}

const loadStoreData = () => {

	const accountsData = store.get("accountsData");
	const inputData = store.get("inputData");
	let paymentsData = store.get("paymentsData");

	if(accountsData && inputData && !paymentsData) {
		//do parsely
		paymentsData = parsely(accountsData, inputData);
		setPayments(paymentsData);
	}
	
	mainWindow?.webContents.send("accountsData", accountsData);
	mainWindow?.webContents.send("inputData", inputData);
	mainWindow?.webContents.send("paymentsData", paymentsData);
	
}

let mainWindow: Electron.BrowserWindow | null;

function createWindow(): void {
	// Create the browser window.
	mainWindow = new BrowserWindow({
		show: false,
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
			mainWindow?.maximize();
			mainWindow?.show();
			if(process.env.NODE_ENV !== "production") {
				mainWindow?.webContents.openDevTools();
			}
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
					label: "Reset payment data",
					click() {
						resetPaymentData();
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
		accountsData: null,
		inputData: null,
		paymentsData: null,
	},
});

const resetAccountsFile = () => {
	store.set("accountsData", null);
	mainWindow?.webContents.send("accountsData", null);
};

const resetInputFile = () => {
	store.set("inputData", null);
	mainWindow?.webContents.send("inputData", null);
};

const resetPaymentData = () => {
	store.set("paymentsData", null);
	mainWindow?.webContents.send("paymentsData", null);
};

const acceptedExtensions = ["csv", "xls", "xlsx", "txt"];

// Load store data
ipcMain.on("onLoad", async (event, arg) => {
	loadStoreData();
});

// Request new accounts file
ipcMain.on("requestAccountsFile", async (event, arg) => {
	requestAccountsJSON();
});

// Request new inputs file
ipcMain.on("requestInputFile", async (event, arg) => {
	requestInputJSON();
});

// Save accounts file
ipcMain.on("saveAccountsFile", async (event, arg) => {
	saveAccountsFile();
});

// Save payments file
ipcMain.on("savePaymentsFile", async (event, arg) => {
	savePaymentsFile(arg);
});

// Set accounts data
ipcMain.on("setAccountsData", async (event, arg) => {
	setAccounts(arg);
});

// Set payments data
ipcMain.on("setPaymentsData", async (event, arg) => {
	setPayments(arg);
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

		mainWindow?.webContents.send("accountsData", store.get("accountsData"));
		
		checkDataAndAggregate();
		
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

		setInputData(formattedInputJSON);

		mainWindow?.webContents.send("inputData", store.get("inputData"));

		checkDataAndAggregate();
		
		sendStatus("Input file selected");		

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