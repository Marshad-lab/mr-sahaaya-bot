from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import json
from lib.clean import strip_think
from lib.load_docs import load_docs
from lib.get_vectorstore import get_vectorstore
from lib.build_rag import build_rag
import time
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Query(BaseModel):
    question: str

# Load pipeline ONCE (good 👍)
docs = load_docs()
vs = get_vectorstore(docs)
qa = build_rag(vs)

@app.get("/")
def root():
    return {"message": "Chatbot API is running"}

@app.post("/chat")
def chat(query: Query):

    def generate():
        result = qa.invoke({"query": query.question})
        answer = strip_think(result["result"])

        for word in answer.split():
            yield json.dumps({"token": word + " "}) + "\n"
            time.sleep(0.05)  # optional typing effect

    return StreamingResponse(generate(), media_type="application/json")