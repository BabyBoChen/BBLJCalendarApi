class GovernmentCalendar {
	///** @type {number} */
	//GovernmentCalendarId = 0; //pk
	/** @type {string} */
	DateString = "1900-01-01";
	/** @type {number} */
	Year = 1900;
	/** @type {number} */
	Month = 1; // 1~12
	/** @type {number} */
	Date = 1; // 1~31
	/** @type {number} */
	Day = 5;  // 0~6
	/** @type {number} */
	IsHoliday = 0; //0=false,1=true
	/** @type {string} */
	Description = "";
}

module.exports = GovernmentCalendar;