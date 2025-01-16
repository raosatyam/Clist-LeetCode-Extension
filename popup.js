document.addEventListener('DOMContentLoaded', async () => {
    try {
        // First try to get any existing data
        chrome.runtime.sendMessage({ action: "getLatestData" }, (response) => {
            if (response && response.data) {
                updatePopup(response.data);
            }
        });

        // Then request current URL and trigger a new fetch
        chrome.runtime.sendMessage({ action: "getCurrentPageUrl" }, async (response) => {
            if (response && response.url) {
                try {
                    const tabs = await chrome.tabs.query({active: true, currentWindow: true});
                    if (tabs[0]?.id) {
                        chrome.tabs.sendMessage(tabs[0].id, {
                            action: "fetchData",
                            url: response.url
                        }).catch(error => {
                            console.log("Content script not ready or not a LeetCode page");
                        });
                    }
                } catch (error) {
                    console.log("Error sending message to content script:", error);
                }
            }
        });
    } catch (error) {
        console.log("Error in popup initialization:", error);
    }
});

// Listen for updates from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "updateData" && message.data) {
        updatePopup(message.data);
    }
    return true; // Keep the message channel open
});

function updatePopup(data) {
    try {
        document.getElementById("rating").textContent = data.rating || '';
        document.getElementById("name").textContent = data.name || '';
    } catch (error) {
        console.error('Error updating popup:', error);
    }
}