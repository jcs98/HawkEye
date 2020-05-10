<h1 align="center">HawkEye</h1>
<h3 align="center">Mobile application for analysis of solar energy potential in an urban setting for the Indian Space Research Organization (ISRO)</h3>
<h4 align="center">Winner, college qualifier round, Smart India Hackathon 2020</h4>
<p align="center">
<img width=300px src="demo.gif" alt="demo">
</p>

## Problem Statement
* To develop a mobile application for detecting sky pixels in a photograph
* Generate mask image (sky pixels - white, other pixels - black)
* Calculate angle of elevation of lowest sky pixel in mask image

## Features
* Machine Learning Model - HRNet - for semantic segmentation of landscape images
* Achieved a misclassification rate of 4.7% on a sample of 500 images from the skyfinder dataset
* Find angle of elevation of lowest sky pixel with Canny edge detection, HOG transform, thresholding and trigonometry using details from the camera's optics (proposal)

