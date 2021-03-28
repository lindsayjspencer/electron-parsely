import * as React from 'react';
import styled from 'styled-components';
import { ReactOutputRow } from './App';

interface OutputTableProps {
	outputData: Array<ReactOutputRow>;
	errorData: Array<ReactOutputRow> | undefined;
	inputFileName?: string; 
	onRowClick: (outputLine: ReactOutputRow) => void;
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
	max-height: 100vh;
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

const ErrorTableRow = (props: { outputLine: ReactOutputRow, onClick: () => void }) => {
	return (
		<StyledErrorTableRow onClick={props.onClick} selected={props.outputLine.selected}>
			<td></td>
			<td>{props.outputLine.Amount}</td>
			<td>{props.outputLine.Name}</td>
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