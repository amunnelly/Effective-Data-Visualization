# -*- coding: utf-8 -*-
"""
Created on Tue Mar 08 14:19:37 2016

@author: amunnelly
"""

import pandas as pd
from collections import defaultdict

#Read in original data
original = pd.read_csv('2008.csv')

#Group by Origin, and then count each group
byOrigin = original.groupby('Origin')
counter = defaultdict(int)

for a, b in byOrigin:
    counter[a] = b['Origin'].count()
    
#Map the group counts to the original data frame
original['counter'] = original['Origin'].map(lambda x: counter[x])

#Create a new data frame with the number of flights over a threshold
#number - 15,000 in this case.
#processed = original[original['counter'] > original.counter.quantile(0.5)]
#print processed.Origin.value_counts()
#Write the new data frame to file
#processed.to_csv("2008_processed.csv")


#southwest = original[original['UniqueCarrier'] == 'WN']
#southwest.to_csv('2008_southwest.csv')

#Group by carrier and count the airports associated with each
#carriers = original.groupby('UniqueCarrier')
#for a, b in carriers:
#    print a, b.Origin.nunique()
    
#Select Skywest, IATA callsign 'OO'
ua = original[original['UniqueCarrier'] == 'UA']
ua.to_csv('UnitedAirlines_2008.csv')

shorter_ua = ua[ua.DayOfWeek == 6]
shorter_ua.to_csv('ua_day6_2008.csv')