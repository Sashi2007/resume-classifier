#!/usr/bin/env python3
"""
Simple local HTTP server for AI Resume Classifier web application.
"""
import http.server
import socketserver
import os
import sys

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, must-revalidate')
        super().end_headers()

def run_server(port=PORT):
    for p in range(port, port + 10):
        try:
            with socketserver.TCPServer(("", p), Handler) as httpd:
                print(f"=====================================================")
                print(f"  AI Resume Classifier running at:")
                print(f"  --> http://localhost:{p}")
                print(f"=====================================================")
                sys.stdout.flush()
                httpd.serve_forever()
        except OSError as e:
            if "Address already in use" in str(e) or e.errno == 10048:
                continue
            else:
                raise e

if __name__ == "__main__":
    run_server()
