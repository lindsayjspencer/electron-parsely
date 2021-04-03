import * as React from 'react';
import styled from "styled-components";
import { PaymentRow } from "_/main/types";
import { formatCurrency } from '_/renderer/helpers';

interface MultiselectionRowProps {
	paymentRow: PaymentRow;
}

export default function MutliselectRow(props: MultiselectionRowProps) {
	let Name, Amount;
	Amount = 0;
	if(props.paymentRow.account) {
		// account attached
		Name = props.paymentRow.account.Name;
	} else {
		// no account
		Name = props.paymentRow.inputRows[0].NaamCrediteur;
	}
	return (
		<MultiselectRowContainer>
			<div className="name">{Name}</div>
			<AmountContainer>
				{props.paymentRow.inputRows.map(row => <div key={row.uuid} className="amount">{formatCurrency(+row.Betaalwaarde)}</div>)}
			</AmountContainer>
		</MultiselectRowContainer>
	);
}

const AmountContainer = styled.div`
	display: flex;
	flex-direction: column;
	align-items: flex-end;
	background: var(--gray-100);
	color: black;
	border-radius: 8px;
	padding: 0.5rem 1rem;;
	margin-bottom: 0.5rem;
	font-size: 10px;
`;

const MultiselectRowContainer = styled.div`
	display: flex;
	flex-direction: column;
	color: black;
	border-radius: 8px;
	padding: 0.5rem 1rem;
	font-size: 10px;

	.name {
		margin-bottom: 8px;
	}
`;