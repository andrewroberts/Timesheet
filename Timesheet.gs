// 34567890123456789012345678901234567890123456789012345678901234567890123456789

// JSHint - TODO
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

//                         Initial actions  Name                         onError Message                        Main Functionality
//                         ---------------  ----                         ---------------                        ------------------

  checkIn:                 [function() {},  'checkIn()',                'checkIn failed',                       checkIn_],
  checkOut:                [function() {},  'checkOut()',               'checkOut failed',                      checkOut_],
}

// function (arg)                     {return eventHandler_(EVENT_HANDLERS., arg)}

function checkIn (arg1, arg2, properties, lock) {return eventHandler_(EVENT_HANDLERS.checkIn, arg1, arg2, properties, lock)}
function checkOut (arg1, arg2, properties, lock) {return eventHandler_(EVENT_HANDLERS.checkOut, arg1, arg2, properties, lock)}


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
 
 * @param {Object}   arg1       The argument passed to the top-level event handler
 * @param {Object}   arg2       The argument passed to the top-level event handler
 * @param {Property} properties A PropertiesService
 * @param {Lock}     lock       A LockService
 */

function eventHandler_(config, arg1, arg2, properties, lock) {

  // Check the parameters

  if (typeof arg1 === 'undefined') {
    throw new Error('The first argument has to be defined or set to null')
  } 

  if (typeof arg2 === 'undefined') {
    throw new Error('The second argument has to be defined or set to null')
  } 

  try {

    properties.getProperties()
    
  } catch (error) {
  
    if (error.message.indexOf('Cannot call method "getProperties" of undefined') !== -1) {
    
      throw new Error('The third argument has to be one of the PropertiesServices')
      
    } else {
    
      throw error
    }
  }
  
  try {

    lock.hasLock()
    
  } catch (error) {
  
    if (error.message.indexOf('Cannot call method "hasLock" of undefined') !== -1) {
    
      throw new Error('The fourth argument has to be one of the LockService')
      
    } else {
    
      throw error
    }
  }

  // Perform the main functionality
  var originallyHasLock
  try {

    originallyHasLock = lock.hasLock()

    // Perform any initial functions
    config[0]()    
    
    originallyHasLock = lock.hasLock() 
    
    initialseEventHandler()
    
    var userEmail = Session.getEffectiveUser().getEmail()
    Log_.info('Handling ' + config[1] + ' from ' + (userEmail || 'unknown email') + ' (' + SCRIPT_NAME + ' ' + SCRIPT_VERSION + ')')
    
    // Call the main function
    return config[3](arg1, arg2)
    
  } catch (error) {
  
    Assert.handleError(error, config[2], Log_)
    
  } finally {
  
    if (!originallyHasLock) {
      lock.releaseLock()
    }
  }
  
  return
  
  // Private Functions
  // -----------------

  /**
   * Initialise the event handling
   */
 
  function initialseEventHandler() {
      
    var userEmail = Session.getEffectiveUser().getEmail()

    Assert.init({
      handleError:    HANDLE_ERROR_, 
      sendErrorEmail: SEND_ERROR_EMAIL_, 
      emailAddress:   ADMIN_EMAIL_ADDRESS_ + ',' + userEmail,
      scriptName:     SCRIPT_NAME,
      scriptVersion:  SCRIPT_VERSION, 
    })

    if (PRODUCTION_VERSION_) {
    
      var firebaseUrl = properties.getProperty(PROPERTY_FIREBASE_URL)
      var firebaseSecret = properties.getProperty(PROPERTY_FIREBASE_SECRET)

      Log_ = BBLog.getLog({
        displayUserId:        BBLog.DisplayUserId.USER_KEY_FULL,
        lock:                 lock,
        firebaseUrl:          firebaseUrl,
        firebaseSecret:       firebaseSecret,
      });
    
    } else {

      Log_ = BBLog.getLog({
        level:                DEBUG_LOG_LEVEL_, 
        displayFunctionNames: DEBUG_LOG_DISPLAY_FUNCTION_NAMES_,
        lock:                 lock,
      })
    }

  } // eventHandler_.initialseEventHandler() 

} // eventHandler_()

// Private event handlers
// ----------------------


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
    // Get the last row
    var lastRow = documentProperties.getProperty(TIMESHEET_PROPERTY_LAST_ROW)
    if (lastRow === null) {
      // No property set so (for now at least) we assume the last row is 2
      // TODO - check with Andrew how to identify last row, will template start blank or with a first row?
      //        using a property to store last row of course means you can't manually insert rows and have script
      //        continue to work so we may want to do something else?
      lastRow = 2
    }
    else {
      lastRow = parseInt(lastRow, 10)
    }
   
    // Insert a new row under the last row (this new row will inherit formatting from the above row)
    // TODO - will the template start with all the formatting or do we want to start with a blank sheet
    //        and set all the formatting options here?
    // TODO - check with Andrew how to identify sheet - for now by sheet name
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME).insertRowAfter(lastRow)
    lastRow = lastRow + 1
    
    // Copy all the formulas from the previous above to our new row
    var sourceRange = sheet.getRange(lastRow-1, 1, 1, TIMESHEET_COLUMN_COUNT)
    var range = sheet.getRange(lastRow, 1, 1, TIMESHEET_COLUMN_COUNT)
    sourceRange.copyTo(range, SpreadsheetApp.CopyPasteType.PASTE_FORMULA, false)
    
    // CopyPasteType.PASTE_FORMULA seems to still copy values too
    // Not sure if this is a bug or a value is considered a formula too?
    // Anyway, we now need to clear the non-formula values
    var formulas = range.getFormulas();
    for (var count = 0; count < formulas[0].length; count++) {
      if(formulas[0][count] === '') {
        range = sheet.getRange(lastRow, count+1)
        range.setValue('')
      }    
    }
    
    // Create an array for the new row values and insert them
    var currentDate = new Date()
    currentDate.setSeconds(0, 0)
    var newValues = 
        [ 
          [ 
            currentDate, // Date
            currentDate, // Start
            currentDate  // End
          ]
        ];    
    range = sheet.getRange(lastRow, TIMESHEET_COLUMN_DATE, 1, newValues[0].length)
    range.setValues(newValues)
    
    // Set the document properties
    documentProperties.setProperty(TIMESHEET_PROPERTY_LAST_ROW, lastRow)
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
    // Get the last row
    var lastRow = documentProperties.getProperty(TIMESHEET_PROPERTY_LAST_ROW)
    
    // Insert the check out time
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME)        
    var range = sheet.getRange(lastRow, TIMESHEET_COLUMN_END)
    var currentDate = new Date()
    currentDate.setSeconds(0, 0)
    range.setValue(currentDate)

    // Set the document properties
    documentProperties.setProperty(TIMESHEET_PROPERTY_STATUS, STATUS_CHECKED_OUT)
        
    // Log the action
    Log_.info('Checked out at ' + currentDate)
  }
     
} // checkOut()


