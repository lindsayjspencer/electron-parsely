import { AccountRow, InputRow, OutputRow } from "./types";

module.exports = async function (accountsJSON: Array<AccountRow>, inputJSON: Array<InputRow>) {

    //New empty array for outputs
    var combinedArray: Array<AccountRow & InputRow> = [];
    var errors: any = [];

    //Loop through lines of input
    inputJSON.forEach((inputLine) => {
        //Search for matching "Name", mark accountLine true if found
        var accountLine = accountsJSON.find((x) => {
            return x.Name === inputLine.NaamCrediteur || x.Code === inputLine.CodeCrediteur;
        });
        //If no match
        if (!accountLine) {
			// console.log(`Account ${inputLine.NaamCrediteur} not found`);
			errors.push(inputLine);
			return;
        }
        //Push to output array: everything on input line and everything on matching line in account info file
        combinedArray.push({
            ...inputLine,
            ...accountLine
        });
    });

    //Map output arrays to output object
    const outputJSON: Array<OutputRow> = combinedArray.map((line) => {
        return {
            Name: line.Name,
            Account: line.Account,
            Routing: line.Routing,
            Type: line.Type,
            Amount: line.Saldo,
        }
	});
	
	return {
		outputJSON, errors
	}

}