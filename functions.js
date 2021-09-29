	const ss = SpreadsheetApp.getActiveSpreadsheet();
	const tab1 = ss.getSheetByName("Top 20");
	const dataRange = tab1.getRange("A4:E23");

function currencyConversion()
{
	const response = UrlFetchApp.fetch("https://openexchangerates.org/api/latest.json?app_id=f936377f62b44cceb2c385afcc9bbc85");
		var exData = Utilities.jsonParse(response.getContentText());
		const baseAmnt = tab1.getRange(3, 5, 1, 1).getValue();
		const convTimeCell = tab1.getRange(1, 5, 1, 1);
		const convTime = new Date(exData.timestamp * 1000);

	for ( i = 0; i < 20; i++) {
		let convCell = tab1.getRange(4 + i, 5, 1, 1);
		let isoCell = tab1.getRange(4 + i, 4, 1, 1);
		let isoVal = isoCell.getValue();
		let exAmnt = exData.rates[isoVal];
		let convAmnt = Math.round(100 * exAmnt * baseAmnt)/100;
		
		if (isNaN(exAmnt) === false){
			tab1.setActiveSelection(convCell).setValue(convAmnt).setNumberFormat("#,##0.00");
		} else {
			tab1.setActiveSelection(convCell).setValue("not available");
		}
	};
	
	tab1.setActiveSelection(convTimeCell).setValue(convTime).setNumberFormat("yyyy-mm-dd hh:mm");
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
		{sortRange: {range: srange, sortSpecs: [{dimensionIndex: 0, sortOrder: "ASCENDING"}]}},
		{sortRange: {range: srange, sortSpecs: backgroundColors.map(rgb => ({backgroundColor: rgb}))}}
	];
  
	// 3. Request to Sheets API using the request body.
	Sheets.Spreadsheets.batchUpdate({requests: requests}, ss.getId());
}


function orderRank()
{
	dataRange.sort({column:1});
}

function setRanks() {
	rankedYoutubeCountries();
	
	let curr = [];
	
	for (i = 4; i < 24; i++) {
		let focusISO = tab1.getRange("D" + i).getValue();

		if (curr.length < 10 && curr.indexOf(focusISO) == -1) {
			curr.push(focusISO);
			tab1.getRange("A" + i + ":E" + i).setBackground("#ffffff");
		} else {
			tab1.getRange("A" + i + ":E" + i).setBackground("#d9d9d9");
		}
		
		tab1.getRange("A" + (i)).setValue(i - 3);
	}
}

function checkboxFunctions(e)
{
	let checkConv = ss.getRange('check_conversion');
	let checkOrdActive = ss.getRange('check_order_active');
	let checkOrdRank = ss.getRange('check_order_rank');
	let checkSetRanks = ss.getRange('check_set_ranks');
	let row = e.range.getRow();
	let col = e.range.getColumn();
	
	if (col >= checkConv.getColumn() &&
		col <= checkConv.getLastColumn() &&
		row >= checkConv.getRow() &&
		row <= checkConv.getLastRow()) {
			currencyConversion();
			checkConv.uncheck();
	} else if (	col >= checkOrdActive.getColumn() &&
		col <= checkOrdActive.getLastColumn() &&
		row >= checkOrdActive.getRow() &&
		row <= checkOrdActive.getLastRow()) {
			orderActive();
			checkOrdActive.uncheck();
	} else if (col >= checkOrdRank.getColumn() &&
		col <= checkOrdRank.getLastColumn() &&
		row >= checkOrdRank.getRow() &&
		row <= checkOrdRank.getLastRow()) {
			orderRank();
			checkOrdRank.uncheck();
	} else if (col >= checkSetRanks.getColumn() &&
		col <= checkSetRanks.getLastColumn() &&
		row >= checkSetRanks.getRow() &&
		row <= checkSetRanks.getLastRow()) {
			setRanks();
			checkSetRanks.uncheck();
	} else {
		return;
	}
}

  // Make sure the client is loaded and sign-in is complete before calling this method.
function rankedYoutubeCountries() {
	
	let ytData = gapi.client.youtubeAnalytics.reports.query({
      "dimensions": "country",
      "endDate": "2021-09-17",
      "ids": "channel==MINE",
	  "maxResults": 20,
      "metrics": "estimatedMinutesWatched",
      "sort": "-estimatedMinutesWatched",
      "startDate": "2021-08-17"
    });
	
	// let results = YouTube.Channels.list('contentDetails', {
		// id: "UC42VsoDtra5hMiXZSsD6eGg"
	// });

	// for (var i = 0; i < results.items.length; i++) {
		// var item = results.items[i];
		// var playlistId = item.contentDetails.relatedPlaylists.uploads;
		// var playlistResponse = YouTube.PlaylistItems.list('snippet', {
			// playlistId: playlistId,
			// maxResults: 20,
		// });
	// }

	console.log(ytData);
}