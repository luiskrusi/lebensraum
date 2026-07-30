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

const naturdenkmaelerFlaeche = L.layerGroup();

const naturdenkmaelerPunkt = L.layerGroup();


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


function loadWFS(url, typeName, group, style = {}) {

    const wfsUrl =
        url +
        "?service=WFS" +
        "&version=2.0.0" +
        "&request=GetFeature" +
        "&typeNames=" + encodeURIComponent(typeName) +
        "&outputFormat=GEOJSON";


    console.log("WFS Anfrage:", wfsUrl);


    fetch(wfsUrl)
        .then(response => {

            if (!response.ok) {
                throw new Error(
                    "WFS Fehler: " + response.status
                );
            }

            return response.json();

        })
        .then(data => {


            console.log("WFS Daten:", data);


            const layer = L.geoJSON(data, {

                style: style,


                pointToLayer: function(feature, latlng) {

                    return L.circleMarker(latlng, {

                        radius: 7,
                        color: style.color,
                        fillColor: style.fillColor,
                        fillOpacity: 0.8

                    });

                },


                onEachFeature:function(feature, layer){

                    if(feature.properties){

                        layer.bindPopup(

                            Object.entries(feature.properties)

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

            console.error(
                "WFS konnte nicht geladen werden:",
                error
            );

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
// Naturdenkmäler WFS laden
// ===============================


// Fläche
loadWFS(
    "https://dservices3.arcgis.com/hG7UfxX49PQ8XkXh/arcgis/services/Naturdenkmaeler_Punkt/WFSServer",
    "Naturdenkmaeler_Punkt:Naturdenkmaeler_Punkt",
    naturdenkmaelerPunkt,
    {
        color: "darkgreen",
        fillColor: "yellow"
    }
);


loadWFS(
    "https://dservices3.arcgis.com/hG7UfxX49PQ8XkXh/arcgis/services/Naturdenkmaeler_Flaeche/WFSServer",
    "Naturdenkmaeler_Flaeche:Naturdenkmaeler_Flaeche",
    naturdenkmaelerFlaeche,
    {
        color: "green",
        fillColor: "lightgreen",
        weight: 2,
        fillOpacity: 0.4
    }
);


// ===============================
// Layer Control
// ===============================

const overlayMaps = {

    "🌲 2025 Totholz abgelöst": totholz,

    "🌳 Naturdenkmäler Fläche": naturdenkmaelerFlaeche,

    "📍 Naturdenkmäler Punkt": naturdenkmaelerPunkt

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

naturdenkmaelerFlaeche.addTo(map);

naturdenkmaelerPunkt.addTo(map);