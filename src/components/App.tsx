import { ipcRenderer } from "electron";
import * as React from "react";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { AccountRow, InputRow, OutputRow } from "_/main/types";
import OutputTable from "./OutputTable";
import RightNav from "./RightNav";
import WarningCard from "./WarningCard";

export interface ReactInputRow extends InputRow {
	selected: boolean;
}

export interface ReactOutputRow extends OutputRow {
	selected: boolean;
}

export default function App() {
	const [accountsData, setAccountsData] = useState<Array<AccountRow>>();
	const [inputData, setInputData] = useState<Array<InputRow>>();
	const [outputData, setOutputData] = useState<Array<ReactOutputRow>>();
	const [errorOutputData, setErrorOutputData] = useState<
		Array<ReactOutputRow>
	>();
	const [status, setStatus] = useState<string>("");

	const parsely = (
		accountsJSON: Array<AccountRow>,
		inputJSON: Array<InputRow>
	) => {
		//New empty array for outputs
		var combinedArray: Array<AccountRow & InputRow> = [];
		var errors: any = [];

		//Loop through lines of input
		inputJSON.forEach((inputLine) => {
			//Search for matching "Name", mark accountLine true if found
			var accountLine = accountsJSON.find((x) => {
				return (
					x.Name === inputLine.NaamCrediteur ||
					x.Code === inputLine.CodeCrediteur
				);
			});
			//If no match
			if (!accountLine) {
				// console.log(`Account ${inputLine.NaamCrediteur} not found`);
				errors.push({
					Name: inputLine.NaamCrediteur,
					Account: undefined,
					Routing: undefined,
					Type: undefined,
					Amount: inputLine.Saldo,
					selected: false
				});
				return;
			}
			//Push to output array: everything on input line and everything on matching line in account info file
			combinedArray.push({
				...inputLine,
				...accountLine,
			});
		});

		//Map output arrays to output object
		const outputJSON: Array<ReactOutputRow> = combinedArray.map((line) => {
			return {
				Name: line.Name,
				Account: line.Account,
				Routing: line.Routing,
				Type: line.Type,
				Amount: line.Saldo,
				selected: false
			};
		});

		return {
			outputJSON,
			errors,
		};
	};

	useEffect(() => {
		ipcRenderer.send("onLoad");
		ipcRenderer.on("accountsData", (event, data) => {
			setAccountsData(data);
		});
		ipcRenderer.on("inputData", (event, data) => {
			setInputData(data);
		});
		ipcRenderer.on("status", (event, data) => {
			setStatus(data);
		});
	}, []);

	useEffect(() => {
		if (accountsData && inputData) {
			const { outputJSON, errors } = parsely(accountsData, inputData);
			if(outputJSON.length) {
				setOutputData(outputJSON);
			}
			if(errors.length) {
				setErrorOutputData(errors);
			}
		} else {
			setOutputData(undefined);
		}
	}, [accountsData, inputData]);

	useEffect(() => {
		ipcRenderer.send("newOutputData", outputData);
	}, [outputData]);

	const requestAccountsFile = () => {
		ipcRenderer.send("requestAccountsFile");
	};

	const requestInputFile = () => {
		ipcRenderer.send("requestInputFile");
	};

	const onRowClick = (outputLine: ReactOutputRow | ReactInputRow) => {};

	let content = null;
	if (accountsData === null) {
		content = (
			<WarningCard
				text={"Please import an accounts file"}
				onClick={requestAccountsFile}
			/>
		);
	} else if (inputData === null) {
		content = (
			<WarningCard
				text={"Please import an input file"}
				onClick={requestInputFile}
			/>
		);
	} else if (outputData !== null && outputData !== undefined) {
		content = (
			<OutputTable
				outputData={outputData}
				errorData={errorOutputData}
				onRowClick={onRowClick}
			/>
		);
	}

	return (
		<MainContainer>
			{content}
			<RightNav status={status} />
		</MainContainer>
	);
}

const MainContainer = styled.div`
	display: flex;
	flex-direction: row;
	height: 100vh;
	overflow: hidden;
`;
