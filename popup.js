// document.addEventListener('DOMContentLoaded', function() {
//     // Load saved profile
//     chrome.storage.sync.get(['userProfile'], function(result) {
//       if (result.userProfile) {
//         document.getElementById('interests').value = result.userProfile.interests.join(', ');
//         document.getElementById('profession').value = result.userProfile.profession;
//       }
//     });
  
//     // Save button click handler
//     document.getElementById('save').addEventListener('click', function() {
//       const interests = document.getElementById('interests').value.split(',').map(i => i.trim());
//       const profession = document.getElementById('profession').value;
      
//       const userProfile = { interests, profession };
      
//       chrome.storage.sync.set({userProfile: userProfile}, function() {
//         console.log('User profile saved');
//         // You could add some visual feedback here
//         const feedback = document.createElement('p');
//         feedback.textContent = 'Profile saved successfully!';
//         feedback.style.color = 'green';
//         document.body.appendChild(feedback);
//         setTimeout(() => feedback.remove(), 3000);
//       });
//     });
//   });




// popup.js

document.getElementById("addInterest").addEventListener("click", () => {
  const interest = document.getElementById("interest").value;
  if (interest) {
    chrome.runtime.sendMessage({ action: "addInterest", interest: interest });
    document.getElementById("interest").value = "";
    updateInterestsList();
  }
});

function updateInterestsList() {
  chrome.storage.sync.get("interests", (data) => {
    const interestsList = document.getElementById("interestsList");
    interestsList.innerHTML = "";
    data.interests.forEach((interest) => {
      const li = document.createElement("li");
      li.textContent = interest;
      interestsList.appendChild(li);
    });
  });
}

updateInterestsList();