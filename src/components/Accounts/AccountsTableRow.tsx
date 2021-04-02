import * as React from 'react';
import styled from 'styled-components';
import { ImportedAccountRow } from '_/main/types';

interface TableRowProps {
	accountLine: ImportedAccountRow;
	selected: boolean;
	onClick: () => void;
}

export default function AccountsTableRow(props: TableRowProps) {
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