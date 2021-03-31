export interface AccountRow extends Record<string, any> {
	Name: string;
	Code: string;
	Account: string;
	Routing: string;
	Type: string;
}

export interface ImportedAccountRow extends AccountRow {
	uuid: string;
}

export interface InputRow {
	NaamCrediteur: string;
	CodeCrediteur: string;
	Saldo: number;
}

export interface ImportedInputRow extends InputRow {
	uuid: string;
}

export interface PaymentRow {
	account: ImportedAccountRow | undefined;
	inputRows: ImportedInputRow[];
	uuid: string;
}

export interface OutputRow {
	Name: string;
	Account?: string;
	Routing?: string;
	Type?: string;
	Amount: number;
}

export interface StoreOptions {
	configName: string;
	defaults: StoreDefaults;
}

export interface StoreDefaults {
	accounts: Array<AccountRow> | null;
	currentInput: Array<InputRow> | null;
}