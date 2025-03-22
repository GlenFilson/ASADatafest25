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

const quarter_buttons = document.getElementById('quarters');
const play = document.getElementById('play')
const pause = document.getElementById('pause')
let interval
let quarter_active_index = 0;
let markers = []; // Array to store markers for clearing

async function mapController(filename) {
    const data = await readJsonFile(filename);
    if (!data) return;

    const quarters = Object.keys(data);
    quarter_buttons.innerHTML = '';

    const set_active = (i) => {
        Array.from(quarter_buttons.children).forEach((child, child_i) => {
            if (child_i === i) {
                child.classList.add('active');
            } else {
                child.classList.remove('active');
            }
        });
    };

    const update_map = (i) => {
        quarter_active_index = i
        set_active(i);

        // Clear existing markers from the map
        markers.forEach(marker => map.removeLayer(marker));
        markers = [];

        // Plot new points on the map
        data[quarters[i]].forEach(point => {
            console.log(point);

            if (point.lat && point.long) {  // Ensure lat/lon exist
                const marker = L.circleMarker([point.lat, point.long], {
                    radius: 3 + point.leases.length * .2,
                    color: 'red',
                    fillColor: 'red',
                    fillOpacity: 0.8
                }).addTo(map);

                markers.push(marker);
            } else {
                console.warn("Missing lat/lon for point:", point);
            }
        });
    };

    play.onclick = () => {
        if (interval) clearInterval(interval)

        pause.classList.remove('active')
        play.classList.add('active')

        quarter_active_index = 0

        interval = setInterval(() => {
            update_map(quarter_active_index)
            quarter_active_index += 1
            if (quarter_active_index >= 27) clearInterval(interval)
        }, 1000)

        pause.onclick = () => clearInterval(interval)
    }

    quarters.forEach((quarter, index) => {
        const button = document.createElement('div');
        button.classList.add('button');

        if (index === quarter_active_index) {
            button.classList.add('active');
        }

        button.innerText = quarter.slice(2);
        button.onclick = () => update_map(index);

        quarter_buttons.append(button);
    });

    console.log(Object.keys(data));

    // Initialize with the first quarter
    update_map(quarter_active_index);
}

mapController('map_points.json');
