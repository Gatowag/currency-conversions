function currencyConvesion()
{
	const response = UrlFetchApp.fetch("https://openexchangerates.org/api/latest.json?app_id=YOUR_APP_ID");
		var exData = Utilities.jsonParse(response.getContentText());
		var exRates = exData["rates"];
	const ss = SpreadsheetApp.getActiveSpreadsheet();
		const tab1 = ss.getSheetByName("Top 20");
		const isoRange = tab1.getRange(3,4,20,1);
	let iso = [];

console.log(exData.rates.GBP);


	for ( i = 0; i < 20; i++) {
		iso.push(isoRange.getValues()[i]);
	};
}