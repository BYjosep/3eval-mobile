const repoOwner = 'BYjosep';
const repoName = 'data';
const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/`;

const map = L.map('map').setView([40.4168, -3.7038], 6); // Centered on Spain

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

const markerGroup = L.layerGroup().addTo(map);

// Fetch list of JSON files from the repository
fetch(apiUrl)
  .then(response => response.json())
  .then(files => {
    const jsonFiles = files.filter(file => file.name.endsWith('.json'));
    const selector = document.getElementById('jsonSelector');

    jsonFiles.forEach(file => {
      const option = document.createElement('option');
      option.value = file.name;
      option.textContent = file.name;
      selector.appendChild(option);
    });

    selector.addEventListener('change', () => {
      const selectedFile = selector.value;
      if (selectedFile) {
        loadJsonFile(selectedFile);
      }
    });
  })
  .catch(error => {
    console.error('Error fetching file list:', error);
  });

function loadJsonFile(filename) {
  const rawUrl = `https://raw.githubusercontent.com/${repoOwner}/${repoName}/main/${filename}`;
  
  fetch(rawUrl)
    .then(response => response.json())
    .then(data => {
      markerGroup.clearLayers();
      data.forEach(point => {
        const marker = L.marker(point.coords).addTo(markerGroup);
        let popupContent = `<strong>${point.title}</strong><br>${point.question}<ul>`;
        point.answers.forEach(ans => {
          popupContent += `<li>${ans.text}${ans.correct ? ' ✅' : ''}</li>`;
        });
        popupContent += '</ul>';
        marker.bindPopup(popupContent);
      });
    })
    .catch(error => {
      console.error('Error loading JSON file:', error);
    });
}
