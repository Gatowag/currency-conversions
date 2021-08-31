function currencyConversion()
{
	const response = UrlFetchApp.fetch("https://openexchangerates.org/api/latest.json?app_id=YOUR_APP_ID");
		var exData = Utilities.jsonParse(response.getContentText());
	const ss = SpreadsheetApp.getActiveSpreadsheet();
		const tab1 = ss.getSheetByName("Top 20");
		const baseAmnt = tab1.getRange(2, 6, 1, 1).getValue();


	for ( i = 0; i < 20; i++) {
		let convCell = tab1.getRange(3 + i, 6, 1, 1);
		let isoCell = tab1.getRange(3 + i, 4, 1, 1);
		let isoVal = isoCell.getValue();
		let exAmnt = exData.rates[isoVal];
		let convAmnt = Math.round(100 * exAmnt * baseAmnt)/100;
		
		if (isNaN(exAmnt) === false){
			tab1.setActiveSelection(convCell).setValue(convAmnt).setNumberFormat("#,##0.00");
		};
	};
}