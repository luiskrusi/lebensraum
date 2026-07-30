// Karte erstellen
const map = L.map('map').setView([47.2682, 11.3923], 12); // Innsbruck

// Hintergrundkarte
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap-Mitwirkende'
}).addTo(map);

// Marker hinzufügen
const marker = L.marker([47.2682, 11.3923]).addTo(map);

marker.bindPopup("<b>Innsbruck</b><br>Mein erster Marker.");

// Kreis
L.circle([47.275, 11.42], {
    radius: 400,
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.4
}).addTo(map);

// Polygon
const polygon = L.polygon([
    [47.27, 11.36],
    [47.29, 11.39],
    [47.26, 11.43]
], {
    color: 'blue',
    fillOpacity: 0.3
}).addTo(map);

polygon.bindPopup("Beispielpolygon");

// Punkte aus GeoJSON laden
fetch("data/punkte.geojson")
.then(response => response.json())
.then(data => {

    L.geoJSON(data, {

        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng, {
                radius: 6,
                fillColor: "orange",
                color: "#333",
                weight: 1,
                fillOpacity: 0.9
            });
        },

        onEachFeature: function(feature, layer) {
            if(feature.properties){
                layer.bindPopup(
                    "<b>" + feature.properties.name + "</b>"
                );
            }
        }

    }).addTo(map);

});

// Polygonlayer laden
fetch("data/polygon.geojson")
.then(response => response.json())
.then(data => {

    L.geoJSON(data, {

        style: {
            color: "green",
            weight: 2,
            fillOpacity: 0.4
        },

        onEachFeature: function(feature, layer){
            if(feature.properties){
                layer.bindPopup(feature.properties.name);
            }
        }

    }).addTo(map);

});