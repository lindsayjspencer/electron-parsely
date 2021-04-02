import * as React from "react";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { v4 as uuid } from 'uuid';
import { ImportedAccountRow, ImportedInputRow, PaymentRow } from "_/main/types";
import ipcComm from '../models/IpcComm';
import AccountsTable from "./Accounts/AccountsTable";
import PaymentsTable from "./Payments/PaymentsTable";
import RightNav from "./RightNav";
import Tabs from "./Tabs";
import WarningCard from "./WarningCard";

export default function App() {

	// Data
	const [accountsData, setAccountsData] = useState<Array<ImportedAccountRow>>();
	const [accountsMap, setAccountsMap] = useState<Map<string, ImportedAccountRow>>();
	const [inputData, setInputData] = useState<Array<ImportedInputRow>>();
	const [paymentsData, setPaymentsData] = useState<Array<PaymentRow>>();

	// App state
	const [activeTab, setActiveTab] = useState<string>("Accounts");
	const [rightNavContent, setRightNavContent] = useState<JSX.Element | null>(null);
	const [status, setStatus] = useState<string>("");

	// Communication
	const Ipc = ipcComm.getInstance();

	useEffect(() => {
		Ipc.onLoad();
		Ipc.addEventListener("accountsData", setAccountsData);
		Ipc.addEventListener("inputData", setInputData);
		Ipc.addEventListener("paymentsData", setPaymentsData);
		Ipc.addEventListener("status", setStatus);
	}, []);

	// Update accounts map
	useEffect(() => {
		if(!accountsData) return;
		const accountsMap = new Map();
		for (const line of accountsData) {
			accountsMap.set(line.uuid, line);
		}
		setAccountsMap(accountsMap);
	}, [accountsData]);

	// Update payments
	useEffect(() => {
		if(!accountsData || !accountsMap || !inputData || !paymentsData) return;
		const newPaymentsData = [...paymentsData];
		for (const payment of newPaymentsData) {
			if(payment.accountUuid) {
				if(!accountsMap.get(payment.accountUuid)) {
					payment.accountUuid = undefined;
					payment.account = undefined;
					while(payment.inputRows.length > 1) {
						const input = payment.inputRows.pop();
						if(input) {
							newPaymentsData.push({
								account: undefined,
								accountUuid: undefined,
								inputRows: [input],
								uuid: uuid()
							});
						}
					}
				}
			} else {
				var accountLine = accountsData.find((x) => {
					return (
						x.Name === payment.inputRows[0].NaamCrediteur ||
						x.Code === payment.inputRows[0].CodeCrediteur
					);
				});
				if(accountLine) {
					payment.accountUuid = accountLine.uuid;
				}
			}
		}
		Ipc.setPaymentsData(newPaymentsData);
		setPaymentsData(newPaymentsData);
	}, [accountsMap]);

	// Tabs
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
	
	let content = null;
	switch(activeTab) {
		case "Accounts":
			if (accountsData === null || accountsData === undefined) {
				content = <WarningCard text={"Please import an accounts file"} onClick={Ipc.requestAccountsFile} setRightNavContent={setRightNavContent} />;
			} else {
				content = <AccountsTable accountsData={[...accountsData].sort((x, y) => x.Name.localeCompare(y.Name))} setRightNavContent={setRightNavContent} setAccountsData={setAccountsData} />;
			}
		break;
		case "Payments":
			if (inputData === null || inputData === undefined) {
				content = <WarningCard text={"Please import an input file"} onClick={Ipc.requestInputFile} setRightNavContent={setRightNavContent} />;
			} else {
				content = paymentsData && accountsMap ? <PaymentsTable paymentRows={paymentsData} accountsMap={accountsMap} setPaymentsData={setPaymentsData} setRightNavContent={setRightNavContent} /> : null;
			}
		break;
	}

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
