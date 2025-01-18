document.addEventListener('DOMContentLoaded', async () => {
    try {
        const tabs = await chrome.tabs.query({active: true, currentWindow: true});
        const currentUrl = tabs[0].url;

        if (currentUrl.includes('leetcode.com') && currentUrl.includes('problems/')) {
            mainContent.classList.remove('hidden');
            errorContent.classList.add('hidden');

            // Try to get stored data through background script
            chrome.runtime.sendMessage({ action: "getStoredData" }, (response) => {
                if (response.ProblemData) {
                    const processedUrl = currentUrl.split('description')[0];
                    
                    // Check if stored data is for current URL
                    if (response.ProblemData.url === processedUrl) {
                        console.log('Using stored data');
                        updatePopup(response.ProblemData.data);
                        return;
                    }
                }

                // If no stored data or different URL, fetch new data
                console.log('Fetching new data');
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: "fetchData",
                    url: currentUrl
                });
            });
        } else if (currentUrl.includes('hackerrank.com') && currentUrl.includes('/problem')) {
            mainContent.classList.remove('hidden');
            errorContent.classList.add('hidden');

            // Try to get stored data through background script
            chrome.runtime.sendMessage({ action: "getStoredData" }, (response) => {
                if (response.ProblemData) {
                    // Check if stored data is for current URL
                    if (response.ProblemData.url === currentUrl) {
                        console.log('Using stored data');
                        updatePopup(response.ProblemData.data);
                        return;
                    }
                }

                // If no stored data or different URL, fetch new data
                console.log('Fetching new data');
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: "fetchData",
                    url: currentUrl
                });
            });
        } else if (currentUrl.includes('codeforces.com') && currentUrl.includes('/problem/')) {
            mainContent.classList.remove('hidden');
            errorContent.classList.add('hidden');

            // Try to get stored data through background script
            chrome.runtime.sendMessage({ action: "getStoredData" }, (response) => {
                if (response.ProblemData) {
                    const processedUrl = currentUrl.replace("https", "http");
                    
                    // Check if stored data is for current URL
                    if (response.ProblemData.url === processedUrl) {
                        console.log('Using stored data');
                        updatePopup(response.ProblemData.data);
                        return;
                    }
                }

                // If no stored data or different URL, fetch new data
                console.log('Fetching new data');
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: "fetchData",
                    url: currentUrl
                });
            });
        } else {
            mainContent.classList.add('hidden');
            errorContent.classList.remove('hidden');
        }
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
        // document.getElementById("rating").textContent = data.rating || '';
        updateRating(data.rating);
        document.getElementById("name").textContent = data.name || '';
    } catch (error) {
        console.error('Error updating popup:', error);
    }
}

function updateRating(rating) {
    const ratingElement = document.getElementById('rating');
    const starsElement = document.getElementById('stars');
    let stars = '';
    let colorClass = '';
    
    // Determine number of stars and color based on rating
    if (rating < 900) {
        stars = '★'.repeat(1);
        colorClass = 'rating-beginner';
    } else if (rating < 1300) {
        stars = '★'.repeat(2);
        colorClass = 'rating-easy';
    } else if (rating < 1600) {
        stars = '★'.repeat(3);
        colorClass = 'rating-medium';
    } else if (rating < 2000) {
        stars = '★'.repeat(4);
        colorClass = 'rating-hard';
    } else if (rating < 2400) {
        stars = '★'.repeat(5);
        colorClass = 'rating-expert';
    } else if (rating < 2800) {
        stars = '★'.repeat(6);
        colorClass = 'rating-master';
    } else {
        stars = '★'.repeat(7);
        colorClass = 'rating-grandmaster';
    }

    ratingElement.textContent = rating;
    ratingElement.className = `rating ${colorClass}`;
    starsElement.innerHTML = `<span class="star ${colorClass}">${stars}</span>`;
}