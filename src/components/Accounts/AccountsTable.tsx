import * as React from 'react';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { ImportedAccountRow } from '_/main/types';
import ipcComm from '../../models/IpcComm';
import AccountsTableRow from './AccountsTableRow';
import SelectedRowPanel from './SelectedRowPanel';

interface AccountsTableProps {
	accountsData: ImportedAccountRow[];
	setRightNavContent: (content: JSX.Element) => void;
	setAccountsData: (data: ImportedAccountRow[]) => void;
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
			newAccounts.sort((x, y) => x.Name.localeCompare(y.Name));
			Ipc.setAccountsData(newAccounts);
			props.setAccountsData(newAccounts);
		} else {
			newAccounts[newAccounts.length] = newAccount;
			newAccounts.sort((x, y) => x.Name.localeCompare(y.Name));
			Ipc.setAccountsData(newAccounts);
			props.setAccountsData(newAccounts);
		}
	}

	const deleteAccount = (uuid: string) => {
		const newAccounts = [...props.accountsData].filter(x=>x.uuid !== uuid);
		Ipc.setAccountsData(newAccounts);
		props.setAccountsData(newAccounts);
	}

	useEffect(() => {
		props.setRightNavContent(<SelectedRowPanel accountLine={selectedRow} deleteAccount={deleteAccount} updateAccount={updateAccount} reset={() => setSelectedRow(undefined)} />);
	}, [selectedRow]);

	return (
		<AccountsTableContainer>
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
					{props.accountsData.map((accountLine, i) => <AccountsTableRow onClick={() => onClick(accountLine)} selected={selectedRow === accountLine} key={accountLine.uuid} accountLine={accountLine} />)}
				</tbody>
			</table>
		</AccountsTableContainer>
	)
}

const AccountsTableContainer = styled.div`
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