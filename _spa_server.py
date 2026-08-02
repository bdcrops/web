#!/usr/bin/env python3
"""Simple SPA-aware dev server. Serves index.html for unknown routes."""
import http.server, socketserver, os

PORT = 8080
DIR = os.path.dirname(os.path.abspath(__file__))

class SPAHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        path = self.translate_path(self.path)
        # If file doesn't exist AND URL has no extension → serve index.html
        if not os.path.exists(path) and '.' not in os.path.basename(self.path):
            self.path = '/index.html'
        return super().do_GET()

os.chdir(DIR)
with socketserver.TCPServer(("", PORT), SPAHandler) as httpd:
    print(f"SPA server on http://0.0.0.0:{PORT}")
    httpd.serve_forever()
