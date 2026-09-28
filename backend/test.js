const http = require('http');

const request = (path, method = 'GET', body = null) => {
    return new Promise((resolve) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path,
            method,
            headers: {
                'Content-Type': 'application/json',
            },
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, body: JSON.parse(data) });
                } catch {
                    resolve({ status: res.statusCode, body: data });
                }
            });
        });

        req.on('error', (err) => resolve({ error: err.message }));

        if (body) req.write(JSON.stringify(body));
        req.end();
    });
};

(async () => {
    try {
        console.log('--- Health ---');
        console.log(await request('/api/health'));

        console.log('--- Memory Status ---');
        console.log(await request('/api/memory/status'));

        console.log('--- Memory Retain ---');
        console.log(await request('/api/memory/retain', 'POST', {
            content: "NovaCart selected PostgreSQL for transactional order data because strong relational consistency was required.",
            metadata: {
                decisionId: "AD-001",
                component: "PostgreSQL",
                category: "database"
            }
        }));

        console.log('--- Memory Recall ---');
        console.log(await request('/api/memory/recall', 'POST', {
            query: "Why did NovaCart choose PostgreSQL?"
        }));

        console.log('--- Memory Reflect ---');
        console.log(await request('/api/memory/reflect', 'POST', {
            topic: "NovaCart database architecture"
        }));
    } catch (e) {
        console.error(e);
    }
})();
