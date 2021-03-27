export interface AccountRow {
	Name: string;
	Code: string;
	Account: string;
	Routing: string;
	Type: string;
}

export interface InputRow {
	NaamCrediteur: string;
	CodeCrediteur: string;
	Saldo: string;
}

export interface OutputRow {
	Name: string;
	Account: string;
	Routing: string;
	Type: string;
	Amount: string;
}

export interface StoreOptions {
	configName: string;
	defaults: StoreDefaults;
}

export interface StoreDefaults {
	accounts: Array<AccountRow> | null;
	currentInput: Array<InputRow> | null;
}