import * as React from 'react';
import styled from 'styled-components';

interface RightNavProps {
	status: string;
	children: JSX.Element | null;
}

export default function RightNav(props: RightNavProps) {
	return (
			<StyledRightNav className="d-flex flex-column align-items-stretch">
				{props.children}
			</StyledRightNav>
	)
}

const StyledRightNav = styled.div`

	margin-top: auto;
	width: 320px;
	height: 100vh;
	background: white;
	border-left: 1px solid var(--gray-500);

`;