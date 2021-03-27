import { ipcRenderer } from 'electron';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { AccountRow, InputRow, OutputRow } from '_/main/types';
import BottomNav from './BottomNav';
import OutputTable from './OutputTable';
import WarningNoAccounts from './WarningNoAccounts';
import WarningNoInput from './WarningNoInput';

export default function App() {

	const [accountsData, setAccountsData] = useState<Array<AccountRow>>();
	const [inputData, setInputData] = useState<Array<InputRow>>();
	const [outputData, setOutputData] = useState<Array<OutputRow>>();
	const [status, setStatus] = useState<string>("");

	useEffect(() => {
		ipcRenderer.send('getAccountsData');
		ipcRenderer.on('accountsData', (event, data) => {
			setAccountsData(data);
		});
		ipcRenderer.send('getInputData');
		ipcRenderer.on('inputData', (event, data) => {
			setInputData(data);
		});
		ipcRenderer.send('getOutputData');
		ipcRenderer.on('outputData', (event, data) => {
			setOutputData(data);
		});
	}, [])

	let content = null;
	if(accountsData === null) {
		content = <WarningNoAccounts />
	} else if(inputData === null) {
		content = <WarningNoInput />;
	} else if(outputData !== null && outputData !== undefined) {
		content = <OutputTable outputData={outputData} />;
	}

	return (
		<div className="main">
			{content}
			<BottomNav status={status} />
		</div>
	)
	
}