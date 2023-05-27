import { google } from 'googleapis';

async function handler(req, res) {
  if (req.method === 'GET') {
    const { name, message } = req.body;
    console.log("api triggered");

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

    res.status(201).json({mappedData});
  }
  //res.status(200).json({ message: 'Hey!' });
}

export default handler;
