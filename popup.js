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
  tabs.forEach((tab) => {
    const li = document.createElement("li");
    li.className = "tab";
    li.textContent = tab.title || tab.url;
    li.title = tab.url;
    li.onclick = () => {
      chrome.tabs.update(tab.id, { active: true });
      chrome.windows.update(tab.windowId, { focused: true });
    };
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
}

// Auto-focus the search bar even when opened via shortcut
window.addEventListener("load", () => {
  searchInput.focus();
});

// Listen for typing
searchInput.addEventListener("input", (e) => {
  filterTabs(e.target.value);
});

// Show all tabs on open
(async () => {
  const tabs = await getTabs();
  displayTabs(tabs);
})();

document.addEventListener('DOMContentLoaded', () => {
    searchInput.focus();

    // Load and display all tabs initially
    chrome.tabs.query({}, (tabs) => {
        filteredTabs = tabs;
        displayResults(tabs);
    });

    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase();
        chrome.tabs.query({}, (tabs) => {
            filteredTabs = tabs.filter(tab => 
                tab.title.toLowerCase().includes(query) || 
                tab.url.toLowerCase().includes(query)
            );
            displayResults(filteredTabs);
            selectedIndex = -1;
        });
    });

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
});

function displayResults(tabs) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    tabs.forEach((tab, index) => {
        const tabElement = document.createElement('div');
        tabElement.className = 'tab-item';
        tabElement.innerHTML = `
            <img class="tab-favicon" src="${tab.favIconUrl || 'icon.png'}" onerror="this.src='icon.png'">
            <span class="tab-title">${tab.title}</span>
        `;
        
        tabElement.addEventListener('click', () => switchToTab(tab));
        tabElement.addEventListener('mouseover', () => {
            selectedIndex = index;
            updateSelection();
        });

        resultsDiv.appendChild(tabElement);
    });
}

function navigateResults(direction) {
    selectedIndex = Math.max(-1, Math.min(selectedIndex + direction, filteredTabs.length - 1));
    updateSelection();
    
    // Ensure selected item is visible
    const selectedElement = document.querySelector('.tab-item.selected');
    if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' });
    }
}

function updateSelection() {
    document.querySelectorAll('.tab-item').forEach((element, index) => {
        element.classList.toggle('selected', index === selectedIndex);
    });
}

function switchToTab(tab) {
    chrome.tabs.update(tab.id, { active: true });
    chrome.windows.update(tab.windowId, { focused: true });
    window.close();
}
