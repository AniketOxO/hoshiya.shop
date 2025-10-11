#!/usr/bin/env node
// Simple load tester using Node's http/https modules.
// Usage: node tools/load_test.js --url http://127.0.0.1:8000/ --concurrency 100 --requests 1000

const http = require('http');
const https = require('https');
const { URL } = require('url');

function parseArgs() {
  const args = process.argv.slice(2);
  const out = { url: 'http://127.0.0.1:8000/', concurrency: 50, requests: 500, timeout: 10000 };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--url') out.url = args[++i];
    if (args[i] === '--concurrency') out.concurrency = parseInt(args[++i], 10);
    if (args[i] === '--requests') out.requests = parseInt(args[++i], 10);
    if (args[i] === '--timeout') out.timeout = parseInt(args[++i], 10);
  }
  return out;
}

(async function main(){
  const opts = parseArgs();
  const u = new URL(opts.url);
  const client = u.protocol === 'https:' ? https : http;

  console.log(`Load test starting: target=${opts.url} concurrency=${opts.concurrency} totalRequests=${opts.requests}`);

  let totalStarted = 0;
  let totalCompleted = 0;
  let totalFailed = 0;
  const latencies = [];

  const startTs = Date.now();

  async function worker(id) {
    while (true) {
      const seq = ++totalStarted;
      if (seq > opts.requests) break;
      const path = u.pathname + (u.search || '') ;
      const requestOptions = {
        hostname: u.hostname,
        port: u.port || (u.protocol === 'https:' ? 443 : 80),
        path: path,
        method: 'GET',
        headers: { 'User-Agent': 'hoshiya-load-test' }
      };

      await new Promise((resolve) => {
        const s = Date.now();
        const req = client.request(requestOptions, (res) => {
          // consume response
          res.on('data', () => {});
          res.on('end', () => {
            const dt = Date.now() - s;
            latencies.push(dt);
            totalCompleted++;
            resolve();
          });
        });
        req.on('error', (err) => {
          totalFailed++;
          resolve();
        });
        req.setTimeout(opts.timeout, () => {
          req.abort();
          totalFailed++;
          resolve();
        });
        req.end();
      });
    }
  }

  // start workers
  const n = Math.max(1, Math.min(opts.concurrency, opts.requests));
  const promises = [];
  for (let i = 0; i < n; i++) promises.push(worker(i));

  await Promise.all(promises);

  const duration = (Date.now() - startTs) / 1000;
  const success = totalCompleted;
  const failed = totalFailed;
  const total = success + failed;
  const rps = (total / duration).toFixed(2);

  latencies.sort((a,b)=>a-b);
  const sum = latencies.reduce((a,b)=>a+b,0);
  const avg = latencies.length ? (sum / latencies.length).toFixed(2) : 0;
  const p50 = latencies.length ? latencies[Math.floor(latencies.length*0.5)] : 0;
  const p90 = latencies.length ? latencies[Math.floor(latencies.length*0.9)] : 0;
  const p99 = latencies.length ? latencies[Math.floor(latencies.length*0.99)] : 0;

  console.log('\n=== Load test summary ===');
  console.log(`Duration: ${duration}s`);
  console.log(`Total requested: ${opts.requests}`);
  console.log(`Completed: ${success}`);
  console.log(`Failed: ${failed}`);
  console.log(`Requests/sec: ${rps}`);
  console.log(`Latency ms — avg: ${avg}, p50: ${p50}, p90: ${p90}, p99: ${p99}`);
  console.log('========================\n');
})();
