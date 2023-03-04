const http = require("http");
const url = require("url");
const sqlite = require("sqlite3").verbose();
const path = require("path");

const DB_PATH = path.join(process.cwd(), "data", "BBLJCalendar.db");

/** @param req {http.IncomingMessage}  @param res {http.ServerResponse<http.IncomingMessage>} */
function calendarApi(req, res) {
    const q = url.parse(req.url, true);
    //console.log(q.query);
    res.writeHead(200, {
        'Content-Type': 'application/json',
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "*",
    });
    let db = new sqlite.Database(DB_PATH, (err) => {
        if (err) {
            console.log(DB_PATH);
            console.error(err.message);
        }
    });
    if (db) {
        let sql = "SELECT * FROM GovernmentCalendar WHERE Year = ? AND Month = ?";
        db.all(sql, [q.query.y, q.query.m], function (err, rows) {
            let jsonStr = "";
            jsonStr += JSON.stringify(rows);
            jsonStr += "";
            res.end(jsonStr);
        });
        db.close();
    }
};

module.exports = calendarApi;