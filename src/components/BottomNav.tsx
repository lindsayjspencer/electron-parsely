import * as React from 'react';
import styled from 'styled-components';

interface BottomNavProps {
	status: string;
}

export default function BottomNav(props: BottomNavProps) {
	return (
			<StyledBottomNav className="d-flex align-items-center">
				<div className="title-container">
					<i className="fas fa-leaf mx-3"></i>
					<span className="mr-3">Parsley</span>
				</div>
				<div className="console-status ml-3 text-muted">{props.status}</div>
				<div className="ml-auto d-flex btn-container align-self-center"></div>
			</StyledBottomNav>
	)
}

const StyledBottomNav = styled.div`

	height: 38px;
	width: 100%;
	background: white;
	box-shadow: 0px 0px 33px 1px rgba(0, 0, 0, 0.24);
	min-height: 38px;

	.title-container {
		display: flex;
		align-items: center;
		align-self: stretch;
		color: white;
		background: var(--primary);
	}

`;