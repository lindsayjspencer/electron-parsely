import * as React from 'react';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { ImportedAccountRow, PaymentRow } from '../../main/types';
import PaymentTableRow from './PaymentTableRow';
import SelectedRowPanel from './SelectedRowPanel';

interface PaymentsTableProps {
	paymentRows: PaymentRow[];
	setRightNavContent: (content: JSX.Element) => void;
	accountsMap: Map<string, ImportedAccountRow>;
	setPaymentsData: (data: PaymentRow[]) => void;
}

export default function PaymentsTable(props: PaymentsTableProps) {

	const [selectedRows, setSelectedRows] = useState<Set<PaymentRow>>(new Set());
	const [formattedPaymentRows, setFormattedPaymentRows] = useState<PaymentRow[]>();
	
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