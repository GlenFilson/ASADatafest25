var map = L.map('map').setView([39.8283, -98.5795], 5);

L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19
}).addTo(map);

var openrailwaymap = new L.TileLayer('http://{s}.tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png',
    {
        attribution: '<a href="https://www.openstreetmap.org/copyright">© OpenStreetMap contributors</a>, Style: <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA 2.0</a> <a href="http://www.openrailwaymap.org/">OpenRailwayMap</a> and OpenStreetMap',
        minZoom: 2,
        maxZoom: 19,
        tileSize: 256,
        opacity: 0.25 // Set opacity to 0.5 (adjust as needed)
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

function generateNoise(value, magnitude = 0.0005) {
    const noised_value = value + (Math.random() * magnitude * 2 - magnitude);
    return noised_value;
}

function groupData(data) {
    const grouped = {};

    data.forEach(entry => {
        const key = entry.company_name || "Unknown"; // Use "Unknown" for null values

        if (!grouped[key]) {
            grouped[key] = {
                'lat': entry.lat,
                'long': entry.long,
                'leases': []
            };
        }

        grouped[key]['leases'].push(entry);
    });

    return grouped;
}



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
        set_active(i);

        // Clear existing markers from the map
        markers.forEach(marker => map.removeLayer(marker));
        markers = [];

        // Plot new points on the map
        data[quarters[i]].forEach(point => {
            const grouped = groupData(point.leases)
            const companies = Object.keys(grouped)

            companies.forEach(company => {
                // switch to view
                const datapoint = grouped[company]
                let important_count = 0

                console.log(datapoint)

                datapoint.leases.forEach(lease => {
                    if (lease.industry == 'Construction, Engineering and Architecture') important_count += 1
                })

                let not_important = datapoint.leases.length - important_count

                const marker = L.circleMarker([datapoint.lat, datapoint.long], {
                    radius: 6 + datapoint.leases.length * .2,
                    color: important_count > not_important ? 'red' : 'gray',
                    colorOpacity: 0.1,
                    fillColor: important_count > not_important ? 'red' : 'gray',
                    fillOpacity: important_count > not_important ? 1 : .25,
                    weight: 0 

                }).addTo(map);
                markers.push(marker);
            })
        });
    };

    play.onclick = () => {
        if (interval) clearInterval(interval)

        pause.classList.remove('active')
        play.classList.add('active')

        interval = setInterval(() => {
            update_map(quarter_active_index)
            quarter_active_index += 1
            if (quarter_active_index >= 27) quarter_active_index = 0
        }, 300)

        pause.onclick = () => clearInterval(interval)
    }

    quarters.forEach((quarter, index) => {
        const button = document.createElement('div');
        button.classList.add('button');

        if (index === quarter_active_index) {
            button.classList.add('active');
        }

        button.innerText = quarter.slice(2);
        button.onclick = () => {
            quarter_active_index = index
            update_map(quarter_active_index)
        };

        quarter_buttons.append(button);

        // add noise to all data points to begin with
        console.log('noisy')
        data[quarter].forEach(datapoint => {
            datapoint.leases.forEach(lease => {
                lease.lat = generateNoise(lease.lat)
                lease.long = generateNoise(lease.long)
            })
        })
    });
    // Initialize with the first quarter
    update_map(quarter_active_index);
}

mapController('old_map_points.json');
