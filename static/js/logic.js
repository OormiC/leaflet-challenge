// Store our API endpoint as queryUrl.
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// Perform a GET request to the query URL/
d3.json(queryUrl).then(function (data) {
  // Once we get a response, send the data.features object to the createFeatures function.
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {
  // Define a function that we want to run once for each feature in the features array.
  // Give each feature a popup that describes the place and time of the earthquake.
  function onEachFeature(feature, layer) {
    layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p>`);
    }

  // Function to customize the circle marker size based on a property in the GeoJSON data
  function circleMarkerSize(feature) {
    // Access the property that contains the size information
    var size = feature.properties.mag
    // Return the scaled size value for the circle marker
    return Math.sqrt(size) * 9
    };
 
  // Function to customise the circle marker colour based on property depth in the GeoJSON data
  function circleMarkerColour(feature) {
    // Access the property that contains the colour information
    var depth = feature.geometry.coordinates[2]
    // Adjust the colour of the marker depending on the depth
    if (depth < 10) {
        var colour = "#FFDAB9";
      } else if (depth < 30) {
        var colour = "#FFA07A";
      } else if (depth < 50) {
        var colour = "#FF7F50";
      } else if (depth < 70) {
        var colour = "#CD5C5C";
      } else if (depth < 90) {
        var colour = "#B22222";
      } else {
        var colour = "#800000";
      }
    return colour
  }

  // Create a GeoJSON layer that contains the features array on the earthquakeData object.
  // Run the onEachFeature function once for each piece of data in the array.
  let earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: function(feature, latlng) {
        return L.circleMarker(latlng, {
            // Customisation for circle markers
            // Size corresponds to magnitude and greater depth is darker in colour
            radius: circleMarkerSize(feature),
            fillColor: circleMarkerColour(feature),
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8,
        });
  },
    onEachFeature: onEachFeature
  });

  // Send our earthquakes layer to the createMap function/
  createMap(earthquakes);
}

function createMap(earthquakes) {
  // Create the base layer.
  let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  })
  
  // Create our map, giving it the streetmap and earthquakes layers to display on load.
  let myMap = L.map("map", {
    center: [
      -10, 100
    ],
    zoom: 4,
    layers: [street, earthquakes]
  });

  // Create the legend
  // First create the function to get the appropriate legend colour for the label 
  function getColor(d) {
    return d > 90 ? "#800000" :
           d > 70  ? "#B22222" :
           d > 50  ? "#CD5C5C" :
           d > 30  ? "#FF7F50" :
           d > 10   ? "#FFA07A" :
           d > -10   ? "#FFDAB9" :
                      "#FFDAB9";
};
    // Set the legend position and intervals
    var legend = L.control({position: 'bottomright'});
    legend.onAdd = function (map) {
        var div = L.DomUtil.create('div', 'info legend'),
            grades = [-10, 10, 30, 50, 70, 90],
            labels = [];

        // loop through our density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }
        return div;
    };
    legend.addTo(myMap);

};
