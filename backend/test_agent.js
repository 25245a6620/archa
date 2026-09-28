const http = require('http');

const askAgent = (question, memoryEnabled = true) => {
    return new Promise((resolve) => {
        const req = http.request({
            hostname: 'localhost',
            port: 3000,
            path: '/api/agent/ask',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(JSON.parse(data)));
        });

        req.on('error', (err) => resolve({ error: err.message }));
        req.write(JSON.stringify({ question, memoryEnabled }));
        req.end();
    });
};

(async () => {
    console.log("=== ARCHA PHASE 3 VERIFICATION TESTS ===\n");

    console.log("TEST A: Generic Question");
    const testA = await askAgent("What is horizontal scaling?");
    console.log(JSON.stringify(testA, null, 2), "\n");

    console.log("TEST B: PostgreSQL with memory ON");
    const testB = await askAgent("Why did NovaCart choose PostgreSQL?", true);
    console.log(JSON.stringify(testB, null, 2), "\n");

    console.log("TEST C: PostgreSQL with memory OFF");
    const testC = await askAgent("Why did NovaCart choose PostgreSQL?", false);
    console.log(JSON.stringify(testC, null, 2), "\n");

    console.log("TEST D: MongoDB unknown-history test");
    const testD = await askAgent("Why did NovaCart choose MongoDB?", true);
    console.log(JSON.stringify(testD, null, 2), "\n");

    console.log("TEST E: Missing LLM key test");
    // To properly simulate missing key inside the backend context, 
    // I can't overwrite process.env dynamically if Node doesn't let route rebind.
    // However, I can hit a new debug endpoint or just manually test it here if I modify the .env.
    // Since we handle "LLM API failure" safely, let's observe our masked 401.
})();
