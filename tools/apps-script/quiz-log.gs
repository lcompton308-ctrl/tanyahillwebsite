/**
 * Which Boss Are You? results log
 * Lives in Tanya's Google Sheet "Which Boss Are You? results" (Extensions > Apps Script).
 *
 * The website sends name, colour, second colour, scores and results link when someone
 * finishes the quiz. Never email addresses or phone numbers.
 *  - doPost      adds a row to the sheet and emails Tanya a short note
 *  - setup       run once: adds the headings, the Client tick-box column and the daily clean-up
 *  - cleanUp     runs daily: deletes rows older than 12 months unless Client is ticked
 */

var SHEET_NAME = "Results";
var SEND_EMAIL = true;          // set to false to stop the "new quiz result" emails
var KEEP_DAYS = 365;            // privacy policy says 12 months
var SITE = "https://tanyahill.co.uk/";
var COLOURS = ["Red", "Yellow", "Green", "Blue"];
var HEADINGS = ["Date", "Name", "Colour", "Second colour", "Scores", "Results link", "Client"];

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    var d = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    var name = clean(d.name, 40);
    var colour = COLOURS.indexOf(d.colour) > -1 ? d.colour : "";
    var second = COLOURS.indexOf(d.second) > -1 ? d.second : "";
    var link = typeof d.link === "string" && d.link.indexOf(SITE) === 0 ? clean(d.link, 300) : "";
    if (!name || !colour) return ok();          // ignore anything that isn't a real quiz result

    lock.waitLock(10000);
    var sh = sheet();
    sh.appendRow([new Date(), name, colour, second, clean(d.scores, 80), link, false]);
    sh.getRange(sh.getLastRow(), 7).insertCheckboxes();

    if (SEND_EMAIL) {
      MailApp.sendEmail({
        to: Session.getEffectiveUser().getEmail(),
        subject: "New assessment result: " + name + " is " + colour,
        body: name + " just finished Which Boss Are You?\n\n" +
              "Colour: " + colour + (second ? " (second: " + second + ")" : "") + "\n" +
              "Scores: " + clean(d.scores, 80) + "\n" +
              (link ? "Their results: " + link + "\n" : "") +
              "\nThey haven't given contact details. If they want to talk it through, they'll message you on WhatsApp.\n" +
              "All results: " + SpreadsheetApp.getActiveSpreadsheet().getUrl()
      });
    }
  } catch (err) {
    console.error(err);
  } finally {
    try { lock.releaseLock(); } catch (x) {}
  }
  return ok();
}

function doGet() {
  return ContentService.createTextOutput("Which Boss Are You? log is running.");
}

function setup() {
  var sh = sheet();
  sh.getRange(1, 1, 1, HEADINGS.length).setValues([HEADINGS]).setFontWeight("bold");
  sh.setFrozenRows(1);
  sh.getRange("A:A").setNumberFormat("d mmm yyyy, hh:mm");
  sh.setColumnWidth(5, 220);
  sh.setColumnWidth(6, 260);
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === "cleanUp") ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger("cleanUp").timeBased().everyDays(1).atHour(3).create();
}

function cleanUp() {
  var sh = sheet();
  var last = sh.getLastRow();
  if (last < 2) return;
  var rows = sh.getRange(2, 1, last - 1, HEADINGS.length).getValues();
  var cutoff = new Date(Date.now() - KEEP_DAYS * 24 * 60 * 60 * 1000);
  for (var i = rows.length - 1; i >= 0; i--) {
    var date = rows[i][0], client = rows[i][6] === true;
    if (date instanceof Date && date < cutoff && !client) sh.deleteRow(i + 2);
  }
}

function sheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0].setName(SHEET_NAME);
}

// Plain text only, and never starting with = + - @ so the sheet can't run it as a formula.
function clean(v, max) {
  var s = String(v == null ? "" : v).replace(/[\r\n\t]+/g, " ").trim().slice(0, max);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function ok() {
  return ContentService.createTextOutput("ok");
}
