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
// BasemapAT Orthofoto
// ===============================

const orthofoto = L.tileLayer.provider(
    'BasemapAT.orthofoto'
);

// ===============================
// Totholz Einzelmarker Icon
// ===============================

const totholzIcon = L.icon({

    iconUrl: "icons/totholz.svg",

    iconSize: [35, 35],

    iconAnchor: [17, 35],

    popupAnchor: [0, -35]

});

const totholzPotentialIcon = L.icon({

    iconUrl: "icons/totholz_pot.svg",

    iconSize: [35, 35],

    iconAnchor: [17, 35],

    popupAnchor: [0, -35]

});


// ===============================
// Naturdenkmal Einzelmarker Icon
// ===============================

const naturdenkmalIcon = L.icon({

    iconUrl: "icons/denkmaeler.svg",

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

});





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
                `
            <div class="totholz-cluster">
                <img src="icons/totholz.svg">
                <span>${cluster.getChildCount()}</span>
            </div>
            `,


            className: "custom-cluster-icon",

            iconSize: [30, 30]

        });

    }

});

const totholzPotential = L.markerClusterGroup({

    showCoverageOnHover: false,

    spiderfyOnMaxZoom: true,

    zoomToBoundsOnClick: true,

    disableClusteringAtZoom: 15,

    iconCreateFunction: function (cluster) {

        return L.divIcon({

            html:
                `
                <div class="totholz-potential-cluster">

                    <img src="icons/totholz_pot.svg">

                    <span>
                        ${cluster.getChildCount()}
                    </span>

                </div>
                `,

            className: "custom-cluster-icon",

            iconSize: [30, 30]

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

                `
            <div class="naturdenkmal-cluster">

                <img src="icons/denkmaeler.svg">

                <span>
                ${cluster.getChildCount()}
                </span>

            </div>
            `,


            className: "custom-cluster-icon",

            iconSize: [50, 50]

        });


    }

});

const naturdenkmaelerFlaeche = L.layerGroup();

const naturparkGrenze = L.layerGroup();




// ===============================
// GeoJSON Loader
// ===============================

function loadGeoJSON(url, group, style = {}, markerIcon = null, popup = true) {


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


                    if (popup && feature.properties) {


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

function loadWFS(url, typeName, group, style = {}, markerIcon = null) {


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

                            radius: 7,

                            color: style.color,

                            fillColor: style.fillColor,

                            fillOpacity: 0.8

                        }

                    );


                },


                onEachFeature: function (feature, layer) {

                    if (feature.properties && feature.properties.NAME) {

                        layer.bindPopup(
                            `<b>${feature.properties.NAME}</b>`
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
},

totholzIcon,

false

);

// ===============================
// Totholz Potential laden
// ===============================

loadGeoJSON(

    "data/Totholz_Potential.geojson",

    totholzPotential,

    {
        color: "darkred",
        weight: 2,
        fillColor: "red",
        fillOpacity: 0.5
    },

    totholzPotentialIcon

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

    },

    null,

    false

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

    },

    naturdenkmalIcon

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

    '<img src="icons/totholz_pot.svg" class="layer-icon">Lebendsbäume (ohne Paten*in)':
        totholzPotential,


    '<img src="icons/totholz.svg" class="layer-icon">Lebensbäume abgelöst':
        totholz,


    '<img src="icons/denkmaeler.svg" class="layer-icon"> Naturdenkmäler':
        naturdenkmaelerPunkt,

    "Naturdenkmäler (Flächen)":

        naturdenkmaelerFlaeche,



    "Naturpark Karwendel":

        naturparkGrenze


};


L.control.layers(

    {
        "OpenStreetMap": osm,
        "BasemapAT Orthofoto": orthofoto
    },

    overlayMaps,

    {
        collapsed: true
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

totholz;

totholzPotential.addTo(map);

naturdenkmaelerFlaeche;

naturdenkmaelerPunkt;

naturparkGrenze.addTo(map);