import * as React from 'react';
import styled from "styled-components";
import { PaymentRow } from "_/main/types";
import ipcComm from '../../models/IpcComm';
import MutliselectRow from './MultiselectRow';

interface SelectedRowPanelProps {
	selectedRows?: Set<PaymentRow>;
	paymentRows?: PaymentRow[];
	reset: () => void;
}

export default function SelectedRowPanel(props: SelectedRowPanelProps) {
	
	const Ipc = ipcComm.getInstance();
	
	let content = <div className="text-center">Nothing selected</div>;
	if(props.selectedRows && props.selectedRows.size !== 0) {
		let optionsButton;
		if(props.selectedRows.values().next().value.account) {
			// has account connected
			optionsButton = props.selectedRows.size > 1 ? <button className="btn btn-primary mx-3 btn-sm">Merge payments</button> : null;
		} else {
			// no account match
			optionsButton = <button className="btn btn-warning mx-3 btn-sm">Connect to account</button>;
		}
		content = <>
			<h4 className="mx-3">Selected rows</h4>
			{Array.from(props.selectedRows).map((row) => {
				return <MutliselectRow paymentRow={row} key={row.uuid} />
			})}
			{optionsButton}
		</>
	}

	const requestFile = () => {
		Ipc.requestInputFile();
		props.reset();
	}

	const saveFile = () => {
		if(props.paymentRows) {
			Ipc.savePaymentsFile(props.paymentRows);
		}
	}

	return (
		<PanelContainer className="py-3">
			{content}
			<button onClick={requestFile} className="btn btn-light mt-auto mb-1 mx-3">Import new file</button>
			<button onClick={saveFile} className="btn btn-light mx-3">Save payment file</button>
		</PanelContainer>
	);
}

const PanelContainer = styled.div`
	display: flex;
	flex-direction: column;
	align-items: stretch;
	height: 100vh;
`;