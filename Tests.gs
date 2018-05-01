// 34567890123456789012345678901234567890123456789012345678901234567890123456789

// Tests.gs
// ========
//
// Dev: codlord.com
//
// Code for internal/unit testing


function resetProperties(properties) {
  
  properties.deleteProperty(TIMESHEET_PROPERTY_LAST_ROW)
  properties.deleteProperty(TIMESHEET_PROPERTY_STATUS)
    
} // resetProperties()


// ********************************************************************************
// uiErrorDialog
//
// INPUTS:
//   message - The error message to display.
// RETURN:
//   NONE
//
// DESCRIPTION:
// Displays an error dialog to the user with just an OK button.
// ********************************************************************************
function uiErrorDialog(message) {
  
  var ui = SpreadsheetApp.getUi(); 
  
  ui.alert(
    "ERROR",
    message,
    ui.ButtonSet.OK);
    
} // uiErrorDialog()


// ********************************************************************************
// uiMessageDialog
//
// INPUTS:
//   title - The title of the dialog box.
//   message - The message to display.
// RETURN:
//   NONE
//
// DESCRIPTION:
// Displays a message dialog to the user with just an OK button.
// ********************************************************************************
function uiMessageDialog(title, message) {
  
  var ui = SpreadsheetApp.getUi(); 
  
  ui.alert(
    title,
    message,
    ui.ButtonSet.OK);
    
} // uiMessageDialog()