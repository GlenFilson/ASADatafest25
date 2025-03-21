var map = L.map('map').setView([39.8283, -98.5795], 5);

L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19
}).addTo(map);

async function readJsonFile(filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const jsonData = await response.json();
        return jsonData;
    } catch (error) {
        console.error('Error reading JSON file:', error);
        return null;
    }
}

async function processJson(filename) {
    const data = await readJsonFile(filename);
    if (data && Array.isArray(data)) {
        console.log("JSON Data Loaded:", data); // Debug: Check loaded data
        data.forEach(point => {
            if (point && typeof point.lat === 'number' && typeof point.long === 'number') {
                console.log('plotted point:', point.lat, point.long); // Debug: Check plotted points
                L.circleMarker([point.lat, point.long], {
                    color: 'red',
                    fillColor: '#f03',
                    fillOpacity: 0.5,
                    radius: 4
                }).addTo(map);
            } else {
                console.warn("Invalid point data:", point);
            }
        });
    } else {
        console.error("Invalid JSON data or not an array.");
    }
}

processJson('points.json');