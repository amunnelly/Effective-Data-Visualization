# -*- coding: utf-8 -*-
"""
Created on Tue Mar 08 14:19:37 2016

@author: amunnelly
"""

import pandas as pd
import matplotlib.pyplot as plt
import json

#Read in original data
original = pd.read_csv('2008.csv')
with open('airports.json') as f:
    airports = json.load(f)
    
def airport_name_finder(iata):
    '''
    (str) - (str)
    Returns the name of an airport when
    given the airports IATA code
    '''
    temp = 0
    while temp < len(airports):
        if airports[temp]['iata'] == iata:
            return airports[temp]['name']
        temp += 1
    return iata


myAirport = original[original.Dest == 'LAS']
myAirport['name'] = myAirport['Origin'].apply(airport_name_finder)
myAirport.to_csv('vegasTraffic.csv')
myAirportForBlocksDotOrg = myAirport[['Origin',
                                     'Distance',
                                     'name',
                                     'AirTime']]
myAirportForBlocksDotOrg.to_csv('vegasTrafficBlocks.csv')

byDestination = myAirport.groupby('Origin')
destination_time_distance = {'origin':[],
                             'time': [],
                            'distance':[]}
                            
for a, b in byDestination:
    destination_time_distance['origin'].append(a)
    destination_time_distance['time'].append(b.AirTime.mean())
    destination_time_distance['distance'].append(b.Distance.mean())
    
ea_df = pd.DataFrame(destination_time_distance)
plt.scatter(ea_df.distance, ea_df.time)

