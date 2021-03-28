import * as React from 'react';
import styled from 'styled-components';
import { ReactInputRow, ReactOutputRow } from './App';

interface OutputTableProps {
	outputData: Array<ReactOutputRow>;
	errorData: Array<ReactInputRow> | undefined;
	inputFileName?: string; 
	onRowClick: (outputLine: ReactOutputRow | ReactInputRow) => void;
}

export default function OutputTable(props: OutputTableProps) {

	return (
		<>
		<OutputTableContainer>
			<table className="table table-striped mb-0">
				<thead>
					<tr>					
						<th>Account</th>
						<th>Amount</th>
						<th>Name</th>
						<th>Routing</th>
						<th>Type</th>
					</tr>					
				</thead>
				<tbody>
					{props.outputData.map((outputLine, i) => <TableRow key={i} outputLine={outputLine} onClick={() => props.onRowClick(outputLine)} />)}
					{props.errorData && props.errorData.map((outputLine, i) => <ErrorTableRow key={i} outputLine={outputLine} onClick={() => props.onRowClick(outputLine)} />)}
				</tbody>
			</table>
		</OutputTableContainer>
		</>
	)
}

const OutputTableContainer = styled.div`
	max-height: calc(100vh - 38px);
	overflow: auto;

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

interface TableRowProps {
	selected: boolean;
	onClick: () => void;
}

const StyledErrorTableRow = styled.tr<TableRowProps>`
	&&&& {
		background: ${props => props.selected ? 'var(--blue)' : 'var(--red)'};
		color: white;
	}
`;

const StyledTableRow = styled.tr<TableRowProps>`
	&&&& {
		${props => props.selected ? 'background: var(--blue);color: white;' : ''}
	}
`;

const ErrorTableRow = (props: { outputLine: ReactInputRow, onClick: () => void }) => {
	return (
		<StyledErrorTableRow onClick={props.onClick} selected={props.outputLine.selected}>
			<td></td>
			<td>{props.outputLine.Saldo}</td>
			<td>{props.outputLine.NaamCrediteur}</td>
			<td></td>
			<td></td>
		</StyledErrorTableRow>
	)
}

const TableRow = (props: { outputLine: ReactOutputRow, onClick: () => void }) => {
	return (
		<StyledTableRow onClick={props.onClick} selected={props.outputLine.selected}>
			<td>{props.outputLine.Account}</td>
			<td>{props.outputLine.Amount}</td>
			<td>{props.outputLine.Name}</td>
			<td>{props.outputLine.Routing}</td>
			<td>{props.outputLine.Type}</td>
		</StyledTableRow>
	)
}