const path = require("path");
const updateCalendarApi = require("./services/updateCalendarService.js");

function main() {
    let jsonFilePath = path.join(process.cwd(), "data", "2024.json");
    updateCalendarApi(jsonFilePath);
}

main();