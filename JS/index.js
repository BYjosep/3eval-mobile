const listSelector = document.getElementById('listSelector');
const viewColorSelect = document.getElementById('colorView');
const answerColorSelect = document.getElementById('colorAnswer');
const startBtn = document.getElementById('startBtn');

const colorOptions = [
    '#0077cc', '#28a745', '#dc3545', '#ffc107', '#6f42c1',
    '#17a2b8', '#fd7e14', '#20c997', '#6610f2', '#e83e8c',
    '#343a40', '#adb5bd', '#f8f9fa', '#198754', '#0dcaf0',
    '#212529', '#e0a800', '#6c757d', '#495057', '#ff69b4'
];

const colorNames = {
    '#0077cc': 'Azul cielo',
    '#28a745': 'Verde',
    '#dc3545': 'Rojo',
    '#ffc107': 'Amarillo',
    '#6f42c1': 'Púrpura',
    '#17a2b8': 'Cian',
    '#fd7e14': 'Naranja fuerte',
    '#20c997': 'Verde mar',
    '#6610f2': 'Azul violeta',
    '#e83e8c': 'Rosa fuerte',
    '#343a40': 'Negro grisáceo',
    '#adb5bd': 'Gris claro',
    '#f8f9fa': 'Blanco',
    '#198754': 'Verde bosque',
    '#0dcaf0': 'Celeste',
    '#212529': 'Gris oscuro',
    '#e0a800': 'Amarillo oro',
    '#6c757d': 'Gris acero',
    '#495057': 'Gris pizarra',
    '#ff69b4': 'Rosa'
};

// Inicializar ambos selects con todos los colores
function initColorSelects() {
    colorOptions.forEach(color => {
        const name = colorNames[color] || color;
        const viewOpt = document.createElement('option');
        const answerOpt = document.createElement('option');

        viewOpt.value = color;
        viewOpt.textContent = name;
        viewOpt.style.backgroundColor = color;
        viewOpt.style.color = ['#f8f9fa', '#ffc107', '#e0a800', '#adb5bd'].includes(color) ? '#000' : '#fff';

        answerOpt.value = color;
        answerOpt.textContent = name;
        answerOpt.style.backgroundColor = color;
        answerOpt.style.color = viewOpt.style.color;

        viewColorSelect.appendChild(viewOpt);
        answerColorSelect.appendChild(answerOpt);
    });
}

// Sincronizar los selects para evitar duplicados
function updateDisabledOptions() {
    const viewSelected = viewColorSelect.value;
    const answerSelected = answerColorSelect.value;

    [...viewColorSelect.options].forEach(opt => {
        opt.disabled = (opt.value === answerSelected);
    });

    [...answerColorSelect.options].forEach(opt => {
        opt.disabled = (opt.value === viewSelected);
    });
}

// Cargar listas desde GitHub
fetch('https://api.github.com/repos/BYjosep/data/contents/')
    .then(response => response.json())
    .then(files => {
        const jsonFiles = files.filter(file => file.name.endsWith('.json'));
        listSelector.innerHTML = '<option disabled selected>Selecciona una lista</option>';

        jsonFiles.forEach(file => {
            const opt = document.createElement('option');
            opt.value = file.name;
            opt.textContent = file.name.replace(/\.json$/, '');
            listSelector.appendChild(opt);
        });

        initColorSelects();
        updateDisabledOptions();
        startBtn.disabled = false;
    })
    .catch(err => {
        console.error("Error al cargar las listas:", err);
        alert("No se pudieron cargar las listas.");
    });

// Eventos de cambio
viewColorSelect.addEventListener('change', updateDisabledOptions);
answerColorSelect.addEventListener('change', updateDisabledOptions);

// Redirigir al mapa
startBtn.addEventListener('click', () => {
    const lista = listSelector.value;
    const viewColor = viewColorSelect.value;
    const answerColor = answerColorSelect.value;

    if (!lista || !viewColor || !answerColor) {
        alert("Selecciona una lista y dos colores distintos.");
        return;
    }

    if (viewColor === answerColor) {
        alert("Los colores deben ser diferentes.");
        return;
    }

    localStorage.setItem('colorView', viewColor);
    localStorage.setItem('colorAnswer', answerColor);

    window.location.href = `mapa.html?lista=${encodeURIComponent(lista)}`;
});
