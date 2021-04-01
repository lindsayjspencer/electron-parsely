import * as React from 'react';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { v4 as uuid } from 'uuid';
import { ImportedAccountRow } from '_/main/types';
import ipcComm from '../models/IpcComm';
import Input from './Input';

interface AccountsTableProps {
	accountsData: ImportedAccountRow[];
	setRightNavContent: (content: JSX.Element) => void;
}

export default function AccountsTable(props: AccountsTableProps) {

	const [selectedRow, setSelectedRow] = useState<ImportedAccountRow>();
	
	const Ipc = ipcComm.getInstance();

	const onClick = (newSelection: ImportedAccountRow) => {
		setSelectedRow(current => {
			if(current === newSelection) {
				return undefined;
			} else {
				return newSelection;
			}
		});
	}

	const updateAccount = (newAccount: ImportedAccountRow) => {
		const newAccounts = [...props.accountsData];
		const index = newAccounts.findIndex(x=>x.uuid === newAccount.uuid)
		if(index !== -1) {
			newAccounts[index] = newAccount;
			Ipc.setAccountsData(newAccounts);
		}
	}

	useEffect(() => {
		props.setRightNavContent(<SelectedRowPanel accountLine={selectedRow} updateAccount={updateAccount} reset={() => setSelectedRow(undefined)} />);
	}, [selectedRow]);

	return (
		<OutputTableContainer>
			<table className="table table-striped mb-0 table-sm table-borderless text-black-50">
				<thead>
					<tr>					
						<th>Account</th>
						<th>Code</th>
						<th>Name</th>
						<th>Routing</th>
						<th>Type</th>
					</tr>					
				</thead>
				<tbody>
					{props.accountsData.map((accountLine, i) => <TableRow onClick={() => onClick(accountLine)} selected={selectedRow === accountLine} key={accountLine.uuid} accountLine={accountLine} />)}
				</tbody>
			</table>
		</OutputTableContainer>
	)
}

const OutputTableContainer = styled.div`
	max-height: calc(100vh - var(--tabs-height));
	overflow: auto;
	flex-grow: 1;

	/* width */
	::-webkit-scrollbar {
	width: 10px;
	}

	/* Track */
	::-webkit-scrollbar-track {
	background: #f1f1f1; 
	}
	
	/* Handle */
	::-webkit-scrollbar-thumb {
	background: #888; 
	}

	/* Handle on hover */
	::-webkit-scrollbar-thumb:hover {
	background: #555; 
	}

	table {
		position: relative;

		th {
			position: sticky;
			top: 0;
			background: white;
			border-top: 0;
		}
	}

`;

interface StyledTableRowProps {
	selected: boolean;
}

const StyledTableRow = styled.tr<StyledTableRowProps>`
	&&& {
		${props => props.selected ? `
			color: black;
			background: var(--gray-300);
		` : ''}
	}
`;

interface TableRowProps {
	accountLine: ImportedAccountRow;
	selected: boolean;
	onClick: () => void;
}

const TableRow = (props: TableRowProps) => {
	return (
		<StyledTableRow selected={props.selected} onClick={props.onClick}>
			<td>{props.accountLine.Account}</td>
			<td>{props.accountLine.Code}</td>
			<td>{props.accountLine.Name}</td>
			<td>{props.accountLine.Routing}</td>
			<td>{props.accountLine.Type}</td>
		</StyledTableRow>
	)
}

interface SelectedRowPanelProps {
	accountLine?: ImportedAccountRow;
	updateAccount: (newAccount: ImportedAccountRow) => void;
	reset: () => void;
}

const SelectedRowPanel = (props: SelectedRowPanelProps) => {
	
	const Ipc = ipcComm.getInstance();
	
	let content = <div className="text-center">Nothing selected</div>;
	if(props.accountLine) {
		const newAccount = { ...props.accountLine };

		const updateField = (field: string, newValue: string) => {
			newAccount[field] = newValue;
			props.updateAccount(newAccount);
		}

		content = <>
			<h4 className="mx-3">Selected row</h4>
			<InputsContainer>
				<Input key={uuid()} onBlur={(value: string) => updateField("Name", value)} label="Company name" value={props.accountLine.Name} />
				<Input key={uuid()} onBlur={(value: string) => updateField("Account", value)} label="Account number" value={props.accountLine.Account} />
				<Input key={uuid()} onBlur={(value: string) => updateField("Routing", value)} label="Routing number" value={props.accountLine.Routing} />
				<Input key={uuid()} onBlur={(value: string) => updateField("Code", value)} label="Code" value={props.accountLine.Code} />
				<Input key={uuid()} onBlur={(value: string) => updateField("Type", value)} label="Account type" value={props.accountLine.Type} />
			</InputsContainer>
		</>
	}

	const requestFile = () => {
		Ipc.requestAccountsFile();
		props.reset();
	}

	const saveFile = () => {
		Ipc.saveAccountsFile();
	}

	return (
		<PanelContainer className="py-3">
			{content}
			<button onClick={requestFile} className="btn btn-light mt-auto mb-1 mx-3">Import new file</button>
			<button onClick={saveFile} className="btn btn-light mx-3">Export accounts</button>
		</PanelContainer>
	);
}

const InputsContainer = styled.div`
	display: flex;
	flex-direction: column;
	padding: 0 1rem;
`;

const PanelContainer = styled.div`
	display: flex;
	flex-direction: column;
	align-items: stretch;
	height: 100vh;
`;