import { ipcRenderer } from 'electron';
import * as React from 'react';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { AccountRow, InputRow, OutputRow } from '_/main/types';
import BottomNav from './BottomNav';
import OutputTable from './OutputTable';
import WarningCard from './WarningCard';

export default function App() {

	const [accountsData, setAccountsData] = useState<Array<AccountRow>>();
	const [inputData, setInputData] = useState<Array<InputRow>>();
	const [outputData, setOutputData] = useState<Array<OutputRow>>();
	const [errorOutputData, setErrorOutputData] = useState<Array<InputRow>>();
	const [status, setStatus] = useState<string>("");

	useEffect(() => {
		ipcRenderer.send('onLoad');
		ipcRenderer.on('accountsData', (event, data) => {
			setAccountsData(data);
		});
		ipcRenderer.on('inputData', (event, data) => {
			setInputData(data);
		});
		ipcRenderer.on('outputData', (event, data) => {
			setOutputData(data);
		});
		ipcRenderer.on('errorOutputData', (event, data) => {
			setErrorOutputData(data);
		});
		ipcRenderer.on('status', (event, data) => {
			setStatus(data);
		});
	}, [])

	const requestAccountsFile = () => {
		ipcRenderer.send('requestAccountsFile');
	}

	const requestInputFile = () => {
		ipcRenderer.send('requestInputFile');
	}

	let content = null;
	if(accountsData === null) {
		content = <WarningCard text={"Please import an accounts file"} onClick={requestAccountsFile} />
	} else if(inputData === null) {
		content = <WarningCard text={"Please import an input file"} onClick={requestInputFile} />;
	} else if(outputData !== null && outputData !== undefined) {
		content = <OutputTable outputData={outputData} errorData={errorOutputData} />;
	}

	return (
		<MainContainer>
			{content}
			<BottomNav status={status} />
		</MainContainer>
	)
	
}

const MainContainer = styled.div`
	display: flex;
	flex-direction: column;
	height: 100vh;
	overflow: hidden;
`;