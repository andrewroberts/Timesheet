// 34567890123456789012345678901234567890123456789012345678901234567890123456789

// JSHint - 19th Nov 2019
/* jshint asi: true */

(function() {"use strict"})()

// Timesheet.gs
// ==============
//
// Dev: AndrewRoberts.net
//
// External interface to this script - all of the event handlers.
//
// This files contains all of the event handlers, plus miscellaneous functions 
// not worthy of their own files yet
//
// The filename is prepended with _API as the Github chrome extension won't 
// push a file with the same name as the project.

var Log_

// Public event handlers
// ---------------------
//
// All external event handlers need to be top-level function calls; they can't 
// be part of an object, and to ensure they are all processed similarily 
// for things like logging and error handling, they all go through 
// errorHandler_(). These can be called from custom menus, web apps, 
// triggers, etc
// 
// The main functionality of a call is in a function with the same name but 
// post-fixed with an underscore (to indicate it is private to the script)
//
// For debug, rather than production builds, lower level functions are exposed
// in the menu

//   :      [function() {},  '()',      'Failed to ', ],

var EVENT_HANDLERS = {

//                         Name                         onError Message                        Main Functionality
//                         ----                         ---------------                        ------------------
  onInstall:               ['onInstall()',              'Failed to install',                    onInstall_],
  initialize:              ['initialize()',             'Failed to initialize',                 initialize_],
  checkIn:                 ['checkIn()',                'checkIn failed',                       checkIn_],
  checkOut:                ['checkOut()',               'checkOut failed',                      checkOut_],
  isCheckedIn:               ['isCheckedIn()',              'isCheckedIn failed',                     isCheckedIn_],
}

// function (arg)                     {return eventHandler_(EVENT_HANDLERS., arg)}

function onInstall(arg1) {return eventHandler_(EVENT_HANDLERS.onInstall,arg1)}
function initialize(arg1) {return eventHandler_(EVENT_HANDLERS.initialize,arg1)}
function checkIn (arg1) {return eventHandler_(EVENT_HANDLERS.checkIn, arg1)}
function checkOut (arg1) {return eventHandler_(EVENT_HANDLERS.checkOut, arg1)}
function isCheckedIn (arg1) {return eventHandler_(EVENT_HANDLERS.isCheckedIn, arg1)}

// These can be opened in various authModes so it needs to be outside eventHandler_() 
function onOpen(arg1) {onOpen_(arg1)}

// Private Functions
// =================

// General
// -------

/**
 * All external function calls should call this to ensure standard 
 * processing - logging, errors, etc - is always done.
 *
 * @param {Array} config:
 *   [0] {Function} prefunction
 *   [1] {String} eventName
 *   [2] {String} onErrorMessage
 *   [3] {Function} mainFunction
 *
 * @param {Object}   arg1       The argument passed to the top-level event handler
 */

function eventHandler_(config, arg1) {
  
  try {

    var userEmail = 'unknown email'
    var initializeLog = false

    if (arg1 !== undefined && arg1 instanceof Object && arg1.hasOwnProperty('authMode')) {
    
      // arg1 is an event so need to check authMode
      if (arg1.authMode !== ScriptApp.AuthMode.NONE) { // LIMITED or FULL

        userEmail = Session.getEffectiveUser().getEmail()
        initializeLog = true
      }
      
    } else {

      // arg1 is not an event so assume we have sufficient auth to do the following
      userEmail = Session.getEffectiveUser().getEmail()
      initializeLog = true   
    }
    
    if (initializeLog) {
    
      Log_ = BBLog.getLog({
        level:                DEBUG_LOG_LEVEL_, 
        displayFunctionNames: DEBUG_LOG_DISPLAY_FUNCTION_NAMES_,
      })
      
      Log_.info('Handling ' + config[0] + ' from ' + (userEmail || 'unknown email') + ' (' + SCRIPT_NAME + ' ' + SCRIPT_VERSION + ')')
    }

    // Call the main function
    return config[2](arg1)
    
  } catch (error) {
  
    var handleError = Assert.HandleError.DISPLAY_FULL

    if (!PRODUCTION_VERSION_) {
      handleError = Assert.HandleError.THROW
    }

    var assertConfig = {
      error:          error,
      userMessage:    config[1],
      log:            Log_,
      handleError:    handleError, 
      sendErrorEmail: SEND_ERROR_EMAIL_, 
      emailAddress:   ADMIN_EMAIL_ADDRESS_,
      scriptName:     SCRIPT_NAME,
      scriptVersion:  SCRIPT_VERSION, 
    }

    Assert.handleError(assertConfig) 
  }
  
} // eventHandler_()

// Private event handlers
// ----------------------

function onInstall_(event){

  var triggerOpenId = properties.getProperty('triggerOpenId')
  
  if (triggerOpenId !== null) {
    properties.deleteProperty('triggerOpenId')
    
  }
    
  onOpen(event)
}

