---
layout: post
title: MTA Turnstile Data. Project 1
---

## Intro
For the MTA Turnstile Data Project 1, the project's directive was to increase the number of signups for the Women Tech Women Yes conference.

### Overview
There are multiple ways to approach this assignment. Since the main goal of the client is to engage people from the tech industry, the best possible way to target the tech industry is at the stations closest to their workplace.

### Data Gathering
Initially, the data from the MTA turnstiles were going to be an important part of the assignment.
However, we saw that the best data would come from other sources. These other sources include the location in latitude and longitude form and the list of top tech companies.
We were able to locate specific location data based on the MTA's specific codes from Chris Whong's dataset. Here is the blog post from him that led us to his github with the data of the turnstiles' locations: <https://chriswhong.com/open-data/visualizing-the-mtas-turnstile-data/>.
I also wrote the code to gather data from the made in nyc's blog post about the top local 100 tech companies: <https://www.builtinnyc.com/2017/11/07/nyc-top-100-tech-companies-2017>. Each companies' address was on a different link, so the crawler went to those links to extract the address. The list they wrote does not include companies that have their headquarters in different cities. This slice of data doesn't give a complete picture of the tech scene in NYC, but their list is a good enough approximation. The data from the built in nyc's website did not provide addresses for every single company, so we used google to find the address of the companies with missing or vague addresses.

## Analysis
In order to find out the closest station, the location of the businesses must be reverse geocoded, which just means that addresses must be encoded into geographic coordinates. We used Geopy to reverse geocode the addresses. Sometimes, the geocoder did not correctly identify the coordinate due to the address providing too much information such as the suite number in the address. After removing the suite number, the geocode function worked. The list included approximately 40 addresses that did not geocode correctly.

We sorted the list and found the correct addresses for the top 20 companies so that the geocode function worked correctly. We also chose only 20 companies to map so that markers didn't cover every square inch of the map.

For each company coordinate pair, we found the closest station to company using Scipy and then plotted the coordinates of both the company and the closest station using Folium.

We also tried to combine the data of the turnstiles with the data from the turnstiles, but the merging of the two datasets was challenging to complete.

### Conclusion
It's possible to use publicly available python packages to find the nearest available station to a company.
Since companies within the same industry cluster together, organizations can use this method to target a particular industry's employees by locating the train stations closest to largest companies.

## Next Steps
The analysis of the data could further be explored to find the right time period during the day when employees are more likely to provide information.
Further research needs to be done on the effectiveness on gathering personal contact information at train stations.
Each method needs to be thoroughly investigated.

### Closing thoughts
In this project, I got to work with two other people, Krishna and Lee. It was good to bounce ideas off of other people and change our project accordingly. We ran into multiple problems with merging data sets and having three people work through issues was beneficial to completing the project.
