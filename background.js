// Store the latest data
let latestData = null;

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
    else if (message.action === "storeData") {
        // Store the data in chrome.storage.session
        chrome.storage.session.set({
            ProblemData: {
                url: message.url,
                data: message.data,
                timestamp: Date.now()
            }
        }).then(() => {
            latestData = message.data;
            // Try to update popup if it's open
            chrome.runtime.sendMessage({
                action: "updateData",
                data: message.data
            }).catch(() => {
                // Suppress error if popup is not open
                console.log("Popup not open, data stored in session storage");
            });
        });
    }
    else if (message.action === "getStoredData") {
        chrome.storage.session.get('ProblemData', (result) => {
            sendResponse(result);
        });
        return true;
    }
});
