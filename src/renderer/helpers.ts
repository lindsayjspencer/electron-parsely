

export const formatCurrency = (amount: number) => {
	let parts = amount.toFixed(2).split(".");
	let wholeDollars = parseInt(parts[0]).toLocaleString();
	return wholeDollars + "." + parts[1];
}