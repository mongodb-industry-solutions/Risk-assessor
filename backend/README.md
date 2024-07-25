# Seting up the Dataset

Clone the repo:
```
git clone git@github.com:mongodb-industry-solutions/Risk-assessor.git
```

> [!Warning]
> Please start by making sure that the cluster that was created is indeed a dedicated one as "COORD_2dsphere" index are not available on shared cluesters.

- [Connect to your cluster](https://www.mongodb.com/docs/atlas/connect-to-database-deployment/)
- Create the "ESG_demo" database and the "Flood_geospatial" collection
- Uncompress the file ESG_demo.Flood_geospatial.csv.zip
- [import the CSV file on the above collection (we recomend using MongoDB Compass)](https://www.mongodb.com/docs/compass/current/import-export/)
- [Lastly create a Geospatial Indexes on the "COORD" field](https://www.mongodb.com/docs/languages/python/pymongo-driver/current/indexes/geospatial-index/)

> [!Note]
> The flood data that is used in this demo comes from this [United States Flood Database](https://zenodo.org/records/7545697). It was just refined to be able to use a "COORD_2dsphere" index and to exclude older data so as to reduce the overall size of the dataset.

# Installation of the Backend

Navigate to the ./backend folder and setup the .env file:
```
MONGODB_CONNECTION_STRING=<Your_connection_string>
GOOGLE_API_KEY=<Your_GoogleMaps_api_key>
MONGODB_DB=ESG_demo
MONGODB_COL=Flood_geospatial 
```

# Executing the Backend without docker (optional)

First, make sure that you have all of the requirements installed in your Python instance:

```bash
pip install -r requirements.txt
# or
pip3 install -r requirements.txt
```

Then, run the bankend services:

```bash
python GeoAPI.py
# or
python3 GeoAPI.py
```

Once this is running you should have 3 APIs that are running:
- `http://localhost:8080/rev_geocode?latitude=${e.latlng.lat}&longitude=${e.latlng.lng}`
- `http://localhost:8080/address/`
- `http://localhost:8080/coordinates?latitude=${coords.lat}&longitude=${coords.lng}`

Once you have done everything, we can move on to the next part:
- [Installation of the frontend](../frontend/)
- Or go back [to the main page](../)