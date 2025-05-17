const map = L.map('map');
let mapCentered = false;
let userCoords = null;
let userHeading = 0;
let userMarker = null;
let viewCircle = null;
let answerCircle = null;
let visited = 0;
let correct = 0;
let incorrect = 0;

const markerGroup = L.layerGroup().addTo(map);

// 🎨 Colores seleccionados por el usuario
const viewColor = localStorage.getItem('colorView') || '#0077cc';
const answerColor = localStorage.getItem('colorAnswer') || '#28a745';

// 🗺️ Capas base
const baseMaps = {
    "Callejero": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }),
    "Satélite": L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri'
    }),
    "Relieve": L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; OpenTopoMap'
    })
};

// Agregar base predeterminada
baseMaps["Callejero"].addTo(map);
L.control.layers(baseMaps, null, { position: 'topright' }).addTo(map);

function updateStats() {
    document.getElementById('visited-count').textContent = visited;
    document.getElementById('correct-count').textContent = correct;
    document.getElementById('incorrect-count').textContent = incorrect;
}

function getQueryParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

document.getElementById('locate-btn').addEventListener('click', () => {
    if (userCoords) {
        map.setView(userCoords, 17);
    } else {
        alert("Ubicación no disponible.");
    }
});

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

            if (viewCircle) {
                viewCircle.setLatLng(userCoords);
            } else {
                viewCircle = L.circle(userCoords, {
                    radius: 100,
                    color: viewColor,
                    fillColor: viewColor,
                    fillOpacity: 0.1,
                    weight: 1
                }).addTo(map);
            }

            if (answerCircle) {
                answerCircle.setLatLng(userCoords);
            } else {
                answerCircle = L.circle(userCoords, {
                    radius: 20,
                    color: answerColor,
                    fillColor: answerColor,
                    fillOpacity: 0.25,
                    weight: 1
                }).addTo(map);
            }

            if (!mapCentered) {
                map.setView(userCoords, 17);
                mapCentered = true;
            }
        },
        () => {
            if (!mapCentered) {
                map.setView([41.9028, 12.4964], 13); // Roma fallback
                mapCentered = true;
            }
        },
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
    );
}

const selectedFile = getQueryParam('lista');
if (selectedFile) {
    const url = `https://raw.githubusercontent.com/BYjosep/data/main/${selectedFile}`;

    fetch(url)
        .then(res => res.json())
        .then(points => {
            renderPoints(points);
        })
        .catch(err => {
            alert("Error al cargar la lista.");
            console.error(err);
        });
}

function renderPoints(data) {
    markerGroup.clearLayers();

    data.forEach(point => {
        const marker = L.marker(point.coords).addTo(markerGroup);

        const form = document.createElement('form');
        form.innerHTML = `<strong>${point.title}</strong><br><p>${point.question}</p>`;

        point.answers.forEach((ans, index) => {
            const id = `ans-${index}-${Math.random().toString(36).slice(2)}`;
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

        marker.on('click', (e) => {
            if (!userCoords) return;
            const distance = map.distance(userCoords, point.coords);
            if (distance > 100) {
                alert(`Demasiado lejos para acceder (distancia: ${Math.round(distance)} m)`);
                e.originalEvent.stopPropagation();
                map.closePopup();
            } else {
                visited++;
                updateStats();
            }
        });

        form.addEventListener('change', () => {
            if (!userCoords) return;

            const distance = map.distance(userCoords, point.coords);
            if (distance > 20) {
                result.textContent = `❌ Estás demasiado lejos para responder (≤ 20 m)`;
                result.style.color = 'orange';
                form.querySelectorAll('input[name="answer"]').forEach(i => i.checked = false);
                return;
            }

            const selected = form.querySelector('input[name="answer"]:checked');
            if (selected) {
                const isCorrect = selected.value === "true";
                if (isCorrect) {
                    correct++;
                    result.textContent = "✅ ¡Correcto!";
                    result.style.color = "green";
                } else {
                    incorrect++;
                    result.textContent = "❌ Incorrecto.";
                    result.style.color = "red";
                }

                updateStats();
                form.querySelectorAll('input[name="answer"]').forEach(i => i.disabled = true);
            }
        });
    });
}
