import * as React from 'react';
import { useEffect, useState } from 'react';
import { v4 as uuid } from 'uuid';

interface InputProps {
	label?: string;
	placeholder?: string;
	id?: string;
	comment?: string;
	value: string;
	onChange?: (val: string) => void;
	onBlur?: (val: string) => void;
}

export default function Input(props: InputProps) {

	const [value, setValue] = useState<string>("");

	const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = event.currentTarget.value;
		setValue(newValue);
		props.onChange?.(newValue);
	}

	const onBlur = (event: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = event.currentTarget.value;
		props.onBlur?.(newValue);
	}

	useEffect(() => {
		setValue(props.value);
	}, []);

	const id = props.id ? props.id : uuid();
	const placeholder = props.placeholder ? props.placeholder : props.label;

	return (
		<div className="form-group">
			{props.label && <label htmlFor={id}>{props.label}</label>}
			<input onBlur={onBlur} onChange={onChange} value={value} type="text" className="form-control" id={id} aria-describedby="emailHelp" placeholder={placeholder} />
			{props.comment && <small id={`${id}Help`} className="form-text text-muted">{props.comment}</small>}
		</div>
	);
	
}