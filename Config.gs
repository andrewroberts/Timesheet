// 34567890123456789012345678901234567890123456789012345678901234567890123456789

// JSHint - TODO
/* jshint asi: true */

(function() {"use strict"})()

// Code review all files - TODO
// JSHint review (see files) - TODO
// Unit Tests - TODO
// System Test (Dev) - TODO
// System Test (Prod) - TODO

// Config.gs
// =========
//
// Dev: AndrewRoberts.net
//
// All the constants and configuration settings

// Configuration
// =============

var SCRIPT_NAME = "GAS Framework"
var SCRIPT_VERSION = "v1.0 (Dev)"

var PRODUCTION_VERSION_ = false

// Log Library
// -----------

var DEBUG_LOG_LEVEL_ = PRODUCTION_VERSION_ ? BBLog.Level.INFO : BBLog.Level.FINER
var DEBUG_LOG_DISPLAY_FUNCTION_NAMES_ = PRODUCTION_VERSION_ ? BBLog.DisplayFunctionNames.NO : BBLog.DisplayFunctionNames.YES

// Assert library
// --------------

var SEND_ERROR_EMAIL_ = PRODUCTION_VERSION_ ? true : false
var HANDLE_ERROR_ = Assert.HandleError.THROW
var ADMIN_EMAIL_ADDRESS_ = 'andrewr1969@gmail.com'

// Constants/Enums
// ===============

var SHEET_NAME = 'Timesheet'

// Properties
var TIMESHEET_PROPERTY_STATUS = 'TIMESHEET_STATUS'
var TIMESHEET_PROPERTY_LAST_ROW = 'TIMESHEET_LAST_ROW'

// Constants
var STATUS_CHECKED_IN = 'CHECKED_IN'
var STATUS_CHECKED_OUT = 'CHECKED_OUT'

// Columns in the Timesheet
var columnNumber = 1;
var TIMESHEET_COLUMN_DATE = columnNumber; columnNumber++
var TIMESHEET_COLUMN_START = columnNumber; columnNumber++
var TIMESHEET_COLUMN_END = columnNumber; columnNumber++
var TIMESHEET_COLUMN_TIME = columnNumber; columnNumber++
var TIMESHEET_COLUMN_BILLABLE = columnNumber; columnNumber++
var TIMESHEET_COLUMN_TOTAL = columnNumber; columnNumber++
var TIMESHEET_COLUMN_HOURS = columnNumber; columnNumber++
var TIMESHEET_COLUMN_BURNUP = columnNumber; columnNumber++
var TIMESHEET_COLUMN_ACTUAL_BURNDOWN = columnNumber; columnNumber++
var TIMESHEET_COLUMN_PREDICTED_BURNDOWN = columnNumber; columnNumber++
var TIMESHEET_COLUMN_BLANK = columnNumber; columnNumber++
var TIMESHEET_COLUMN_EOD = columnNumber; columnNumber++
var TIMESHEET_COLUMN_VELOCITY = columnNumber; columnNumber++
var TIMESHEET_COLUMN_INVOICE = columnNumber; columnNumber++
var TIMESHEET_COLUMN_TASK_NOTES = columnNumber; columnNumber++
var TIMESHEET_COLUMN_COUNT = columnNumber--


// Function Template
// -----------------

/**
 *
 *
 * @param {Object} 
 *
 * @return {Object}
 */
 
function functionTemplate() {

  Log_.functionEntryPoint()
  
  

} // functionTemplate() 
