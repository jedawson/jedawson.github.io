---
layout: post
title: Kickstarter Data. Project 2
---

## Intro
Everywhere in the world, there are a bunch of people trying to find investors to fund their dreams. One way to raise funds is through the website Kickstarter. Creators have a web page where backers can sign up to financially contribute to a project. In return, the creator promises to provide rewards at a certain date in the future. They will only get money if they reach their goal.

## Overview
I wanted to find out how much money can be raised per project given a variety of factors.

## Data Gathering
Historical data from kickstarter is hard to come by, so I found a website where data was already scraped. I downloaded all of the CSV files from the website using Selenium.
Additionally, I also got country data about GDP PPP per capita from wikipedia using BeautifulSoup and requests python package.

## Analysis
I ran multiple regressions such as LASSO and Ridge. I selected the variables with the p-values lower than .01 for my final model.
The variable with the lowest p-value was the number of backers and the second lowest numerical variable's p-value was the hype duration days (number of days between the project starting and the campaign beginning).

## Conclusion
Since the most significant variable was the number of backers a project has, a project's success depends on the reach of people seeing the project. Either the project needs to have a good marketing campaign or good word of mouth.
