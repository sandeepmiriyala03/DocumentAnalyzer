import re
import os
import PyPDF2
import easyocr
import pandas as pd
from PIL import Image
from docx import Document
from sumy.summarizers.lsa import LsaSummarizer
from sumy.parsers.plaintext import PlaintextParser
from sumy.nlp.tokenizers import Tokenizer
from collections import Counter
import nltk

# Download tokenizer (first run)
nltk.download('punkt', quiet=True)

# Initialize EasyOCR reader once
ocr_reader = easyocr.Reader(['en'])

# -------- Extraction functions --------
def extract_pdf_text(pdf_path):
    text = ""
    with open(pdf_path, "rb") as file:
        reader = PyPDF2.PdfReader(file)
        for page in reader.pages:
            p_text = page.extract_text()
            if p_text:
                text += p_text + "\n"
    return text

def extract_text_from_image(image_path):
    results = ocr_reader.readtext(image_path, detail=0)
    return "\n".join(results)

def extract_text_from_excel(excel_path):
    df = pd.read_excel(excel_path)
    return " ".join(df.astype(str).fillna("").values.flatten())

def extract_text_from_docx(docx_path):
    doc = Document(docx_path)
    return "\n".join([p.text for p in doc.paragraphs])

# -------- Processing helpers --------
def clean_text(text):
    return re.sub(r'\s+', ' ', text).strip()

def chunk_text_single(text):
    return [text] if text else []

def extract_keywords(text, top_n=10):
    words = re.findall(r'\w+', text.lower())
    stopwords = {
        'the', 'and', 'of', 'to', 'in', 'a', 'is', 'for', 'with', 'on',
        'that', 'by', 'as', 'are', 'at', 'from', 'this', 'it', 'or', 'an',
        'be', 'was', 'which', 'you', 'not', 'have', 'has', 'but', 'we',
        'can', 'all', 'will', 'if', 'they', 'your', 'their'
    }
    filtered = [w for w in words if w not in stopwords and len(w) > 2 and not w.isdigit()]
    count = Counter(filtered)
    return [word for word, _ in count.most_common(top_n)]

def summarize_text(text, sentence_count=3):
    parser = PlaintextParser.from_string(text, Tokenizer("english"))
    summarizer = LsaSummarizer()
    return [str(sentence) for sentence in summarizer(parser.document, sentence_count)]

def highlight_sentences(text, keywords, max_highlights=3):
    from nltk.tokenize import sent_tokenize
    sentences = sent_tokenize(text)
    highlights = []
    for sent in sentences:
        if any(kw.lower() in sent.lower() for kw in keywords):
            highlights.append(sent.strip())
            if len(highlights) >= max_highlights:
                break
    return highlights

# -------- Unified text extractor --------
def extract_text(file_path):
    ext = os.path.splitext(file_path)[1].lower()
    if ext == '.pdf':
        return extract_pdf_text(file_path)
    elif ext in ['.png', '.jpg', '.jpeg', '.bmp', '.tiff', '.tif']:
        return extract_text_from_image(file_path)
    elif ext in ['.xlsx', '.xls']:
        return extract_text_from_excel(file_path)
    elif ext == '.docx':
        return extract_text_from_docx(file_path)
    else:
        raise ValueError(f"Unsupported file type: {ext}")

# -------- Main pipeline --------
def process_file(file_path):
    if not os.path.exists(file_path):
        return {"error": "File not found!"}

    raw_text = extract_text(file_path)
    cleaned_text = clean_text(raw_text)
    chunks = chunk_text_single(cleaned_text)

    analysis = []
    for i, chunk in enumerate(chunks, 1):
        keywords = extract_keywords(chunk, top_n=8)
        highlights = highlight_sentences(chunk, keywords)
        summary = summarize_text(chunk, sentence_count=3)
        analysis.append({
            "chunk_number": i,
            "keywords": keywords,
            "highlights": highlights,
            "summary": summary
        })

    return {
        "total_chunks": len(chunks),
        "analysis": analysis
    }
