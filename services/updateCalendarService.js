const fs = require("fs");
const GovernmentCalendar = require("../models/governmentCalendar.js");
const path = require("path");
const { Database } = require("sqlite3");
const sqlite = require("sqlite3").verbose();

/** @param {string} jsonFilePath*/
function updateCalendarApi(jsonFilePath) {
    /** @type {Array} */
    let calendarDates = readFromJsonFile(jsonFilePath);   
    /** @type {[GovernmentCalendar]} */
    let governmentCalendars = parseCalendarFromArray(calendarDates);    
    //console.log(governmentCalendars.length);
    const DB_PATH = path.join(process.cwd(), "data", "BBLJCalendar.db");
    let db = new sqlite.Database(DB_PATH, (err) => {
        if (err) {
            //console.log(DB_PATH);
            console.error(err.message);
        }
    });
    if (db) {
        try {
            db.run("BEGIN TRANSACTION", function () {
                updateCalendar(governmentCalendars, 0, db);
            });
        } catch (e) {
            console.error(err.message);
            db.run('ROLLBACK');
        }
        db?.close();
    }
}

/** @param jsonFilePath {string} @returns {Array}*/
function readFromJsonFile(jsonFilePath) {
    let rawdata = fs.readFileSync(jsonFilePath);
    let calendarDates = JSON.parse(rawdata);
    return calendarDates;
}

/** @param calendarDates {Array} @returns {[GovernmentCalendar]}*/
function parseCalendarFromArray(calendarDates) {
    /** @type {[GovernmentCalendar]}*/
    let governmentCalendars = [];
    calendarDates.forEach(function (dateInfo) {
        let gc = new GovernmentCalendar();
        let theDate = new Date(dateInfo["西元日期"].replace(/(\d+)(\d{2})(\d{2})/g, '$1-$2-$3'));
        gc.DateString = `${theDate.getFullYear()}-${(theDate.getMonth() + 1).toString().padStart(2, '0')}-${theDate.getDate().toString().padStart(2, '0')}`;
        gc.Year = theDate.getFullYear();
        gc.Month = theDate.getMonth() + 1;
        gc.Date = theDate.getDate();
        if (dateInfo["星期"] == "日") {
            gc.Day = 0;
        } else if (dateInfo["星期"] == "一") {
            gc.Day = 1;
        } else if (dateInfo["星期"] == "二") {
            gc.Day = 2;
        } else if (dateInfo["星期"] == "三") {
            gc.Day = 3;
        } else if (dateInfo["星期"] == "四") {
            gc.Day = 4;
        } else if (dateInfo["星期"] == "五") {
            gc.Day = 5;
        } else if (dateInfo["星期"] == "六") {
            gc.Day = 6;
        }
        if (dateInfo["是否放假"] == "2") {
            gc.IsHoliday = 1;
        }
        gc.Description = dateInfo["備註"];
        governmentCalendars.push(gc);
    });
    return governmentCalendars;
}
/** @param governmentCalendars {[GovernmentCalendar]} @param i {number} @param db {Database} */
function updateCalendar(governmentCalendars, i, db) {
    let gc = governmentCalendars[i];
    //delete if exists
    let sql = "DELETE FROM GovernmentCalendar WHERE DateString = ?";
    db.run(sql, [gc.DateString], function (err) {
        //insert after deleting
        if (!err) {
            /** @type {string}*/
            let columns = null;
            /** @type {string}*/
            let values = null;
            let parameters = [];
            Object.entries(gc).forEach(function (prop) {
                if (!columns) {
                    columns = "";
                } else {
                    columns += ",";
                }
                columns += `[${prop[0]}]`;
                if (!values) {
                    values = "";
                } else {
                    values += ",";
                }
                values += "?";
                parameters.push(prop[1]);
            });
            sql = `INSERT INTO GovernmentCalendar (${columns}) VALUES(${values})`;
            //console.log(sql);
            db.run(sql, parameters, function (err) {
                if (!err) {
                    if (i < governmentCalendars.length - 1) {
                        //update next
                        updateCalendar(governmentCalendars, i + 1, db);
                    } else {
                        //commit!
                        db.run("COMMIT");
                    }
                } else {
                    throw err;
                }
            });
        } else {
            throw err;
        }
    });
}

module.exports = updateCalendarApi;