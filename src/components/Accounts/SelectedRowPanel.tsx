import * as React from 'react';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { v4 as uuid } from 'uuid';
import { ImportedAccountRow } from '_/main/types';
import ipcComm from '../../models/IpcComm';
import Input from '../Input';

interface SelectedRowPanelProps {
	accountLine?: ImportedAccountRow;
	updateAccount: (newAccount: ImportedAccountRow) => void;
	deleteAccount: (uuid: string) => void;
	reset: () => void;
}

export default function SelectedRowPanel(props: SelectedRowPanelProps) {

	const [mode, setMode] = useState<string>("normal");
	
	const Ipc = ipcComm.getInstance();

	useEffect(() => {
		setMode("normal");
	}, [props.accountLine]);

	const requestFile = () => {
		Ipc.requestAccountsFile();
		props.reset();
	}

	const saveFile = () => {
		Ipc.saveAccountsFile();
	}

	const addNewAccount = () => {
		setMode("add");
	}


	let content = <div className="text-center">Nothing selected</div>;
	switch(mode) {
		case "normal":
			if(props.accountLine) {
				const newAccount = { ...props.accountLine };
		
				const updateField = (field: string, newValue: string) => {
					newAccount[field] = newValue;
					props.updateAccount(newAccount);
				}

				const deleteAccount = () => {
					if(!props.accountLine) return;
					props.deleteAccount(props.accountLine.uuid);
					props.reset();
				}
		
				content = <>
					<h4 className="mx-3">Selected row</h4>
					<InputsContainer>
						<Input key={uuid()} onBlur={(value: string) => updateField("Name", value)} label="Company name" value={props.accountLine.Name} />
						<Input key={uuid()} onBlur={(value: string) => updateField("Account", value)} label="Account number" value={props.accountLine.Account} />
						<Input key={uuid()} onBlur={(value: string) => updateField("Routing", value)} label="Routing number" value={props.accountLine.Routing} />
						<Input key={uuid()} onBlur={(value: string) => updateField("Code", value)} label="Code" value={props.accountLine.Code} />
						<Input key={uuid()} onBlur={(value: string) => updateField("Type", value)} label="Account type" value={props.accountLine.Type} />
						<button className="btn btn-sm btn-danger" onClick={deleteAccount}>Delete</button>
					</InputsContainer>
				</>
			}
		break;
		case "add":
			const newAccount: ImportedAccountRow = {
				Name: "",
				Account: "",
				Routing: "",
				Code: "",
				Type: "",
				uuid: uuid()
			};
	
			const updateField = (field: string, newValue: string) => {
				newAccount[field] = newValue;
			}

			const addAccount = () => {
				props.updateAccount(newAccount);
			}

			content = <>
			<h4 className="mx-3">Add new account</h4>
			<InputsContainer>
				<Input key={uuid()} onBlur={(value: string) => updateField("Name", value)} label="Company name" value={""} />
				<Input key={uuid()} onBlur={(value: string) => updateField("Account", value)} label="Account number" value={""} />
				<Input key={uuid()} onBlur={(value: string) => updateField("Routing", value)} label="Routing number" value={""} />
				<Input key={uuid()} onBlur={(value: string) => updateField("Code", value)} label="Code" value={""} />
				<Input key={uuid()} onBlur={(value: string) => updateField("Type", value)} label="Account type" value={""} />
				<button className="btn btn-sm btn-primary" onClick={addAccount}>Add</button>
			</InputsContainer>
		</>
		break;
	}

	return (
		<PanelContainer className="py-3">
			{content}
			<button onClick={addNewAccount} className="btn btn-light mt-auto mb-1 mx-3">Add new account</button>
			<button onClick={requestFile} className="btn btn-light mb-1 mx-3">Import new file</button>
			<button onClick={saveFile} className="btn btn-light mx-3">Export accounts</button>
		</PanelContainer>
	);
}

const InputsContainer = styled.div`
	display: flex;
	flex-direction: column;
	padding: 0 1rem;
`;

const PanelContainer = styled.div`
	display: flex;
	flex-direction: column;
	align-items: stretch;
	height: 100vh;
`;