function createMenu()
{
	const ui = SpreadsheetApp.getUi();
	const menu = ui.createMenu("Automation");
	menu.addItem("Conversions", "currencyConversion");
	menu.addToUi();
}

function onOpen()
{
	createMenu();
}