
var map = L.map('map').setView([coordinates[1],coordinates[0]], 9);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

console.log(coordinates);


L.marker([coordinates[1],coordinates[0]]).addTo(map);
L.popup([coordinates[1],coordinates[0]], {content: `<h4>${title}</h4><p>Exact location will be provided after booking</p>`})
    .addTo(map);