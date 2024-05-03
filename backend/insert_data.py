from pymongo import MongoClient, InsertOne
import os
from openai import OpenAI
import certifi
from PyPDF2 import PdfReader
from dotenv import load_dotenv
from langchain.text_splitter import CharacterTextSplitter
from concurrent.futures import ThreadPoolExecutor
import pandas as pd

# Load environment variables
load_dotenv()
OAI = OpenAI()
os.environ['SSL_CERT_FILE'] = certifi.where()
MONGODB_CONNECTION_STRING = os.environ.get('MONGODB_CONNECTION_STRING')
MONGODB_COL = os.environ.get("MONGODB_COL")
MONGODB_DB = os.environ.get("MONGODB_DB")
client = MongoClient(MONGODB_CONNECTION_STRING)
collection = client[MONGODB_DB]["embedded_content"]
CHUNK_SIZE = 100

def get_embedding(text, model="text-embedding-ada-002"):
    text = text.replace("\n", " ")
    response = OAI.embeddings.create(input=[text], model=model).data
    return response[0].embedding

def process_pdf_directory(directory_path):
    data = []
    files = os.listdir(directory_path)
    abs_directory_path = os.path.abspath(directory_path)
    for filename in files:
        if filename.endswith(".pdf"):
            print(f"Processing {filename}")
            pdf_path = os.path.join(directory_path, filename)
            with open(pdf_path, "rb") as f:
                pdf_reader = PdfReader(f)
                for page_number, page in enumerate(pdf_reader.pages, start=1):
                    data.append({
                        "text": page.extract_text(),
                        "filename": filename,
                        "page_number": page_number,
                        "pdf_path": abs_directory_path+"/"+filename
                    })
    return data

def split_txt(data, chunk_size=100):
    text_splitter = CharacterTextSplitter(
        separator="\n",
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len
    )
    text=[]
    for entry in data:
        txts=text_splitter.split_text(entry['text'])
        if txts: 
            for sublist in txts:
                text.append({
                        "text": sublist,
                        "filename": entry['filename'],
                        "page_number": entry['page_number'],
                        "pdf_path": entry['pdf_path'],
                    })
    chunks = [text[i:i + chunk_size] for i in range(0, len(text), chunk_size)]
    return chunks

def store_text_embeddings(chunks):
    bulk_docs = []
    for chunk in chunks:
        embedding = get_embedding(chunk['text'])
        document = {
                "sourceName":chunk['filename'],
                "url":"file://"+chunk["pdf_path"],
                "text": chunk['text'],
                "embedding": embedding,
                "metadata": {
                    "page_number": chunk['page_number']
                },
                "updated":pd.Timestamp.now()
        }
        bulk_docs.append(InsertOne(document))
    print("Inserting documents")
    collection.bulk_write(bulk_docs)
    print("Inserted")

if __name__ == "__main__":
    #dir_path = input("Enter the directory path containing PDFs: ")
    dir_path="./PDFs"
    if dir_path:
        combined_text = process_pdf_directory(dir_path)
        chunks=split_txt(combined_text)
        #print(chunks[0])
        #print(len(chunks[0]))
        
        with ThreadPoolExecutor(max_workers=len(chunks[-1])) as executor:  # Adjust max_workers as needed
            executor.map(store_text_embeddings, chunks)
        print("\nDocuments loaded!")

    client.close()
