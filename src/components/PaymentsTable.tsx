import * as React from 'react';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { formatCurrency } from '_/renderer/helpers';
import { PaymentRow } from '../main/types';
import ipcComm from '../models/IpcComm';

interface PaymentsTableProps {
	paymentRows: PaymentRow[];
	setRightNavContent: (content: JSX.Element) => void;
}

export default function PaymentsTable(props: PaymentsTableProps) {

	const [selectedRow, setSelectedRow] = useState<PaymentRow>();
	
	const Ipc = ipcComm.getInstance();

	const onClick = (newSelection: PaymentRow) => {
		setSelectedRow(current => {
			if(current === newSelection) {
				return undefined;
			} else {
				return newSelection;
			}
		});
	}

	useEffect(() => {
		props.setRightNavContent(<SelectedRowPanel paymentRow={selectedRow} reset={() => setSelectedRow(undefined)} paymentRows={props.paymentRows} />);
	}, [selectedRow]);

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
					{props.paymentRows.map((paymentRow, i) => <TableRow onClick={() => onClick(paymentRow)} selected={selectedRow === paymentRow} key={paymentRow.uuid} paymentRow={paymentRow} />)}
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
			outline: 2px solid var(--info);
			color: black;
		` : ''}
	}
`;

interface TableRowProps {
	paymentRow: PaymentRow;
	selected: boolean;
	onClick: () => void;
}

// 		Name: line.Name,
// 		Account: line.Account,
// 		Routing: line.Routing,
// 		Type: line.Type,
// 		Amount: line.Betaalwarde,

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
		Amount += +input.Betaalwarde;
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
	paymentRow?: PaymentRow;
	paymentRows: PaymentRow[];
	reset: () => void;
}

const SelectedRowPanel = (props: SelectedRowPanelProps) => {
	
	const Ipc = ipcComm.getInstance();
	
	let content = <div className="text-center">Nothing selected</div>;
	if(props.paymentRow) {
		const newAccount = { ...props.paymentRow };

		content = <>
			<h4 className="mx-3">Selected row</h4>
		</>
	}

	const requestFile = () => {
		Ipc.requestInputFile();
		props.reset();
	}

	const saveFile = () => {
		Ipc.savePaymentsFile(props.paymentRows);
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