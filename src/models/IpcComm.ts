import { ipcRenderer } from "electron";
import { ImportedAccountRow, PaymentRow } from "_/main/types";

const IpcEvents: string[] = [
	"accountsData",
	"inputData",
	"paymentsData",
	"status"
]

export default class IpcComm {

	private static instance: IpcComm;
	private static events: string[];

	private callbacks: {
		[key: string]: Array<(data: any) => void>;
	}

	private constructor() {
		this.callbacks = {};
		for(const event of IpcEvents) {
			this.callbacks[event] = [];
		}
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

		for (const event of IpcEvents) {
			ipcRenderer.on(event, (e, data) => {
				this.onEventTrigger(event, data);
			});
		}

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

	private onEventTrigger = (event: string, data: any) => {
		for (const callback of this.callbacks[event]) {
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

	public savePaymentsFile = (data: PaymentRow[]) => {
		ipcRenderer.send("savePaymentsFile", data);
	};

	public setAccountsData = (data: ImportedAccountRow[]) => {
		ipcRenderer.send("setAccountsData", data);
	};

	public setPaymentsData = (data: PaymentRow[]) => {
		ipcRenderer.send("setPaymentsData", data);
	};

}