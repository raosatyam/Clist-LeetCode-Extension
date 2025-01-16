// Store the latest data
let latestData = null;

// Helper function to check if a tab is available for messaging
async function isTabAvailable(tabId) {
    try {
        await chrome.tabs.get(tabId);
        return true;
    } catch {
        return false;
    }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "getCurrentPageUrl") {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs && tabs[0]) {
                sendResponse({ url: tabs[0].url });
            } else {
                sendResponse({ error: "No active tab found" });
            }
        });
        return true; // Keep the message channel open
    } 
    else if (message.action === "updateData") {
        // Store the data
        if (message.data) {
            latestData = message.data;
        }
        
        // Only try to relay if there's a popup to receive it
        try {
            chrome.runtime.sendMessage(message).catch(() => {
                // Suppress errors when popup isn't open
                console.log("Popup not available, data stored");
            });
        } catch (error) {
            console.log("Error sending message, but data is stored:", error);
        }
    } 
    else if (message.action === "getLatestData") {
        sendResponse({ data: latestData });
        return true;
    }
});

// Handle errors when sending messages
chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
    sendResponse({ error: "External messaging not supported" });
    return true;
});