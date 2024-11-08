// // Function to get user profile from storage
// function getUserProfile() {
//   return new Promise((resolve) => {
//     chrome.storage.sync.get(['userProfile'], function(result) {
//       resolve(result.userProfile || {});
//     });
//   });
// }

// // Function to send request to our backend
// async function getPersonalizedResults(query, userProfile) {
//   try {
//     console.log('Sending request to backend:', { query, userProfile });
//     const response = await fetch('http://127.0.0.1:5000/personalize', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Origin': chrome.runtime.id ? `chrome-extension://${chrome.runtime.id}` : undefined
//       },
//       body: JSON.stringify({ query, userProfile }),
//     });
    
//     if (!response.ok) {
//       const errorText = await response.text();
//       throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
//     }
    
//     const data = await response.json();
//     console.log('Received response from backend:', data);
//     return data;
//   } catch (error) {
//     console.error('Error fetching personalized results:', error);
//     return [];
//   }
// }

// // Function to update user history
// function updateUserHistory(query, clickedUrl) {
//   chrome.storage.sync.get(['userHistory'], function(result) {
//     let history = result.userHistory || [];
//     history.push({ query, clickedUrl, timestamp: Date.now() });
//     // Keep only the last 100 items
//     if (history.length > 100) history = history.slice(-100);
//     chrome.storage.sync.set({ userHistory: history });
//   });
// }

// // Listener for web requests
// chrome.webRequest.onBeforeRequest.addListener(
//   async function(details) {
//     if (details.url.includes('google.com/search?')) {
//       const url = new URL(details.url);
//       const query = url.searchParams.get('q');
      
//       console.log('Intercepted Google search:', query);
      
//       const userProfile = await getUserProfile();
//       console.log('User profile:', userProfile);
      
//       const personalizedResults = await getPersonalizedResults(query, userProfile);
      
//       // Store personalized results to be used by content script
//       chrome.storage.local.set({personalizedResults: personalizedResults}, function() {
//         if (chrome.runtime.lastError) {
//           console.error('Error storing personalized results:', chrome.runtime.lastError);
//         } else {
//           console.log('Personalized results stored:', personalizedResults);
//         }
//       });
//     }
//     return {cancel: false};
//   },
//   {urls: ["https://www.google.com/search?*"]},
//   ["blocking"]
// );


// // Listener for URL changes (to capture clicks on search results)
// if (chrome.webNavigation && chrome.webNavigation.onCommitted) {
//   chrome.webNavigation.onCommitted.addListener(function(details) {
//     chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
//       if (tabs[0] && tabs[0].id === details.tabId) {
//         const url = new URL(details.url);
//         if (url.hostname === 'www.google.com' && url.pathname === '/search') {
//           const query = url.searchParams.get('q');
//           updateUserHistory(query, details.url);
//         }
//       }
//     });
//   });
// } else {
//   console.warn('webNavigation permission is not available. Some features may not work.');
// }



// // Function to get user profile from storage
// function getUserProfile() {
//   return new Promise((resolve) => {
//     chrome.storage.sync.get(['userProfile'], function(result) {
//       console.log('Retrieved user profile:', result.userProfile);
//       resolve(result.userProfile || {});
//     });
//   });
// }

// // Function to send request to our backend
// async function getPersonalizedResults(query, userProfile) {
//   try {
//     console.log('Sending request to backend:', { query, userProfile });
//     const response = await fetch('http://127.0.0.1:5000/personalize', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Origin': chrome.runtime.id ? `chrome-extension://${chrome.runtime.id}` : undefined
//       },
//       body: JSON.stringify({ query, userProfile }),
//     });
    
//     console.log('Response status:', response.status);
//     console.log('Response headers:', response.headers);
    
//     if (!response.ok) {
//       const errorText = await response.text();
//       throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
//     }
    
//     const data = await response.json();
//     console.log('Received response from backend:', data);
//     return data;
//   } catch (error) {
//     console.error('Error fetching personalized results:', error);
//     return [];
//   }
// }

// // Listener for web requests
// chrome.webRequest.onBeforeRequest.addListener(
//   async function(details) {
//     console.log('onBeforeRequest triggered:', details.url);
//     if (details.url.includes('google.com/search?')) {
//       const url = new URL(details.url);
//       const query = url.searchParams.get('q');
      
//       console.log('Intercepted Google search:', query);
      
//       const userProfile = await getUserProfile();
//       console.log('User profile:', userProfile);
      
//       const personalizedResults = await getPersonalizedResults(query, userProfile);
      
//       // Store personalized results to be used by content script
//       chrome.storage.local.set({personalizedResults: personalizedResults}, function() {
//         if (chrome.runtime.lastError) {
//           console.error('Error storing personalized results:', chrome.runtime.lastError);
//         } else {
//           console.log('Personalized results stored:', personalizedResults);
//         }
//       });
//     }
//     return {cancel: false};
//   },
//   {urls: ["https://www.google.com/search?*"]},
//   ["blocking"]
// );

// console.log('Background script loaded and running');


// background.js

let userInterests = [];

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ interests: [] }, () => {
    chrome.storage.sync.get("interests", (data) => {
      userInterests = data.interests || [];
    });
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "addInterest") {
    chrome.storage.sync.get("interests", (data) => {
      const updatedInterests = [...data.interests, request.interest];
      chrome.storage.sync.set({ interests: updatedInterests }, () => {
        userInterests = updatedInterests;
      });
    });
  }
});

chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    if (details.url.includes("google.com/search?q=")) {
      const url = new URL(details.url);
      const originalQuery = url.searchParams.get("q");
      
      // Check if the query already contains any of the interests
      const containsInterests = userInterests.some(interest => 
        originalQuery.toLowerCase().includes(interest.toLowerCase())
      );
      
      if (!containsInterests) {
        // Concatenate user interests with the original search query
        const enhancedQuery = `${originalQuery} ${userInterests.join(" ")}`.trim();
        
        // Create a new URL with the enhanced query
        const newUrl = new URL(details.url);
        newUrl.searchParams.set("q", enhancedQuery);
        
        return { redirectUrl: newUrl.toString() };
      }
    }
    return { cancel: false };
  },
  { urls: ["*://www.google.com/search?*"] },
  ["blocking"]
);