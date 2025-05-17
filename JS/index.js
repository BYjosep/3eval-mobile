const selector = document.getElementById('listSelector');
const startBtn = document.getElementById('startBtn');

fetch('https://api.github.com/repos/BYjosep/data/contents/')
    .then(res => res.json())
    .then(files => {
        const jsonFiles = files.filter(file => file.name.endsWith('.json'));
        selector.innerHTML = '<option disabled selected>Selecciona una lista</option>';

        jsonFiles.forEach(file => {
            const opt = document.createElement('option');
            opt.value = file.name;
            opt.textContent = file.name.replace(/\.json$/, '');
            selector.appendChild(opt);
        });

        selector.disabled = false;
        startBtn.disabled = false;
    });

startBtn.addEventListener('click', () => {
    const selected = selector.value;
    if (selected) {
        window.location.href = `mapa.html?lista=${encodeURIComponent(selected)}`;
    }
});