function onOpen_(event) {
    
  var menu = SpreadsheetApp
        .getUi()
        .createMenu('[ Timesheet ]')
        .addItem('Check In',  'checkIn')
        .addItem('Check Out', 'checkOut')
        
  if (event.authMode === ScriptApp.AuthMode.NONE) {
   
    menu.addItem('Start', 'initialize') 

  } else { // LIMITED or FULL
  
    var triggerOpenId = PropertiesService.getDocumentProperties().getProperty('triggerOpenId')
        
    if (triggerOpenId === null) {
  
      menu.addItem('Start', 'initialize')   
  
    } else {
    
      var html = HtmlService
      .createHtmlOutputFromFile("index")
      .setTitle("Check In/Check Out");
      SpreadsheetApp.getUi().showSidebar(html)
    }    
  }
  menu.addToUi()
}

function isCheckedIn_(properties) {

  var status = properties.getProperty("TIMESHEET_STATUS")
  Log_.fine('status: ' + status)

  if (status === "CHECKED_IN"){
    return true
  } else {
    return false
  }
}

function initialize_() {

  var properties = PropertiesService.getDocumentProperties()
  var timesheetId = SpreadsheetApp.getActive().getId()
  
  var triggerOpenId = ScriptApp
    .newTrigger('onOpen')
    .forSpreadsheet(timesheetId)
    .onOpen()
    .create()
    .getUniqueId()
    
  if (properties.getProperty('triggerOpenId') !== null) {
    throw new Error('There is already a trigger Open ID stored')
  }

  properties.setProperty('triggerOpenId', triggerOpenId)

}

/**
 * Private 'check in' event handler
 */

function checkIn_(documentProperties) {
  
  // See what the check in/out status currently is
  var status = documentProperties.getProperty(TIMESHEET_PROPERTY_STATUS)
  
  if (status === STATUS_CHECKED_IN) {
    
    // Not checked out
    uiErrorDialog('You have not checked out, so you cannot check in.')
    
  } else {
    
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME)    
    var lastRow = getLastRow_(sheet) 
       
    // Insert a new row under the last row (this new row will inherit formatting from the above row)
    
    sheet.insertRowAfter(lastRow)
    lastRow = lastRow + 1
    
    // Copy all the formulas from the previous above to our new row
    
    var sourceRange = sheet.getRange(lastRow-1, 1, 1, TIMESHEET_COLUMN_COUNT)
    var range = sheet.getRange(lastRow, 1, 1, TIMESHEET_COLUMN_COUNT)
    sourceRange.copyTo(range, SpreadsheetApp.CopyPasteType.PASTE_FORMULA, false)
    
    // CopyPasteType.PASTE_FORMULA seems to still copy values too
    // Not sure if this is a bug or a value is considered a formula too?
    // Anyway, we now need to clear the non-formula values
    var formulas = range.getFormulas()
    
    for (var count = 0; count < formulas[0].length; count++) {
      
      if (formulas[0][count] === '') {
        range = sheet.getRange(lastRow, count+1)
        range.setValue('')       
      } 
    }
    
    // Create an array for the new row values and insert them
    
    var currentDate = new Date()
    currentDate.setSeconds(0, 0)
    
    var newValues = [[ 
      currentDate, // Date
      currentDate, // Start
      currentDate  // End
    ]]
        
    range = sheet.getRange(lastRow, TIMESHEET_COLUMN_DATE, 1, newValues[0].length)
    range.setValues(newValues)
    range.activate()
    
    // Set the document properties
    documentProperties.setProperty(TIMESHEET_PROPERTY_STATUS, STATUS_CHECKED_IN)
    
    // Log the action
    Log_.info('Checked in at ' + currentDate)
  }
  
} // checkIn()


/**
 * Private 'check out' event handler
 */

function checkOut_(documentProperties) {

  // See what the check in/out status currently is
  var status = documentProperties.getProperty(TIMESHEET_PROPERTY_STATUS)
  
  if (status === null || status === STATUS_CHECKED_OUT) {
    
    // Not checked in
    uiErrorDialog('You have not checked in, so you cannot check out.')
    
  } else {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME)        
    var lastRow = getLastRow_(sheet)
    var range = sheet.getRange(lastRow, TIMESHEET_COLUMN_END)
    var currentDate = new Date()
    currentDate.setSeconds(0, 0)
    range.setValue(currentDate)
    range.activate()

    // Set the document properties
    documentProperties.setProperty(TIMESHEET_PROPERTY_STATUS, STATUS_CHECKED_OUT)
        
    // Log the action
    Log_.info('Checked out at ' + currentDate)
    
  }
     
} // checkOut_()

/**
 * @return {number} the last used row for time entries
 */

function getLastRow_(sheet) {
  
  Log_.functionEntryPoint()
  
  var lastRow = null
  
  var values = sheet.getRange(1, 1, sheet.getLastRow()).getValues()
  
  for (var count = 0; count < values.length; count++) {
    
    if (values[count][0] === "") {        
      lastRow = count
      break
    }                 
  }
  
  if (lastRow === null) {
    uiErrorDialog('Can not find the last empty row.')
  }
  
  return lastRow
  
} // getLastRow_()