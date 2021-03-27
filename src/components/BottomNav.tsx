import * as React from 'react';

interface BottomNavProps {
	status: string;
}

export default function BottomNav(props: BottomNavProps) {
	return (
			<div className="bottom-container d-flex align-items-center">
				<div className="title-container">
					<i className="fas fa-leaf mx-3"></i>
					<span className="mr-3">Parsley</span>
				</div>
				<div className="console-status ml-3 text-muted">{props.status}</div>
				<div className="ml-auto d-flex btn-container align-self-center"></div>
			</div>
	)
}