import * as React from 'react';
import styled from 'styled-components';

interface RightNavProps {
	status: string;
}

export default function RightNav(props: RightNavProps) {
	return (
			<StyledRightNav className="d-flex flex-column align-items-center">
				<div className="title-container">
					<i className="fas fa-leaf mx-3"></i>
					<span className="mr-3">Parsley</span>
				</div>
			</StyledRightNav>
	)
}

const StyledRightNav = styled.div`

	margin-top: auto;
	width: 256px;
	height: 100vh;
	background: white;
	box-shadow: 0px 0px 33px 1px rgba(0, 0, 0, 0.24);

	.title-container {
		height: 38px;
		display: flex;
		align-items: center;
		align-self: stretch;
		color: white;
		background: var(--primary);
	}

`;