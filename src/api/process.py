# src/api/process.py
from http.server import BaseHTTPRequestHandler
from AllTypes import process_file
import json
import os

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        body = self.rfile.read(content_length)
        data = json.loads(body)
        file_path = data.get("file_path")
        if not file_path or not os.path.exists(file_path):
            self.send_response(400)
            self.end_headers()
            self.wfile.write(json.dumps({"error": "Missing or invalid file_path"}).encode('utf-8'))
            return
        results = process_file(file_path)
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(results).encode('utf-8'))
