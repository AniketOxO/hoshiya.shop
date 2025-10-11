Quick load testing for this static site

Prerequisites:
- Node.js (to run tools/load_test.js)
- Python 3 (to serve static files quickly via `python -m http.server`)

Example (PowerShell):

# From workspace root (d:\ezydreamy)
# 1) Start a local static server
python -m http.server 8000

# 2) In a separate shell, run the Node load tester (adjust concurrency/requests as needed)
node tools/load_test.js --url http://127.0.0.1:8000/ --concurrency 100 --requests 1000

Notes:
- Running 1000 concurrent clients will stress your local machine. Start with smaller numbers (100 concurrency, 200-500 requests) to observe behaviour.
- This tool performs simple GET requests and measures latency; it does not emulate complex browser behaviour (no JS execution, no cookies, no TCP keepalive tuning). For more advanced tests consider `k6`, `wrk`, or `artillery`.
