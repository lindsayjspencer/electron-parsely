import { ipcRenderer } from "electron";
import { ImportedAccountRow } from "_/main/types";

export default class IpcComm {

	private static instance: IpcComm;

	private callbacks: {
		[key: string]: Array<(data: any) => void>;
	}

	private constructor() {
		this.callbacks = {
			"accountsData": [],
			"inputData": [],
			"status": [],
		};
		this.setupListeners();
	}

    public static getInstance(): IpcComm {
        if (!IpcComm.instance) {
            IpcComm.instance = new IpcComm();
        }

        return IpcComm.instance;
    }

	public onLoad = () => {
		ipcRenderer.send("onLoad");
	}

	private setupListeners = () => {

		ipcRenderer.on("accountsData", (event, data) => {
			this.onNewAccountsData(data);
		});
		ipcRenderer.on("inputData", (event, data) => {
			this.onNewInputData(data);
		});
		ipcRenderer.on("status", (event, data) => {
			this.onNewStatus(data);
		});

	}

	public addEventListener = (event: string, callback: (data: any) => void) => {
		this.callbacks[event].push(callback);
	}

	public removeEventListener = (event: string, callback: (data: any) => void) => {
		const index = this.callbacks[event].findIndex(x=>x===callback);
		if(index != -1) {
			this.callbacks[event].splice(index, 1);
		}
	}

	private onNewAccountsData = (data: any) => {
		for (const callback of this.callbacks["accountsData"]) {
			callback(data);
		}
	}

	private onNewInputData = (data: any) => {
		for (const callback of this.callbacks["inputData"]) {
			callback(data);
		}
	}

	private onNewStatus = (data: any) => {
		for (const callback of this.callbacks["status"]) {
			callback(data);
		}
	}

	public requestAccountsFile = () => {
		ipcRenderer.send("requestAccountsFile");
	};

	public requestInputFile = () => {
		ipcRenderer.send("requestInputFile");
	};

	public saveAccountsFile = () => {
		ipcRenderer.send("saveAccountsFile");
	};

	public savePaymentsFile = () => {
		ipcRenderer.send("savePaymentsFile");
	};

	public setAccountsData = (data: ImportedAccountRow[]) => {
		ipcRenderer.send("setAccountsData", data);
	};

}