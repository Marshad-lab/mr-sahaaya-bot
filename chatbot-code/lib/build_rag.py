from langchain_ollama import ChatOllama
from langchain_core.prompts import PromptTemplate
from langchain.chains import RetrievalQA

template = """You are an AI assistant for an education institute called EduProvider.

You MUST follow these rules strictly:

1. First classify the user question internally as ONE of the following:
   - ACADEMIC (courses, learning, education topics in context)
   - GENERAL KNOWLEDGE (science, definitions like "what is sensor")
   - CASUAL (greetings, small talk like "hi", "how are you")

2. Response rules:
   - If CASUAL → respond politely and briefly in a friendly way (NO redirect)
   - If GENERAL KNOWLEDGE → answer using CONTEXT if available, otherwise give a short correct general explanation
   - If ACADEMIC and CONTEXT contains answer → answer directly
   - If ACADEMIC but NOT in CONTEXT → redirect to EduProvider at +1-333-111-2345

3. Do NOT show reasoning or mention categories.

4. Do NOT use prefixes like "Answer:" or "Assistant:".

STYLE:
- Keep responses short, clear, and natural
- No unnecessary explanations

CONTEXT:
{context}

QUESTION:
{question}

FINAL ANSWER:"""

# Reusable text template for prompts
PROMPT = PromptTemplate(template=template, input_variables=["context", "question"])

def build_rag(vs):
    retriever = vs.as_retriever(search_kwargs={"k": 4}) # Retrieve the top 4 most relevant documents
    llm = ChatOllama(model="deepseek-r1:1.5b", temperature=0) # LLM model with temperature 0 for deterministic responses

    qa = RetrievalQA.from_chain_type(
        llm=llm,
        retriever=retriever,
        chain_type="stuff", # dump all retrieved documents into the prompt
        return_source_documents=True, # return the retrieved documents along with the answer
        chain_type_kwargs={"prompt": PROMPT} # the prompt template defined above
        # fetches the revelant documents and uses the prompt template defined above to generate the final answer
    )
    return qa

