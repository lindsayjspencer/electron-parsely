import * as React from 'react';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { ImportedAccountRow, PaymentRow } from '../../main/types';
import ipcComm from '../../models/IpcComm';
import PaymentTableRow from './PaymentTableRow';
import SelectedRowPanel from './SelectedRowPanel';

interface PaymentsTableProps {
	paymentRows: PaymentRow[];
	setRightNavContent: (content: JSX.Element) => void;
	accountsMap: Map<string, ImportedAccountRow>;
	setPaymentsData: (data: PaymentRow[]) => void;
	setTabOptions: (options: JSX.Element) => void;
}

export default function PaymentsTable(props: PaymentsTableProps) {

	const [selectedRows, setSelectedRows] = useState<Set<PaymentRow>>(new Set());
	const [formattedPaymentRows, setFormattedPaymentRows] = useState<PaymentRow[]>();

	const Ipc = ipcComm.getInstance();

	useEffect(() => {
		props.setRightNavContent(<SelectedRowPanel mergePayments={mergePayments} selectedRows={selectedRows} reset={() => setSelectedRows(new Set())} paymentRows={formattedPaymentRows} />);
	}, [selectedRows]);

	useEffect(() => {
		const rows: PaymentRow[] = [];
		for(const row of props.paymentRows) {
			row.account = row.accountUuid ? props.accountsMap.get(row.accountUuid) : undefined;
			rows.push(row);
		}
		setFormattedPaymentRows(rows);
	}, [props.accountsMap, props.paymentRows]);

	useEffect(() => {

		const requestFile = () => {
			Ipc.requestInputFile();
			setSelectedRows(new Set());
		}

		const saveFile = () => {
			if(props.paymentRows) {
				Ipc.savePaymentsFile(props.paymentRows);
			}
		}

		const tabOptions = (<>
			<button onClick={requestFile} className="rounded-0 btn btn-light ml-auto">Import new file</button>
			<button onClick={saveFile} className="rounded-0 btn btn-light">Save payment file</button>
			</>
		);

		props.setTabOptions(tabOptions);

	}, [props.paymentRows]);
	
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

	const mergePayments = (payments: PaymentRow[]) => {
		const newRow = payments.pop();
		if(!newRow) return;
		const removedPayments: Array<string> = [];
		while(payments.length > 0) {
			const newInputRow = payments.pop();
			if(newInputRow && newRow) {
				removedPayments.push(newInputRow.uuid);
				newRow.inputRows = newRow.inputRows.concat(newInputRow.inputRows);
			}
		}
		const newPaymentsData = props.paymentRows.filter(row=>removedPayments.indexOf(row.uuid) === -1);
		props.setPaymentsData(newPaymentsData);
		Ipc.setPaymentsData(newPaymentsData);
		setSelectedRows(new Set([newRow]));
	}

	return (
		<PaymentTableContainer>
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
					{formattedPaymentRows?.map((paymentRow, i) => <PaymentTableRow onClick={() => onClick(paymentRow)} selected={selectedRows.has(paymentRow)} key={paymentRow.uuid} paymentRow={paymentRow} />)}
				</tbody>
			</table>
		</PaymentTableContainer>
	)
}

const PaymentTableContainer = styled.div`
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