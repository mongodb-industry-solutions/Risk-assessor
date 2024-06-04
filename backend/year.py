from pymongo import MongoClient, UpdateOne
from dotenv import load_dotenv
import os

load_dotenv()
# Connect to MongoDB
MONGO_CONN = os.environ.get("MONGODB_CONNECTION_STRING")
MONGODB_DB = os.environ.get("MONGODB_DB")
MONGODB_COL = os.environ.get("MONGODB_COL")
client = MongoClient(MONGO_CONN)
db = client[MONGODB_DB]
collection = db[MONGODB_COL]

# Define the aggregation pipeline
filter_query = {
    "year": { "$type": "object" }
}

# Find documents matching the filter
documents_to_update = collection.find(filter_query)
bulk_operations = []
for document in documents_to_update:
    year = int(str(document["DATE_END"])[:4])
    bulk_operations.append(UpdateOne({"_id": document["_id"]}, {"$set": {"year": year}}))
    if len(bulk_operations) == 1000:
        print("Bulk writing 1000 documents")
        collection.bulk_write(bulk_operations)
        bulk_operations = []

collection.bulk_write(bulk_operations)

client.close();
