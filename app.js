const repoOwner = 'BYjosep';
const repoName = 'data';
const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/`;

const map = L.map('map').setView([40.4168, -3.7038], 6); // Centrado en España

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

const markerGroup = L.layerGroup().addTo(map);

let userMarker = null;
let userCoords = null;

if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
        position => {
            const { latitude, longitude } = position.coords;
            userCoords = [latitude, longitude];

            if (userMarker) {
                userMarker.setLatLng(userCoords);
            } else {
                userMarker = L.marker(userCoords, {
                    icon: L.divIcon({
                        html: '📌',
                        className: '',
                        iconSize: [20, 20]
                    })
                }).addTo(map);
            }
        },
        error => {
            console.error('Error obteniendo ubicación:', error);
        },
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
    );
}

// Obtener los archivos JSON del repositorio
fetch(apiUrl)
    .then(response => response.json())
    .then(files => {
        const jsonFiles = files.filter(file => file.name.endsWith('.json'));
        const selector = document.getElementById('jsonSelector');

        jsonFiles.forEach(file => {
            const option = document.createElement('option');
            option.value = file.name;
            option.textContent = file.name.replace(/\.json$/, '');
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
        console.error('Error al obtener los archivos del repositorio:', error);
    });

function loadJsonFile(filename) {
    const rawUrl = `https://raw.githubusercontent.com/${repoOwner}/${repoName}/main/${filename}`;

    fetch(rawUrl)
        .then(response => response.json())
        .then(data => {
            markerGroup.clearLayers();

            data.forEach(point => {
                const marker = L.marker(point.coords).addTo(markerGroup);

                const distanceAllowed = 10; // metros

                function canAnswerHere() {
                    if (!userCoords) return false;
                    const distance = map.distance(userCoords, point.coords);
                    return distance <= distanceAllowed;
                }

                const form = document.createElement('form');
                form.innerHTML = `<strong>${point.title}</strong><br><p>${point.question}</p>`;

                point.answers.forEach((ans, index) => {
                    const id = `ans-${index}-${Math.random().toString(36).substring(2, 6)}`;
                    form.innerHTML += `
            <label for="${id}">
              <input type="radio" name="answer" value="${ans.correct}" id="${id}" />
              ${ans.text}
            </label><br/>
          `;
                });

                const result = document.createElement('div');
                result.style.marginTop = '8px';

                form.addEventListener('change', () => {
                    if (!canAnswerHere()) {
                        result.textContent = `❌ Estás demasiado lejos. Acércate al punto (≤ ${distanceAllowed} m).`;
                        result.style.color = 'orange';
                        form.querySelectorAll('input[name="answer"]').forEach(i => i.checked = false);
                        return;
                    }

                    const selected = form.querySelector('input[name="answer"]:checked');
                    if (selected) {
                        const isCorrect = selected.value === "true";
                        result.textContent = isCorrect ? "✅ ¡Correcto!" : "❌ Incorrecto.";
                        result.style.color = isCorrect ? "green" : "red";
                        form.querySelectorAll('input[name="answer"]').forEach(input => input.disabled = true);
                    }
                });

                form.appendChild(result);
                marker.bindPopup(form);
            });
        })
        .catch(error => {
            console.error('Error al cargar el archivo JSON:', error);
        });
}
