import { ipcRenderer } from "electron";
import * as React from "react";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { AccountRow, InputRow, OutputRow } from "_/main/types";
import AccountsTable from "./AccountsTable";
import RightNav from "./RightNav";
import Tabs from "./Tabs";
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
	const [errorOutputData, setErrorOutputData] = useState<Array<ReactOutputRow>>();
	const [activeTab, setActiveTab] = useState<string>("Accounts");
	const [status, setStatus] = useState<string>("");

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

	// useEffect(() => {
	// 	if (accountsData && inputData) {
	// 		const { outputJSON, errors } = parsely(accountsData, inputData);
	// 		if(outputJSON.length) {
	// 			setOutputData(outputJSON);
	// 		}
	// 		if(errors.length) {
	// 			setErrorOutputData(errors);
	// 		}
	// 	} else {
	// 		setOutputData(undefined);
	// 	}
	// }, [accountsData, inputData]);

	useEffect(() => {
		ipcRenderer.send("newOutputData", outputData);
	}, [outputData]);

	const requestAccountsFile = () => {
		ipcRenderer.send("requestAccountsFile");
	};

	const requestInputFile = () => {
		ipcRenderer.send("requestInputFile");
	};

	let content = null;
	switch(activeTab) {
		case "Accounts":
			if (accountsData === null || accountsData === undefined) {
				content = <WarningCard text={"Please import an accounts file"} onClick={requestAccountsFile} />;
			} else {
				content = <AccountsTable accountsData={accountsData} />;
			}
		break;
		case "Input":
			if (inputData === null || inputData === undefined) {
				content = <WarningCard text={"Please import an input file"} onClick={requestInputFile} />;
			}
		break;
	}

	const tabs = [
		{
			label: "Accounts",
			callback: () => setActiveTab("Accounts"),
			icon: "\f19c",
		},
		{
			label: "Input",
			callback: () => setActiveTab("Input"),
			icon: "\f382"
		},
	];

	return (
		<MainContainer>
			<ContentContainer>
				<Tabs tabs={tabs} activeTab={activeTab} />
				{content}
			</ContentContainer>
			<RightNav status={status} />
		</MainContainer>
	);
}

const ContentContainer = styled.div`
	display: flex;
	flex-direction: column;
	flex-grow: 1;
`;

const MainContainer = styled.div`
	display: flex;
	flex-direction: row;
	height: 100vh;
	overflow: hidden;
	--tabs-height: 36px;
`;
