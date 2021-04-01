import { v4 as uuid } from 'uuid';
import { ImportedAccountRow, ImportedInputRow, PaymentRow } from "_/main/types";

export const parsely = (accountsJSON: Array<ImportedAccountRow>, inputJSON: Array<ImportedInputRow>) => {
	//New empty array for outputs
	var paymentArray: Array<PaymentRow> = [];

	//Loop through lines of input
	inputJSON.forEach((inputLine) => {
		//Search for matching "Name", mark accountLine true if found
		var accountLine = accountsJSON.find((x) => {
			return (
				x.Name === inputLine.NaamCrediteur ||
				x.Code === inputLine.CodeCrediteur
			);
		});
		//Push to output array: everything on input line and everything on matching line in account info file
		paymentArray.push({
			accountUuid: accountLine?.uuid,
			inputRows: [inputLine],
			uuid: uuid()
		});
	});

	return paymentArray;
}