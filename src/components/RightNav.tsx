import * as React from 'react';
import styled from 'styled-components';

interface RightNavProps {
	status: string;
}

export default function RightNav(props: RightNavProps) {
	return (
			<StyledRightNav className="d-flex flex-column align-items-center">

			</StyledRightNav>
	)
}

const StyledRightNav = styled.div`

	margin-top: auto;
	width: 256px;
	height: 100vh;
	background: white;
	border-left: 1px solid var(--gray-500);

`;