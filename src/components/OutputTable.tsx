import * as React from 'react';
import { useEffect } from 'react';
import styled from 'styled-components';
import { OutputRow } from '_/main/types';

interface OutputTableProps {
	outputData: Array<OutputRow>;
	inputFileName?: string; 
}

export default function OutputTable(props: OutputTableProps) {

	useEffect(() => {

		console.log(props.outputData);

	}, [props.outputData]);

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
					{props.outputData.map((outputLine, i) => <TableRow key={i} outputLine={outputLine} />)}
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

const TableRow = (props: { outputLine: OutputRow }) => {
	return (
		<tr>
			<td>{props.outputLine.Account}</td>
			<td>{props.outputLine.Amount}</td>
			<td>{props.outputLine.Name}</td>
			<td>{props.outputLine.Routing}</td>
			<td>{props.outputLine.Type}</td>
		</tr>
	)
}