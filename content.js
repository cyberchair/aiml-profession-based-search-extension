// // Function to replace Google's search results with personalized results
// function replaceSearchResults(personalizedResults) {
//     const searchResults = document.getElementById('search');
//     if (!searchResults) return;
  
//     // Clear existing results
//     searchResults.innerHTML = '';
  
//     // Add personalized results
//     personalizedResults.forEach(result => {
//       const resultElement = document.createElement('div');
//       resultElement.className = 'g';
//       resultElement.innerHTML = `
//         <div class="rc" style="border: 1px solid #dfe1e5; border-radius: 8px; padding: 12px; margin-bottom: 10px;">
//           <div class="r">
//             <a href="${result.link}" style="color: #1a0dab; font-size: 18px; text-decoration: none;">
//               <h3>${result.title}</h3>
//             </a>
//           </div>
//           <div class="s">
//             <div style="color: #006621; font-size: 14px;">${result.link}</div>
//             <div style="color: #545454; font-size: 14px;">${result.snippet}</div>
//           </div>
//           <div style="color: #006621; font-size: 12px; margin-top: 5px;">
//             Relevance Score: ${(result.relevance * 100).toFixed(2)}%
//           </div>
//         </div>
//       `;
//       searchResults.appendChild(resultElement);
//     });
//   }
  
//   // Retrieve personalized results from storage and replace search results
//   chrome.storage.local.get(['personalizedResults'], function(result) {
//     if (result.personalizedResults) {
//       replaceSearchResults(result.personalizedResults);
//     }
//   });

console.log('Content script loaded');

// Function to replace Google's search results with personalized results
function replaceSearchResults(personalizedResults) {
  console.log('Attempting to replace search results');
  const searchResults = document.getElementById('search');
  if (!searchResults) {
    console.error('Could not find #search element');
    return;
  }

  console.log('Clearing existing results');
  // Clear existing results
  searchResults.innerHTML = '';

  console.log('Adding personalized results');
  // Add personalized results
  personalizedResults.forEach(result => {
    const resultElement = document.createElement('div');
    resultElement.className = 'g';
    resultElement.innerHTML = `
      <div class="rc" style="border: 1px solid #dfe1e5; border-radius: 8px; padding: 12px; margin-bottom: 10px;">
        <div class="r">
          <a href="${result.link}" style="color: #1a0dab; font-size: 18px; text-decoration: none;">
            <h3>${result.title}</h3>
          </a>
        </div>
        <div class="s">
          <div style="color: #006621; font-size: 14px;">${result.link}</div>
          <div style="color: #545454; font-size: 14px;">${result.snippet}</div>
        </div>
        <div style="color: #006621; font-size: 12px; margin-top: 5px;">
          Relevance Score: ${(result.relevance * 100).toFixed(2)}%
        </div>
      </div>
    `;
    searchResults.appendChild(resultElement);
  });
  console.log('Finished adding personalized results');
}

// Retrieve personalized results from storage and replace search results
console.log('Retrieving personalized results from storage');
chrome.storage.local.get(['personalizedResults'], function(result) {
  if (chrome.runtime.lastError) {
    console.error('Error retrieving personalized results:', chrome.runtime.lastError);
  } else if (result.personalizedResults) {
    console.log('Retrieved personalized results:', result.personalizedResults);
    replaceSearchResults(result.personalizedResults);
  } else {
    console.log('No personalized results found in storage');
  }
});

console.log('Content script finished executing');