import streamlit as st
from openai import OpenAI as OAI
from langchain import PromptTemplate
import pandas as pd
from pymongo import MongoClient, InsertOne
from langchain.llms import OpenAI as OAI_LLM
import os
from dotenv import load_dotenv

load_dotenv()
MONGODB_CONNECTION_STRING = os.environ.get('MONGODB_CONNECTION_STRING')
MONGODB_COL = os.environ.get("MONGODB_COL")
MONGODB_DB = os.environ.get("MONGODB_DB")
client = MongoClient(MONGODB_CONNECTION_STRING)
collection = client[MONGODB_DB]["embedded_content"]

def find_similar_documents(embedding, limit=5):
    print("Searching for similar documents in MongoDB...")
    documents = list(collection.aggregate([
        { "$vectorSearch": {
                    "index": "vector_index",
                    "path": "embedding",
                    "limit": 5,
                    "numCandidates": 50,
                    "queryVector": embedding
            } }
    ]))
    print(f"Found {len(documents)} similar documents in documents.")
    return documents

def get_embedding(text, model="text-embedding-ada-002"):
    OAI_client = OAI()
    text = text.replace("\n", " ")
    response = OAI_client.embeddings.create(input=[text], model=model).data
    #print(response)
    return response[0].embedding

def answer_question(users_question, previous_context="", is_follow_up=False):
    print(f"Received question: {users_question}")
    llm = OAI_LLM()
    context1 = previous_context
    context1_sources = []
    if not is_follow_up:
        question_embedding = get_embedding(text=users_question, model="text-embedding-ada-002")
        documents = find_similar_documents(question_embedding, 5)
        df = pd.DataFrame(documents)
        for index, row in df[0:50].iterrows():
            print(row.get('metadata', 'Unknown ID')["page_number"])
            context1 = context1 + " " + row.text
            context1_sources.append({
                "Source Name": str(row.get('sourceName', 'Unknown ID')),
                "Page Number": row.get('metadata', 'Unknown ID')["page_number"],
                 "URL": str(row.get('url', 'Unknown ID')),
            })


    template = """
    You are a chat bot who loves to help people! Given the following context sections, answer the
    question using only the given contexts. If you are unsure and the answer is not
    explicitly written in the documentation, say "Sorry, I don't know how to help with that."
    Context section:
    {context1}
    Question:
    {users_question}
    """
    print(template)
    prompt = PromptTemplate(template=template, input_variables=[
                            "context1", "users_question"])
    prompt_text = prompt.format(context1=context1, users_question=users_question)
    response = llm.invoke(prompt_text)
    print(f"Response: {response}")
    return response, context1_sources


def main():
    query = ""
    st.title("Ask questions to Leafy Chatbot")
    st.header("Ask Questions")
    previous_context = ""
    query = st.text_input('Enter your question:')
    follow_up_keywords = ["summarize", "rephrase", "in bullets", "shorten", "simplify", "explain", "elaborate"]
    is_follow_up = any(keyword in query for keyword in follow_up_keywords)
    if query:
        response_text, context1_sources = answer_question(query, previous_context, is_follow_up)
        # Your remaining Streamlit interface code goes here
        styled_response = f"""
            <div style="background-color: #E6FFE6; padding: 10px; border-radius: 5px;">
            {response_text}
            </div>
            """
        st.markdown(styled_response, unsafe_allow_html=True)
        privacy_note = """
            <div style="font-size: 10px; color: grey; padding: 5px; border-top: 1px solid #E6E6E6; margin-top: 10px;">
            Note: this answer is created through Retrieval-Augmented Generation (RAG), using your own data in MongoDB and the LLM model text-embedding-ada-002.
            </div>
            """
        st.markdown(privacy_note, unsafe_allow_html=True)
        st.header("Provenance")
        provenance_sources = []
        provenance_sources.extend(context1_sources)
        print(context1_sources)
        print(provenance_sources)
        df = pd.DataFrame(provenance_sources)
        st.write(df.style.set_properties(**{'font-size': '10pt'}))
        # After displaying the response, add it to the previous_context.
        previous_context += " " + response_text

if __name__ == "__main__":
    main()
