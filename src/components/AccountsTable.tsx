import * as React from 'react';
import styled from 'styled-components';
import { AccountRow } from '_/main/types';

interface AccountsTableProps {
	accountsData: AccountRow[];
}

export default function AccountsTable(props: AccountsTableProps) {

	return (
		<>
		<OutputTableContainer>
			<table className="table table-striped mb-0">
				<thead>
					<tr>					
						<th>Account</th>
						<th>Code</th>
						<th>Name</th>
						<th>Routing</th>
						<th>Type</th>
					</tr>					
				</thead>
				<tbody>
					{props.accountsData.map((accountLine, i) => <TableRow key={i} accountLine={accountLine} />)}
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

}

const StyledTableRow = styled.tr<TableRowProps>`

`;

const TableRow = (props: { accountLine: AccountRow }) => {
	return (
		<StyledTableRow>
			<td>{props.accountLine.Account}</td>
			<td>{props.accountLine.Code}</td>
			<td>{props.accountLine.Name}</td>
			<td>{props.accountLine.Routing}</td>
			<td>{props.accountLine.Type}</td>
		</StyledTableRow>
	)
}