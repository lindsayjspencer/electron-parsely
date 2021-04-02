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