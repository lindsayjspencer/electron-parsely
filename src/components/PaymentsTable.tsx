import * as React from 'react';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { formatCurrency } from '_/renderer/helpers';
import { ImportedAccountRow, PaymentRow } from '../main/types';
import ipcComm from '../models/IpcComm';

interface PaymentsTableProps {
	paymentRows: PaymentRow[];
	setRightNavContent: (content: JSX.Element) => void;
	accountsMap: Map<string, ImportedAccountRow>;
}

export default function PaymentsTable(props: PaymentsTableProps) {

	const [selectedRows, setSelectedRows] = useState<Set<PaymentRow>>(new Set());
	const [formattedPaymentRows, setFormattedPaymentRows] = useState<PaymentRow[]>();
	
	const Ipc = ipcComm.getInstance();

	const onClick = (newSelection: PaymentRow) => {
		setSelectedRows(current => {
			const currentSet = new Set(current);
			if(current.size === 0) {
				currentSet.add(newSelection);
				return currentSet;
			}
			if(current.has(newSelection)) {
				// deselect
				currentSet.delete(newSelection);
				return currentSet;
			}
			const accountUuid = current.values().next().value.accountUuid;
			if(newSelection.accountUuid === accountUuid) {
				currentSet.add(newSelection);
				return currentSet;
			}
			const newSet: Set<PaymentRow> = new Set();
			newSet.add(newSelection);
			return newSet;
		});
	}

	useEffect(() => {
		props.setRightNavContent(<SelectedRowPanel selectedRows={selectedRows} reset={() => setSelectedRows(new Set())} paymentRows={formattedPaymentRows} />);
	}, [selectedRows]);

	useEffect(() => {
		const rows: PaymentRow[] = [];
		for(const row of props.paymentRows) {
			row.account = row.accountUuid ? props.accountsMap.get(row.accountUuid) : undefined;
			rows.push(row);
		}
		setFormattedPaymentRows(rows);
	}, [props.accountsMap, props.paymentRows]);

	return (
		<OutputTableContainer>
			<table className="table table-striped mb-0 table-sm table-borderless text-black-50">
				<thead>
					<tr>					
						<th>Name</th>
						<th>Account</th>
						<th>Routing</th>
						<th>Type</th>
						<th>Amount</th>
					</tr>					
				</thead>
				<tbody>
					{formattedPaymentRows?.map((paymentRow, i) => <TableRow onClick={() => onClick(paymentRow)} selected={selectedRows.has(paymentRow)} key={paymentRow.uuid} paymentRow={paymentRow} />)}
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
	paymentRow: PaymentRow;
	selected: boolean;
	onClick: () => void;
}

const TableRow = (props: TableRowProps) => {
	let Name, Account, Routing, Type, Amount;
	Amount = 0;
	if(props.paymentRow.account) {
		// account attached
		Name = props.paymentRow.account.Name;
		Account = props.paymentRow.account.Account;
		Routing = props.paymentRow.account.Routing;
		Type = props.paymentRow.account.Type;
	} else {
		// no account
		Name = props.paymentRow.inputRows[0].NaamCrediteur;
		Account = "--";
		Routing = "--";
		Type = "--";
	}
	for (const input of props.paymentRow.inputRows) {
		Amount += +input.Betaalwaarde;
	}
	return (
		<StyledTableRow selected={props.selected} onClick={props.onClick}>
			<td>{Name}</td>
			<td>{Account}</td>
			<td>{Routing}</td>
			<td>{Type}</td>
			<td className="text-right">{formatCurrency(Amount)}</td>
		</StyledTableRow>
	)
}

interface SelectedRowPanelProps {
	selectedRows?: Set<PaymentRow>;
	paymentRows?: PaymentRow[];
	reset: () => void;
}

const SelectedRowPanel = (props: SelectedRowPanelProps) => {
	
	const Ipc = ipcComm.getInstance();
	
	let content = <div className="text-center">Nothing selected</div>;
	if(props.selectedRows && props.selectedRows.size !== 0) {
		let optionsButton;
		if(props.selectedRows.values().next().value.account) {
			// has account connected
			optionsButton = props.selectedRows.size > 1 ? <button className="btn btn-primary mx-3 btn-sm">Merge payments</button> : null;
		} else {
			// no account match
			optionsButton = <button className="btn btn-warning mx-3 btn-sm">Connect to account</button>;
		}
		content = <>
			<h4 className="mx-3">Selected rows</h4>
			{Array.from(props.selectedRows).map((row) => {
				return <MutliselectRow paymentRow={row} key={row.uuid} />
			})}
			{optionsButton}
		</>
	}

	const requestFile = () => {
		Ipc.requestInputFile();
		props.reset();
	}

	const saveFile = () => {
		if(props.paymentRows) {
			Ipc.savePaymentsFile(props.paymentRows);
		}
	}

	return (
		<PanelContainer className="py-3">
			{content}
			<button onClick={requestFile} className="btn btn-light mt-auto mb-1 mx-3">Import new file</button>
			<button onClick={saveFile} className="btn btn-light mx-3">Save payment file</button>
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

interface MultiselectionRowProps {
	paymentRow: PaymentRow;
}

const MutliselectRow = (props: MultiselectionRowProps) => {
	let Name, Amount;
	Amount = 0;
	if(props.paymentRow.account) {
		// account attached
		Name = props.paymentRow.account.Name;
	} else {
		// no account
		Name = props.paymentRow.inputRows[0].NaamCrediteur;
	}
	for (const input of props.paymentRow.inputRows) {
		Amount += +input.Betaalwaarde;
	}
	return (
		<MultiselectRowContainer className={"mx-3"}>
			<div className="name">{Name}</div>
			<div className="ml-auto amount">{formatCurrency(Amount)}</div>
		</MultiselectRowContainer>
	);
}

const MultiselectRowContainer = styled.div`
	display: flex;
	align-items: center;
	background: var(--gray-200);
	color: black;
	border-radius: 8px;
	padding: 0.5rem 1rem;;
	margin-bottom: 0.5rem;
	font-size: 10px;
`;