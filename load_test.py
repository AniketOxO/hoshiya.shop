import asyncio
import time
import statistics
from aiohttp import ClientSession, TCPConnector

URL = 'http://127.0.0.1:8000/'
CONCURRENCY = 1000

async def fetch(session, idx):
    start = time.perf_counter()
    try:
        async with session.get(URL, timeout=10) as resp:
            text = await resp.text()
            elapsed = (time.perf_counter() - start) * 1000
            return True, resp.status, elapsed
    except Exception as e:
        elapsed = (time.perf_counter() - start) * 1000
        return False, str(e), elapsed

async def run_test():
    connector = TCPConnector(limit=0)
    async with ClientSession(connector=connector) as session:
        tasks = [fetch(session, i) for i in range(CONCURRENCY)]
        results = await asyncio.gather(*tasks)

    successes = [r for r in results if r[0]]
    failures = [r for r in results if not r[0]]

    latencies = [r[2] for r in successes]
    print(f"Total requests: {len(results)}")
    print(f"Successes: {len(successes)}")
    print(f"Failures: {len(failures)}")
    if latencies:
        print(f"Latency ms - min: {min(latencies):.2f}, p50: {statistics.median(latencies):.2f}, mean: {statistics.mean(latencies):.2f}, max: {max(latencies):.2f}")
    if failures:
        print("Sample failures:")
        for f in failures[:5]:
            print(f)

if __name__ == '__main__':
    asyncio.run(run_test())
