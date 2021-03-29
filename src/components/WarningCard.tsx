import * as React from 'react';
import styled from 'styled-components';

interface WarningCardProps {
	text: string;
	onClick: () => void;
}

export default function WarningCard(props: WarningCardProps) {
	return (
		<Card className="d-flex flex-column align-items-center" onClick={props.onClick}>
			<i className="fas fa-exclamation-triangle fa-4x mb-3 text-warning"></i>
			<span className="m-3">{props.text}</span>
		</Card>
	)
}

const Card = styled.div`
	margin: auto;
`;