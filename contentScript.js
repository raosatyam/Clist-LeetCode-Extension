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
    let processedUrl = currentUrl
    if (currentUrl.includes('leetcode.com') && currentUrl.includes('problems')) {
        if(currentUrl.includes('description')) {
            processedUrl = currentUrl.split('description')[0];
        } else if(currentUrl.includes('?')) {
            processedUrl = currentUrl.split('?')[0];
        } 
        // else if(currentUrl.includes('?envType')) {
        //     processedUrl = currentUrl.split('?slug')[0];
        // }
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
                // Send data to background script for storage
                await chrome.runtime.sendMessage({
                    action: "storeData",
                    url: processedUrl,
                    data: data
                });
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