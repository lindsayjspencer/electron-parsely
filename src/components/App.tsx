import * as React from "react";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { ImportedAccountRow, ImportedInputRow, PaymentRow } from "_/main/types";
import { parsely } from "_/renderer/parsely";
import ipcComm from '../models/IpcComm';
import AccountsTable from "./AccountsTable";
import PaymentsTable from "./PaymentsTable";
import RightNav from "./RightNav";
import Tabs from "./Tabs";
import WarningCard from "./WarningCard";

export default function App() {
	const [accountsData, setAccountsData] = useState<Array<ImportedAccountRow>>();
	const [inputData, setInputData] = useState<Array<ImportedInputRow>>();
	const [paymentRows, setPaymentRows] = useState<Array<PaymentRow>>();
	const [activeTab, setActiveTab] = useState<string>("Accounts");
	const [rightNavContent, setRightNavContent] = useState<JSX.Element | null>(null);
	const [status, setStatus] = useState<string>("");

	const Ipc = ipcComm.getInstance();

	useEffect(() => {
		Ipc.onLoad();
		Ipc.addEventListener("accountsData", setAccountsData);
		Ipc.addEventListener("inputData", setInputData);
		Ipc.addEventListener("status", setStatus);
	}, []);

	useEffect(() => {
		if(accountsData && inputData) {
			setPaymentRows(parsely(accountsData, inputData));
		} else {
			setPaymentRows(undefined);
		}
	}, [inputData, accountsData]);

	let content = null;
	switch(activeTab) {
		case "Accounts":
			if (accountsData === null || accountsData === undefined) {
				content = <WarningCard text={"Please import an accounts file"} onClick={Ipc.requestAccountsFile} />;
			} else {
				content = <AccountsTable accountsData={accountsData} setRightNavContent={setRightNavContent} />;
			}
		break;
		case "Payments":
			if (inputData === null || inputData === undefined) {
				content = <WarningCard text={"Please import an input file"} onClick={Ipc.requestInputFile} />;
			} else {
				content = paymentRows ? <PaymentsTable paymentRows={paymentRows} setRightNavContent={setRightNavContent} /> : null;
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
			label: "Payments",
			callback: () => setActiveTab("Payments"),
			icon: "\f382"
		},
	];

	return (
		<MainContainer>
			<ContentContainer>
				<Tabs tabs={tabs} activeTab={activeTab} />
				{content}
			</ContentContainer>
			<RightNav status={status}>
				{rightNavContent}
			</RightNav>
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

	-webkit-touch-callout: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    cursor: default;
`;
