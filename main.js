// ===============================
// Karte initialisieren
// ===============================

const map = L.map('map').setView([47.4, 11.7], 10);


// ===============================
// Basemap OSM
// ===============================

const osm = L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
        attribution: '&copy; OpenStreetMap contributors'
    }
).addTo(map);


// ===============================
// Layer Gruppen
// ===============================

const totholz = L.layerGroup();


// ===============================
// GeoJSON Loader
// ===============================

function loadGeoJSON(url, group, style = {}) {

    fetch(url)
        .then(response => {

            if (!response.ok) {
                throw new Error(
                    "GeoJSON konnte nicht geladen werden: " + url
                );
            }

            return response.json();

        })
        .then(data => {

            const layer = L.geoJSON(data, {

                style: style,

                pointToLayer: function(feature, latlng) {

                    return L.circleMarker(latlng, {

                        radius: 6,
                        fillOpacity: 0.8,
                        color: style.color || "brown",
                        fillColor: style.fillColor || "brown"

                    });

                },


                onEachFeature: function(feature, layer) {

                    if (feature.properties) {

                        layer.bindPopup(

                            Object.entries(feature.properties)

                            .filter(([k,v]) =>
                                v !== null &&
                                v !== ""
                            )

                            .map(([k,v]) =>
                                `<b>${k}</b>: ${v}`
                            )

                            .join("<br>")

                        );

                    }

                }

            });


            layer.addTo(group);


        })

        .catch(error => {

            console.error(error);

        });

}



// ===============================
// Totholz laden
// ===============================

loadGeoJSON(
    "data/2025_Totholz_abgeloest.geojson",
    totholz,
    {
        color: "brown",
        weight: 2,
        fillColor: "orange",
        fillOpacity: 0.5
    }
);



// ===============================
// Layer Control
// ===============================

const overlayMaps = {

    "🌲 2025 Totholz abgelöst": totholz

};


L.control.layers(

    {
        "OpenStreetMap": osm
    },

    overlayMaps,

    {
        collapsed:false
    }

).addTo(map);



// ===============================
// Maßstab
// ===============================

L.control.scale({

    metric:true,
    imperial:false

}).addTo(map);



// ===============================
// Layer automatisch anzeigen
// ===============================

totholz.addTo(map);