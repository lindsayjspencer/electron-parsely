import * as React from 'react';
import { useEffect } from 'react';
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
		<h2 className="d-flex align-items-center mb-3">
			<i className="far fa-folder mr-2"></i>
			{props.inputFileName}
		</h2>
		<table className="output-table table table-dark table-striped mb-0">
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
		</>
	)
}

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