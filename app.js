const repoOwner = 'BYjosep';
const repoName = 'data';
const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/`;

const map = L.map('map');
let mapCentered = false;

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

const markerGroup = L.layerGroup().addTo(map);

let userMarker = null;
let userCoords = null;
let userHeading = 0;
let pendingPoints = null;

if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
        position => {
            const { latitude, longitude, heading } = position.coords;
            userCoords = [latitude, longitude];
            if (!isNaN(heading)) userHeading = heading;

            const iconHtml = `
        <div style="
          font-size: 24px;
          transform: rotate(${userHeading}deg);
          transform-origin: center;
          display: flex;
          justify-content: center;
          align-items: center;
          width: 30px;
          height: 30px;
        ">➤</div>`;

            const icon = L.divIcon({
                html: iconHtml,
                className: '',
                iconSize: [30, 30]
            });

            if (userMarker) {
                userMarker.setLatLng(userCoords);
                userMarker.setIcon(icon);
            } else {
                userMarker = L.marker(userCoords, { icon }).addTo(map);
            }

            if (!mapCentered) {
                map.setView(userCoords, 17);
                mapCentered = true;
            }

            if (pendingPoints) {
                renderVisiblePoints(pendingPoints);
                pendingPoints = null;
            }
        },
        error => {
            console.warn('No se pudo obtener la ubicación, centrando en Roma.');
            if (!mapCentered) {
                map.setView([41.9028, 12.4964], 13); // Roma
                mapCentered = true;
            }
        },
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
    );
}

// Cargar listas desde GitHub
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

            if (!userCoords) {
                pendingPoints = data;
                alert("Esperando ubicación para validar distancia...");
            } else {
                renderVisiblePoints(data);
            }
        })
        .catch(error => {
            console.error('Error al cargar el archivo JSON:', error);
        });
}

function renderVisiblePoints(data) {
    markerGroup.clearLayers();

    data.forEach(point => {
        const marker = L.marker(point.coords).addTo(markerGroup);

        // Círculo de 100 m como guía visual
        L.circle(point.coords, {
            radius: 100,
            color: '#0077ff',
            fillColor: '#0077ff',
            fillOpacity: 0.2,
            weight: 1,
            interactive: false
        }).addTo(markerGroup);

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
        form.appendChild(result);

        marker.bindPopup(form);

        // Bloquear apertura del popup si estás a más de 100 m
        marker.on('click', (e) => {
            if (!userCoords) return;

            const distance = map.distance(userCoords, point.coords);
            if (distance > 100) {
                alert(`Estás demasiado lejos para acceder a este punto (distancia: ${Math.round(distance)} m).`);
                e.originalEvent.stopPropagation();
                map.closePopup();
            }
        });

        // Bloquear respuestas si estás a más de 10 m
        form.addEventListener('change', () => {
            if (!userCoords) return;

            const distance = map.distance(userCoords, point.coords);
            if (distance > 10) {
                result.textContent = `❌ Estás demasiado lejos para responder (≤ 10 m).`;
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
    });
}

// 🧭 Botón para centrar en tu ubicación
document.getElementById('locate-btn').addEventListener('click', () => {
    if (userCoords) {
        map.setView(userCoords, 17);
    } else {
        alert('Ubicación no disponible.');
    }
});
