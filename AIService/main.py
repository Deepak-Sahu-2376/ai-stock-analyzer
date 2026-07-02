import io
import json
import requests
import PyPDF2
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from langchain_ollama import OllamaLLM
from langchain_core.prompts import PromptTemplate

import logging
logging.getLogger("PyPDF2").setLevel(logging.ERROR)

import warnings
from PyPDF2.errors import PdfReadWarning
warnings.filterwarnings("ignore", category=PdfReadWarning)
warnings.filterwarnings("ignore", category=UserWarning)

app = FastAPI()

class SummarizeRequest(BaseModel):
    pdf_url: str
    ollama_url: str
    model_name: str
    symbol: str

def extract_text_from_pdf(pdf_url: str) -> str:
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
            'Accept': 'application/pdf'
        }
        response = requests.get(pdf_url, headers=headers, timeout=30)
        response.raise_for_status()
        
        pdf_file = io.BytesIO(response.content)
        
        if pdf_url.lower().endswith('.zip'):
            import zipfile
            with zipfile.ZipFile(pdf_file) as z:
                pdf_found = False
                for filename in z.namelist():
                    if filename.lower().endswith('.pdf'):
                        pdf_file = io.BytesIO(z.read(filename))
                        pdf_found = True
                        break
                if not pdf_found:
                    raise Exception("No PDF found inside ZIP attachment.")
                    
        reader = PyPDF2.PdfReader(pdf_file)
        
        text = ""
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
                
        return text
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch or parse PDF: {str(e)}")

@app.post("/api/ai/summarize")
def summarize_announcement(req: SummarizeRequest):
    pdf_text = extract_text_from_pdf(req.pdf_url)
    
    if not pdf_text.strip():
        return {
            "summary": "This announcement is a scanned image document. The local AI cannot extract text from scanned images without OCR.",
            "sentiment": "Neutral",
            "impact": "Neutral"
        }
    
    # We truncate text if it's too long for the context window
    truncated_text = pdf_text[:10000] 

    urls = [u.strip() for u in req.ollama_url.split(',') if u.strip()]
    if not urls:
        raise HTTPException(status_code=400, detail="No Ollama URLs provided.")

    prompt = PromptTemplate(
        input_variables=["symbol", "text"],
        template="""Analyze this corporate announcement for the company {symbol}.
Provide a concise 2-sentence summary, the expected price sentiment (Bullish, Bearish, or Neutral), and the overall company impact (Positive, Negative, or Neutral).
Respond strictly in valid JSON format with keys "summary", "sentiment", and "impact". Do not include any other text, markdown blocks or explanation.

Announcement Text:
{text}
"""
    )
    formatted_prompt = prompt.format(symbol=req.symbol, text=truncated_text)

    last_error = None
    for url in urls:
        try:
            llm = OllamaLLM(
                base_url=url,
                model=req.model_name,
                temperature=0.1
            )
            
            result = llm.invoke(formatted_prompt)
            
            result_text = result.strip()
            if result_text.startswith("```json"):
                result_text = result_text[7:]
            if result_text.endswith("```"):
                result_text = result_text[:-3]
                
            data = json.loads(result_text)
            return data
            
        except Exception as e:
            print(f"Failed on Ollama endpoint {url}: {str(e)}")
            last_error = e
            continue
            
    raise HTTPException(status_code=500, detail=f"LLM processing failed on all configured endpoints. Last error: {str(last_error)}")
