import * as React from 'react';

export default function WarningNoAccounts() {
	return (
		<div className="d-flex flex-column align-items-center">
			<i className="fas fa-exclamation-triangle fa-4x mb-3 text-warning"></i>
			<span className="m-3">Please import an accounts file</span>
		</div>
	)
}