// Listen for the keyboard shortcut command
chrome.commands.onCommand.addListener((command) => {
  if (command === "open_tab_search") {
    // Opens the popup UI for the extension action
    chrome.action.openPopup();
  }
});
