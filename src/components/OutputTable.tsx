import * as React from 'react';
import styled from 'styled-components';
import { AccountRow, InputRow } from '_/main/types';
import { ReactOutputRow } from './App';

interface OutputTableProps {
	outputData: Array<ReactOutputRow>;
	errorData: Array<ReactOutputRow> | undefined;
	inputFileName?: string; 
	onRowClick: (outputLine: ReactOutputRow) => void;
}

const parsely = (
	accountsJSON: Array<AccountRow>,
	inputJSON: Array<InputRow>
) => {
	//New empty array for outputs
	var combinedArray: Array<AccountRow & InputRow> = [];
	var errors: any = [];

	//Loop through lines of input
	inputJSON.forEach((inputLine) => {
		//Search for matching "Name", mark accountLine true if found
		var accountLine = accountsJSON.find((x) => {
			return (
				x.Name === inputLine.NaamCrediteur ||
				x.Code === inputLine.CodeCrediteur
			);
		});
		//If no match
		if (!accountLine) {
			// console.log(`Account ${inputLine.NaamCrediteur} not found`);
			errors.push({
				Name: inputLine.NaamCrediteur,
				Account: undefined,
				Routing: undefined,
				Type: undefined,
				Amount: inputLine.Saldo,
				selected: false
			});
			return;
		}
		//Push to output array: everything on input line and everything on matching line in account info file
		combinedArray.push({
			...inputLine,
			...accountLine,
		});
	});

	//Map output arrays to output object
	const outputJSON: Array<ReactOutputRow> = combinedArray.map((line) => {
		return {
			Name: line.Name,
			Account: line.Account,
			Routing: line.Routing,
			Type: line.Type,
			Amount: line.Saldo,
			selected: false
		};
	});

	return {
		outputJSON,
		errors,
	};
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