import joblib
from bson import ObjectId
from dotenv import load_dotenv
import os
from datetime import datetime
from pymongo import MongoClient, GEOSPHERE
import requests
import math

load_dotenv()

MONGO_CONN = os.environ.get("MONGODB_CONNECTION_STRING")
MONGODB_DB = os.environ.get("MONGODB_DB")
MONGODB_COL = os.environ.get("MONGODB_COL")
GOOGLE_API_KEY = os.environ.get("GOOGLE_API_KEY")
client = MongoClient(MONGO_CONN)
col = client[MONGODB_DB][MONGODB_COL]
radius=10 # 10 km
MDB_Address = "1633 Broadway 38th floor, New York, NY 10019, United States"

def geocode(address, api_key):
    # Construct the URL for the Google Geocoding API
    url = f"https://maps.googleapis.com/maps/api/geocode/json?address={address}&key={api_key}"

    # Send the HTTP request
    response = requests.get(url)

    # Check if the request was successful
    if response.status_code == 200:
        # Parse the JSON response
        data = response.json()

        # Check if the response contains any results
        if data['status'] == 'OK':
            # Extract latitude and longitude from the first result
            location = data['results'][0]['geometry']['location']
            latitude = location['lat']
            longitude = location['lng']
            return longitude, latitude
        else:
            print("Geocoding failed. Status:", data['status'])
    else:
        print("HTTP request failed. Status code:", response.status_code)

if __name__ == "__main__":
    print("\n")
    longitude, latitude = geocode(MDB_Address, GOOGLE_API_KEY)
    #longitude, latitude  = -73.98460990000001, 40.7620791

    print("n\longitude, latitude",longitude, latitude)

    pipeline = [
        {"$geoNear": { "near": { "type": "Point", "coordinates": [longitude, latitude] }, "distanceField": "DISTANCE", "spherical": True, "maxDistance": radius*1000 } },
        {"$project": {"year":1, "COORD": "$COORD.coordinates", "DISTANCE":1 } },
        {"$match": {"year": {"$gte": 2016}}},
        {"$sort": { "year":-1, "DISTANCE":1 } },    
        #{"$match": {"year": {"$gte": datetime.now().year - 5}}},
        #{"$project": {"year":1, "DISTANT_RIVER":1, "DESCRIPTION":1, "COORD": 1, "DISTANCE":1 } },
        #{"$match": { "COORD": { "$geoWithin": { "$centerSphere": [[longitude, latitude], radius/6371 ] } } } }, 
        #{"$limit":10}
        ]
    print("\npipeline",pipeline)

    documents = list(col.aggregate(pipeline ) )
    print("\nlen(documents)",len(documents))
    for doc in documents:
        print(doc)

    print("\n\n\n\n")
    client.close();
