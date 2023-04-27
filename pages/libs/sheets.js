import { google } from 'googleapis';


export async function getDataFromSheets() {
  try {
    const target = ["https://www.googleapis.com/auth/spreadsheets.readonly"];
    const jwt = new google.auth.JWT(
      process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      null,
      (process.env.GOOGLE_SHEETS_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
      target
    );

    const sheets = google.sheets({ version: "v4", auth: jwt });
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: process.env.SPREADSHEET_NAME,
    });

    const rows = response.data.values;
    const mappedData = rows.map((row) => ({
      start_date: row[0] || null,
      end_date: row[1] || null,
      category: row[2] || null,
      event_name: row[3] || null,
      location: row[4] || null,
      cost: row[5] || null,
      additional_information: row[6] || null,
    }));
    return mappedData;
  } catch (err) {
    console.log(err);
  }

  return [];
}