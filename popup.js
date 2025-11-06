const searchInput = document.getElementById("search");
const resultsList = document.getElementById("results");

let selectedIndex = -1;
let filteredTabs = [];

// Fetch all open tabs
async function getTabs() {
  return await chrome.tabs.query({});
}

// Display the tabs in the list
function displayTabs(tabs) {
  resultsList.innerHTML = "";
  tabs.forEach((tab, index) => {
    const li = document.createElement("li");
    li.className = "tab";
    
    // Create favicon element
    const favicon = document.createElement("img");
    favicon.className = "tab-favicon";
    favicon.src = tab.favIconUrl || "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path fill='%23999' d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z'/></svg>";
    favicon.onerror = () => {
      favicon.src = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path fill='%23999' d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z'/></svg>";
    };
    
    // Create text content container
    const textContainer = document.createElement("span");
    textContainer.className = "tab-text";
    textContainer.textContent = tab.title || tab.url;
    textContainer.title = tab.url;
    
    li.dataset.index = index;
    li.appendChild(favicon);
    li.appendChild(textContainer);
    
    li.onclick = () => {
      switchToTab(tab);
    };
    li.addEventListener('mouseover', () => {
      selectedIndex = index;
      updateSelection();
    });
    resultsList.appendChild(li);
  });
}

// Filter tabs by query
async function filterTabs(query) {
  const tabs = await getTabs();
  const filtered = tabs.filter(
    (tab) =>
      tab.title.toLowerCase().includes(query.toLowerCase()) ||
      tab.url.toLowerCase().includes(query.toLowerCase())
  );
  displayTabs(filtered);
  filteredTabs = filtered;
  selectedIndex = -1;
}

// Switch to tab and close popup
function switchToTab(tab) {
  chrome.tabs.update(tab.id, { active: true });
  chrome.windows.update(tab.windowId, { focused: true });
  window.close();
}

// Update visual selection
function updateSelection() {
  document.querySelectorAll('.tab').forEach((element, index) => {
    element.classList.toggle('selected', index === selectedIndex);
  });
}

// Navigate results with arrow keys
function navigateResults(direction) {
  selectedIndex = Math.max(-1, Math.min(selectedIndex + direction, filteredTabs.length - 1));
  updateSelection();
  
  // Ensure selected item is visible
  const selectedElement = document.querySelector('.tab.selected');
  if (selectedElement) {
    selectedElement.scrollIntoView({ block: 'nearest' });
  }
}

// Auto-focus the search bar
window.addEventListener("load", () => {
  searchInput.focus();
});

// Listen for typing
searchInput.addEventListener("input", (e) => {
  filterTabs(e.target.value);
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
  switch(e.key) {
    case 'ArrowDown':
      e.preventDefault();
      navigateResults(1);
      break;
    case 'ArrowUp':
      e.preventDefault();
      navigateResults(-1);
      break;
    case 'Enter':
      if (selectedIndex >= 0 && selectedIndex < filteredTabs.length) {
        switchToTab(filteredTabs[selectedIndex]);
      }
      break;
  }
});

// Show all tabs on open
(async () => {
  const tabs = await getTabs();
  displayTabs(tabs);
  filteredTabs = tabs;
})();