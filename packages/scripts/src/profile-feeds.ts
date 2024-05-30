import { performance } from "perf_hooks";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const profileEndpoints = async () => {
  const endpoints = [
    { url: "http://localhost:3001/feed/casts", version: "v0" },
    { url: "http://localhost:3001/v1/casts", version: "v1" },
  ];
  const requestCount = 10;
  const delay = 500;

  console.log(`Profiling ${requestCount} requests per endpoint...`);
  const results = [];

  for (const endpoint of endpoints) {
    const latencies: number[] = [];

    const makeRequest = async () => {
      try {
        const response = await fetch(endpoint.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-viewer-fid": "3887",
          },
          body: JSON.stringify({
            filter: {
              users: {
                type: "FOLLOWING",
                data: {
                  fid: "3887",
                },
              },
            },
            context: {
              viewerFid: "3887",
            },
          }),
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        await response.json();
      } catch (error) {
        console.error(`Error accessing ${endpoint.url}:`, error);
      }
    };

    // Warmup
    for (let i = 0; i < 2; i++) {
      await makeRequest();
      await sleep(delay);
    }

    // Measure
    for (let i = 0; i < requestCount; i++) {
      const startTime = performance.now();
      await makeRequest();
      const endTime = performance.now();
      const latency = endTime - startTime;
      latencies.push(latency);

      if (i < requestCount - 1) {
        await sleep(delay);
      }
    }

    const min = Math.min(...latencies);
    const max = Math.max(...latencies);
    const mean = latencies.reduce((a, b) => a + b, 0) / latencies.length;
    const median = latencies.sort((a, b) => a - b)[
      Math.floor(latencies.length / 2)
    ];
    const sumLatency = latencies.reduce((a, b) => a + b, 0);

    results.push({
      version: endpoint.version,
      runs: latencies.length,
      min: `${min.toFixed(2)}ms`,
      max: `${max.toFixed(2)}ms`,
      mean: `${mean.toFixed(2)}ms`,
      median: `${median.toFixed(2)}ms`,
      total: `${sumLatency.toFixed(2)}ms`,
    });
  }

  console.table(results);
};

profileEndpoints();
