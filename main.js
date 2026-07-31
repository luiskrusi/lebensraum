//
// ===============================
// Karte initialisieren
// ===============================
//

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
// Totholz Einzelmarker Icon
// ===============================

const totholzIcon = L.icon({

    iconUrl: "icons/totholz.svg",

    iconSize: [35, 35],

    iconAnchor: [17, 35],

    popupAnchor: [0, -35]

});

// ===============================
// Locate Me Plugin
// ===============================

L.control.locate({

    position: "topleft",

    strings: {
        title: "Meine Position anzeigen"
    },

    locateOptions: {

        enableHighAccuracy: true

    },

    drawCircle: true,

    drawMarker: true,

    showPopup: true,

    keepCurrentZoomLevel: false


}).addTo(map);




// ===============================
// MiniMap Plugin
// ===============================

const miniOSM = L.tileLayer(

    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',

    {

        attribution: '&copy; OpenStreetMap'

    }

);


new L.Control.MiniMap(

    miniOSM,

    {

        position: "bottomright",

        width: 200,

        height: 150,

        zoomLevelOffset: -5,

        toggleDisplay: true,

        minimized: false

    }

).addTo(map);




// ===============================
// Measure Plugin
// ===============================

new L.Control.Measure({

    position: "topleft",

    primaryLengthUnit: "kilometers",

    secondaryLengthUnit: "meters",

    primaryAreaUnit: "hectares",

    secondaryAreaUnit: "sqmeters"

}).addTo(map);





// ===============================
// Layer Gruppen
// ===============================

const totholz = L.markerClusterGroup({

    showCoverageOnHover: false,

    spiderfyOnMaxZoom: true,

    zoomToBoundsOnClick: true,

    disableClusteringAtZoom: 15,


    iconCreateFunction: function (cluster) {

        return L.divIcon({

            html:
                '<div class="cluster-totholz">' +
                cluster.getChildCount() +
                '</div>',


            className: 'custom-cluster',

            iconSize: L.point(40, 40)

        });

    }

});

const naturdenkmaelerPunkt = L.markerClusterGroup({

    showCoverageOnHover: false,

    spiderfyOnMaxZoom: true,

    zoomToBoundsOnClick: true,

    disableClusteringAtZoom: 15,


    iconCreateFunction: function (cluster) {

        return L.divIcon({

            html:
                '<div class="cluster-naturdenkmal">' +
                cluster.getChildCount() +
                '</div>',


            className: 'custom-cluster',

            iconSize: L.point(40, 40)

        });

    }

});

const naturdenkmaelerFlaeche = L.layerGroup();

const naturparkGrenze = L.layerGroup();




// ===============================
// GeoJSON Loader
// ===============================

function loadGeoJSON(url, group, style = {}, markerIcon = null) {


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


                style: function (feature) {

                    if (
                        feature.geometry.type === "Point" ||
                        feature.geometry.type === "MultiPoint"
                    ) {
                        return {};
                    }

                    return style;

                },


                pointToLayer: function (feature, latlng) {


                    if (markerIcon) {

                        return L.marker(
                            latlng,
                            {
                                icon: markerIcon
                            }
                        );

                    }


                    return L.circleMarker(
                        latlng,
                        {
                            radius: 6,
                            color: style.color || "brown",
                            fillColor: style.fillColor || "brown",
                            fillOpacity: 0.8
                        }
                    );


                },


                onEachFeature: function (feature, layer) {


                    if (feature.properties) {


                        layer.bindPopup(


                            Object.entries(feature.properties)


                                .filter(([k, v]) =>

                                    v !== null &&
                                    v !== ""

                                )


                                .map(([k, v]) =>

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
// WFS Loader
// ===============================

function loadWFS(url, typeName, group, style = {}) {


    const wfsUrl =

        url +

        "?service=WFS" +

        "&version=2.0.0" +

        "&request=GetFeature" +

        "&typeNames=" +
        encodeURIComponent(typeName) +

        "&outputFormat=GEOJSON";



    console.log(
        "WFS Anfrage:",
        wfsUrl
    );



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


            const layer = L.geoJSON(data, {


                style: function (feature) {

                    if (
                        feature.geometry.type === "Point" ||
                        feature.geometry.type === "MultiPoint"
                    ) {
                        return {};
                    }

                    return style;

                },


                pointToLayer: function (feature, latlng) {


                    return L.circleMarker(

                        latlng,

                        {

                            radius: 7,

                            color: style.color,

                            fillColor: style.fillColor,

                            fillOpacity: 0.8

                        }

                    );


                },


                onEachFeature: function (feature, layer) {


                    if (feature.properties) {


                        layer.bindPopup(


                            Object.entries(feature.properties)


                                .map(([k, v]) =>

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
        color:"brown",
        weight:2,
        fillColor:"orange",
        fillOpacity:0.5
    },

    totholzIcon

);
// ===============================
// Naturpark Karwendel Grenze laden
// ===============================

loadGeoJSON(

    "data/NP_Grenze1.geojson",

    naturparkGrenze,

    {

        color: "black",

        weight: 1,

        fillColor: "transparent",

        fillOpacity: 0

    }

);





// ===============================
// Naturdenkmäler WFS laden
// ===============================


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


    "🌲 Totholz abgelöst":

        totholz,


    "🌳 Naturdenkmäler Fläche":

        naturdenkmaelerFlaeche,


    "📍 Naturdenkmäler Punkt":

        naturdenkmaelerPunkt,


    "🏔️ Naturpark Karwendel":

        naturparkGrenze


};



L.control.layers(

    {

        "OpenStreetMap": osm

    },


    overlayMaps,


    {

        collapsed: false

    }


).addTo(map);






// ===============================
// Maßstab
// ===============================

L.control.scale({

    metric: true,

    imperial: false

}).addTo(map);






// ===============================
// Layer automatisch anzeigen
// ===============================

totholz.addTo(map);

naturdenkmaelerFlaeche.addTo(map);

naturdenkmaelerPunkt.addTo(map);

naturparkGrenze.addTo(map);