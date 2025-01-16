console.log("Content script loaded");

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "fetchData") {
        processLeetcodeUrl();
        sendResponse({ status: "fetching" }); // Acknowledge receipt
    }
    return true; // Keep the message channel open
});

function processLeetcodeUrl() {
    const currentUrl = window.location.href;
    
    if (currentUrl.includes('leetcode.com') && currentUrl.includes('problems')) {
        const processedUrl = currentUrl.split('description')[0];
        fetchData(processedUrl);
    }
}

async function fetchData(processedUrl) {
    try {
        const res = await fetch(`https://clist.by/api/v4/problem/?archive_url__regex=${encodeURIComponent(processedUrl)}`, {
            headers: {
                'Authorization': CONFIG.API_KEY
            }
        });

        if (res.ok) {
            const record = await res.json();
            if (record.objects && record.objects.length > 0) {
                const data = record.objects[0];
                
                // Send data to background script with error handling
                try {
                    await chrome.runtime.sendMessage({
                        action: "updateData",
                        data: data
                    });
                } catch (error) {
                    console.log("Background script not available, will retry later");
                }
            }
        } else {
            console.error('Failed to fetch data:', res.statusText);
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Initial load
processLeetcodeUrl();