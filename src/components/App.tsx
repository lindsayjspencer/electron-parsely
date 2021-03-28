import { ipcRenderer } from 'electron';
import * as React from 'react';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { AccountRow, InputRow, OutputRow } from '_/main/types';
import BottomNav from './BottomNav';
import OutputTable from './OutputTable';
import WarningCard from './WarningCard';

export interface ReactInputRow extends InputRow {
	selected: boolean;
}

export interface ReactOutputRow extends OutputRow {
	selected: boolean;
}

export default function App() {

	const [accountsData, setAccountsData] = useState<Array<AccountRow>>();
	const [inputData, setInputData] = useState<Array<ReactInputRow>>();
	const [outputData, setOutputData] = useState<Array<ReactOutputRow>>();
	const [errorOutputData, setErrorOutputData] = useState<Array<ReactInputRow>>();
	const [status, setStatus] = useState<string>("");

	useEffect(() => {
		ipcRenderer.send('onLoad');
		ipcRenderer.on('accountsData', (event, data) => {
			setAccountsData(data);
		});
		ipcRenderer.on('inputData', (event, data) => {
			data.map((row: InputRow) => {
				return {
					...row,
					selected: false
				}
			})
			setInputData(data);
		});
		ipcRenderer.on('outputData', (event, data) => {
			data.map((row: OutputRow) => {
				return {
					...row,
					selected: false
				}
			})
			setOutputData(data);
		});
		ipcRenderer.on('errorOutputData', (event, data) => {
			data.map((row: InputRow) => {
				return {
					...row,
					selected: false
				}
			})
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

	const onRowClick = (outputLine: ReactOutputRow | ReactInputRow) => {
		if(outputData) {
			const outputDataCopy = [...outputData];
			var index: ReactOutputRow | ReactInputRow | undefined = outputDataCopy?.find(x=>x===outputLine);
			if(index) {
				index.selected = !index.selected;
				setOutputData(outputDataCopy);
				return;
			}
		}
		if(errorOutputData) {
			const errorOutputDataCopy = [...errorOutputData];
			var index: ReactOutputRow | ReactInputRow | undefined = errorOutputDataCopy?.find(x=>x===outputLine);
			if(index) {
				index.selected = !index.selected;
				setErrorOutputData(errorOutputDataCopy);
				return;
			}
		}
	}

	let content = null;
	if(accountsData === null) {
		content = <WarningCard text={"Please import an accounts file"} onClick={requestAccountsFile} />
	} else if(inputData === null) {
		content = <WarningCard text={"Please import an input file"} onClick={requestInputFile} />;
	} else if(outputData !== null && outputData !== undefined) {
		content = <OutputTable outputData={outputData} errorData={errorOutputData} onRowClick={onRowClick} />;
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