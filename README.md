# Land-Cover-Classification-with-Sentinel-2-Imagery-in-Google-Earth-Engine

Project Overview:
The code provided performs land cover classification using Sentinel-2 imagery and a Random Forest classifier in Google Earth Engine (GEE). The steps involve loading and processing satellite imagery, training a classification model, and visualizing the results with legends on an interactive map.

Step-by-Step Explanation:
Load Shapefile and Display AOI:

The Area of Interest (AOI) shapefile is loaded and displayed on the map.
The map is centered on the AOI at a zoom level of 9.
Load and Filter Sentinel-2 Imagery:

Sentinel-2 imagery is loaded for the year 2023, filtered by cloud coverage (<5%) and within the AOI.
A cloud-free composite image is created by taking the median of the filtered images and normalizing the pixel values.
Image Visualization:

The cloud-free composite image is visualized using true-color bands (Red, Green, Blue) with specified visualization parameters.
Data Preparation for Classification:

Bands used for classification are selected.
Training data is prepared by merging different land cover classes (Vegetation, Barren, Water, Buildup).
The training data is sampled to create a training dataset, which is then split into training (80%) and testing (20%) sets.
Random Forest Classification:


A Random Forest classifier is trained using the training dataset.
The classifier is used to classify the Sentinel-2 image, producing a land cover classification image.
Visualization of Classification Results:

The classified image is visualized using a color palette corresponding to different land cover classes (Water, Buildup, Vegetation, Barren).
A legend is created and added to the map to help users interpret the classification results.


Remapping and Visualization of ESRI Land Use/Land Cover (LULC) Data:

ESRI LULC data is remapped to new class values and visualized on the map with a different color palette.
A legend for the ESRI LULC data is also created and displayed.
Interactive Map with Legends:

Legends for both the classified image and the ESRI LULC data are added to the map.
The final map includes both the classified Sentinel-2 image and the ESRI LULC data for comparison.
