import * as React from 'react';
import styled from "styled-components";
import { PaymentRow } from "_/main/types";
import { formatCurrency } from "_/renderer/helpers";

interface StyledTableRowProps {
	selected: boolean;
}

export default function PaymentTableRow(props: TableRowProps) {

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

interface TableRowProps {
	paymentRow: PaymentRow;
	selected: boolean;
	onClick: () => void;
}

const StyledTableRow = styled.tr<StyledTableRowProps>`
	&&& {
		${props => props.selected ? `
			color: black;
			background: var(--gray-300);
		` : ''}
	}
`;