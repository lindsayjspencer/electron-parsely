import * as React from 'react';
import styled from 'styled-components';

export interface TabData {
	label: string;
	callback: () => void;
	icon: string;
}

interface TabsProps {
	tabs: TabData[];
	activeTab: string;
}

export default function Tabs(props: TabsProps) {
	return (
			<StyledTabContainer>
				{props.tabs.map(tab => {
					return <StyledTab onClick={tab.callback} selected={tab.label === props.activeTab} icon={tab.icon}>{tab.label}</StyledTab>
				})}
			</StyledTabContainer>
	)
}

interface StyledTabProps {
	onClick: () => void;
	selected: boolean;
	icon: string;
}

const StyledTab = styled.div<StyledTabProps>`

	background: var(--gray-200);
	color: black;
	padding: 8px 16px;
	font-size: 14px;
	position: relative;
	transition: background 150ms;

	&:hover {
		cursor: pointer;
		background: var(--gray-100);
	}

	&:before {
		content: "${props => props.icon}";
		font-family: "Font Awesome 5 Free";
		font-weight: 600;
		margin-right: 8px;
	}

	${props => props.selected ? `
		&:after {
			position: absolute;
			content: "";
			bottom: 0;
			left: 0;
			width: 100%;
			height: 4px;
			background: var(--gray-400);
		}
	` : null}

`;

const StyledTabContainer = styled.div`

	display: flex;
	flex-direction: row;
	width: 100%;
	height: var(--tabs-height);

	-webkit-touch-callout: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    cursor: default;

`;