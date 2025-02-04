const fs = require("fs");
const path = require("path");
const mkdirp = require("mkdirp");
const {
	loadSpreadsheet,
	localesPath,
	getPureKey,
	ns,
	lngs,
	sheetId,
	columnKeyToHeader,
	NOT_AVAILABLE_CELL,
} = require("./index");

async function downloadTranslationsToJson() {
	const doc = await loadSpreadsheet();
	const sheet = doc.sheetsById[sheetId];
	const rows = await sheet.getRows();

	const translations = {};

	lngs.forEach(lng => {
		translations[lng] = {};
	});

	rows.forEach(row => {
		const key = row[columnKeyToHeader.key];
		if (!key) return;

		lngs.forEach(lng => {
			const translation = row[columnKeyToHeader[lng]];
			if (translation && translation !== NOT_AVAILABLE_CELL) {
				translations[lng][key] = translation;
			}
		});
	});

	lngs.forEach(lng => {
		const dir = path.join(localesPath, lng);
		mkdirp.sync(dir);

		const filePath = path.join(dir, `${ns}.json`);
		fs.writeFileSync(filePath, JSON.stringify(translations[lng], null, 2), "utf8");
	});
}

downloadTranslationsToJson();
