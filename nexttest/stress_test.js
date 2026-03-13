const WebSocket = require('ws');

const TARGET_URL = 'ws://127.0.0.1:8080';
const CONCURRENCY = 20; // 并发用户数 (可调至 50 进行极限压测)

console.log(`\n[Benchmark] Initializing ${CONCURRENCY} concurrent compilations...`);
const startTime = Date.now();
let completed = 0;
let latencies = [];

const payload = JSON.stringify({
    action: 'execute',
    // 正常代码，不写死循环，测试真实编译耗时
    code: '#include <iostream>\nint main() { std::cout << "OK"; return 0; }',
    lang: 'cpp'
});

for (let i = 0; i < CONCURRENCY; i++) {
    const ws = new WebSocket(TARGET_URL);
    const reqStart = Date.now();

    ws.on('open', () => {
        ws.send(payload);
    });

    ws.on('message', (data) => {
        const res = JSON.parse(data.toString());
        if (res.status === 'success') {
            const reqTime = Date.now() - reqStart;
            latencies.push(reqTime);
            ws.close();
            completed++;
            
            // 进度条打印
            process.stdout.write(`\r[Progress] Completed: ${completed}/${CONCURRENCY}`);

            if (completed === CONCURRENCY) {
                const totalTime = (Date.now() - startTime) / 1000;
                latencies.sort((a, b) => a - b);
                
                console.log('\n\n====== 量化压测报告 (Benchmark Report) ======');
                console.log(`并发连接数 (Concurrency) : ${CONCURRENCY}`);
                console.log(`总耗时 (Total Time)      : ${totalTime.toFixed(2)} s`);
                console.log(`吞吐量 (Throughput/RPS)  : ${(CONCURRENCY / totalTime).toFixed(2)} requests/sec`);
                console.log(`最短延迟 (Min Latency)   : ${(latencies[0] / 1000).toFixed(2)} s`);
                console.log(`最长延迟 (Max Latency)   : ${(latencies[latencies.length - 1] / 1000).toFixed(2)} s`);
                console.log(`平均延迟 (Avg Latency)   : ${(latencies.reduce((a,b)=>a+b,0)/latencies.length / 1000).toFixed(2)} s`);
                console.log('==============================================\n');
                process.exit(0);
            }
        }
    });

    ws.on('error', (err) => {
        console.error(`\n[Client ${i}] WebSocket Error:`, err.message);
    });
}