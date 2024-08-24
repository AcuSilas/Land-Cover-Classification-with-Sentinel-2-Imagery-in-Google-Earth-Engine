
// // Display the shapefile on the map
Map.addLayer(aoi, {}, 'AOI');
Map.centerObject(aoi, 9);

// Load Sentinel-2 imagery and filter by date
var s2Raw = ee.ImageCollection('COPERNICUS/S2_HARMONIZED')
  .filterDate('2023-01-01', '2023-12-31')
  .filterBounds(aoi)
  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 5));

// Create a cloud-free composite
var image = s2Raw.median().divide(10000);

// Set visualization parameters for true color
var visParamsTrue = {bands: ['B4', 'B3', 'B2'], min: 0, max: 0.3, gamma: 1.4};
Map.addLayer(image.clip(aoi), visParamsTrue, "Sentinel-2 2023");

// Define bands and labels
var label = 'Class';
var bands = ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B8A', 'B11', 'B12']; 
var input = image.select(bands);

// Merge the training data for different classes
var training = Vegetation.merge(Barren).merge(Water).merge(Buildup);

// Sample the regions to get training data
var trainImage = input.sampleRegions({
  collection: training,
  properties: [label],
  scale: 10
});
print(trainImage);

// Split the training data into training and testing sets
var trainingData = trainImage.randomColumn();
var trainSet = trainingData.filter(ee.Filter.lessThan('random', 0.8));  // Training data
var testSet = trainingData.filter(ee.Filter.greaterThanOrEquals('random', 0.8));  // Validation data

// Train a Random Forest classifier
var classifierRF23 = ee.Classifier.smileRandomForest(50).train(trainSet, label, bands);

// Classify the image
var classifiedRF23 = input.classify(classifierRF23);

// Define a palette for the classification
var landcoverPalette = [
  'blue',   // Water (0)
  'red',    // Buildup (1)
  'green',  // Vegetation (2)
  'yellow'  // Barren (3)
];

Map.addLayer(classifiedRF23.clip(aoi), {palette: landcoverPalette, min: 0, max: 3 }, 'Classification RF23');


// Create a dictionary for the legend of the classified image
var classifiedDict = {
  "names": ["Water", "Buildup", "Vegetation", "Barren"],
  "colors": ["blue", "red", "green", "yellow"]
};

// Function to add a legend to the map
function addLegend(panel, dict, title) {
  var legendTitle = ui.Label({
    value: title,
    style: {
      fontWeight: 'bold',
      fontSize: '18px',
      margin: '0 0 4px 0',
      padding: '0'
    }
  });
  panel.add(legendTitle);
  
  var makeRow = function(color, name) {
    var colorBox = ui.Label({
      style: {
        backgroundColor: color,
        padding: '8px',
        margin: '0 0 4px 0'
      }
    });
  
    var description = ui.Label({
      value: name,
      style: {margin: '0 0 4px 6px'}
    });
  
    return ui.Panel({
      widgets: [colorBox, description],
      layout: ui.Panel.Layout.Flow('horizontal')
    });
  };
  
  var palette = dict['colors'];
  var names = dict['names'];
  
  for (var i = 0; i < names.length; i++) {
    panel.add(makeRow(palette[i], names[i]));
  }
  
  Map.add(panel);
}

// Add the legend for the classified image to the map
var legendPanel = ui.Panel({style: {position: 'bottom-right', padding: '8px 15px'}});
addLegend(legendPanel, classifiedDict, 'Classification Legend');


// // Define a dictionary which will be used to make legend and visualize image on map
var dict = {
  "names": [
    "Water",
    "Trees",
    "Flooded Vegetation",
    "Crops",
    "Built Area",
    "Bare Ground",
    "Snow/Ice",
    "Clouds",
    "Rangeland"
  ],
  "colors": [
    "#1A5BAB",
    "#358221",
    "#87D19E",
    "#FFDB5C",
    "#ED022A",
    "#EDE9E4",
    "#F2FAFF",
    "#C8C8C8",
    "#C6AD8D"
  ]};
  
  function remapper(image){
    var remapped = image.remap([1,2,4,5,7,8,9,10,11],[1,2,3,4,5,6,7,8,9])
    return remapped
  }

// This is palette has '#000000' for value 3 and 6.
var palette = [
    "#1A5BAB",
    "#358221",
    "#000000",
    "#87D19E",
    "#FFDB5C",
    "#000000",
    "#ED022A",
    "#EDE9E4",
    "#F2FAFF",
    "#C8C8C8",
    "#C6AD8D",
  ];

// Create a panel to hold the legend widget
var legend = ui.Panel({
  style: {
    position: 'bottom-left',
    padding: '8px 15px'
  }
});

// Function to generate the legend
function addCategoricalLegend(panel, dict, title) {
  
  // Create and add the legend title.
  var legendTitle = ui.Label({
    value: title,
    style: {
      fontWeight: 'bold',
      fontSize: '18px',
      margin: '0 0 4px 0',
      padding: '0'
    }
  });
  panel.add(legendTitle);
  
  var loading = ui.Label('Loading legend...', {margin: '2px 0 4px 0'});
  panel.add(loading);
  
  // Creates and styles 1 row of the legend.
  var makeRow = function(color, name) {
    // Create the label that is actually the colored box.
    var colorBox = ui.Label({
      style: {
        backgroundColor: color,
        // Use padding to give the box height and width.
        padding: '8px',
        margin: '0 0 4px 0'
      }
    });
  
    // Create the label filled with the description text.
    var description = ui.Label({
      value: name,
      style: {margin: '0 0 4px 6px'}
    });
  
    return ui.Panel({
      widgets: [colorBox, description],
      layout: ui.Panel.Layout.Flow('horizontal')
    });
  };
  
  // Get the list of palette colors and class names from the image.
  var palette = dict['colors'];
  var names = dict['names'];
  loading.style().set('shown', false);
  
  for (var i = 0; i < names.length; i++) {
    panel.add(makeRow(palette[i], names[i]));
  }
  
  Map.add(panel);
  
}


/*
  // Display map and legend ///////////////////////////////////////////////////////////////////////////////
*/

// Add the legend to the map
addCategoricalLegend(legend, dict, 'Land Cover Class');

// Add image to the map
Map.addLayer(
  remapper(
    esri_lulc_ts.filterDate('2023-01-01', '2023-12-31').mosaic()
  ).clip(aoi),
  {min: 1, max: 9, palette: dict['colors']},
  '2023 LULC 10m'
);
