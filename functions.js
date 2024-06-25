// GLOBAL VARIABLES
const ss = SpreadsheetApp.getActiveSpreadsheet();
const tab1 = ss.getSheets()[0];
const dataRange = tab1.getRange(`A5:E24`);

function currencyConversion()
{
	const response = UrlFetchApp.fetch(`https://openexchangerates.org/api/latest.json?app_id=your_ID_goes_here`);
	var exData = Utilities.jsonParse(response.getContentText());
	// dataVals creates a 2D array of ISO codes and our base USD value
	const dataVals = tab1.getRange(`D2:E24`).getValues();
	const baseVal = dataVals[0][1];
	const baseISO = dataVals[0][0];
	const baseRate = exData.rates[baseISO];
	// newVals is an array that we'll fill with a list of converted values
	let newVals = [];

	// loop through each ISO and write their converted rate to newVals
	for(i=2; i<23; i++){
		let rate = exData.rates[dataVals[i][0]];
		let conversion = isNaN(rate) === false ? Math.round(1/baseRate * rate * baseVal * 100)/100 : `ISO not found`;
		newVals.push([conversion]);
	};

	// write all of the conversion amounts and format them to be more readable
	tab1.getRange(`E4:E24`).setValues(newVals).setNumberFormat(`#,##0.00`);

	// timeCell is the cell where we output the exchange rate timestamp
	const timeCell = tab1.getRange(1, 5, 1, 1);
	// timeFormatted converts exData.timestamp to millisceonds and gets a useful date out of that
	const timeFormatted = new Date(exData.timestamp * 1000);

	// writes the timestamp to the appropriate cell and simplifies the format
	tab1.setActiveSelection(timeCell).setValue(timeFormatted).setNumberFormat(`yyyy-mm-dd`);
}

function orderActive()
{
	// 1. Retrieve the background colors from the cells.
	const backgrounds = dataRange.getBackgroundObjects();
	
	// 2. Create the request body for using the batchUpdate method of Sheets API.
	const backgroundColors = Object.values(
		backgrounds.reduce((o, [a]) => {
			const rgb = a.asRgbColor();
			return Object.assign(o, {[rgb.asHexString()]: {red: rgb.getRed() / 255, green: rgb.getGreen() / 255, blue: rgb.getBlue() / 255}})
		}, {})
	);
	const startRow = dataRange.getRow() - 1;
	const startColumn = dataRange.getColumn() - 1;
	const srange = {
		sheetId: tab1.getSheetId(),
		startRowIndex: startRow,
		endRowIndex: startRow + dataRange.getNumRows(),
		startColumnIndex: startColumn,
		endColumnIndex: startColumn + dataRange.getNumColumns()
	};
	const requests = [
		{sortRange: {range: srange, sortSpecs: [{dimensionIndex: 0, sortOrder: `ASCENDING`}]}},
		{sortRange: {range: srange, sortSpecs: backgroundColors.map(rgb => ({backgroundColor: rgb}))}}
	];
  
	// 3. Request to Sheets API using the request body.
	Sheets.Spreadsheets.batchUpdate({requests: requests}, ss.getId());
}


function orderRank()
{
	dataRange.sort({column:1});
}

function setRanks()
{
	let focusISO = tab1.getRange(`D1:D24`).getValues();
	let valid = [];
	
	for (i=5; i<25; i++) {
		if (valid.length < 10 && valid.indexOf(focusISO[i-1][0]) == -1) {
			valid.push(focusISO[i-1][0]);
			tab1.getRange(`A${i}:E${i}`).setBackground(`#ffffff`);
		} else {
			tab1.getRange(`A${i}:E${i}`).setBackground(`#d9d9d9`);
		}
		
		tab1.getRange(`A${i}`).setValue(i-3);
	}
}

function checkboxFunctions(e)
{
	const checkConvert = [3,7,ss.getRange(`G3`)];
	const checkOrdActive = [5,7,ss.getRange(`G5`)];
	const checkOrdRank = [6,7,ss.getRange(`G6`)];
	const checkSetRanks = [8,7,ss.getRange(`G8`)];
	const row = e.range.getRow();
	const col = e.range.getColumn();

	if (row == checkConvert[0] && col == checkConvert[1]) {
			currencyConversion();
			checkConvert[2].uncheck();
	} else if (row == checkOrdActive[0] && col == checkOrdActive[1]) {
			orderActive();
			checkOrdActive[2].uncheck();
	} else if (row == checkOrdRank[0] && col == checkOrdRank[1]) {
			orderRank();
			checkOrdRank[2].uncheck();
	} else if (row == checkSetRanks[0] && col == checkSetRanks[1]) {
			setRanks();
			checkSetRanks[2].uncheck();
	} else {
		return;
	}
}