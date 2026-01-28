/**
 * API and Backend Testing Script for Sandbox
 * 
 * Test API endpoints, data flow, and backend behavior.
 * Run with: npx ts-node scripts/sandbox/test-api.ts
 */

const BASE_URL = process.env.APP_URL || 'http://localhost:3000';

interface ApiTestResult {
    endpoint: string;
    method: string;
    status: number;
    responseTime: number;
    success: boolean;
    error?: string;
    data?: unknown;
}

class ApiTester {
    private results: ApiTestResult[] = [];

    async fetch(endpoint: string, options: RequestInit = {}): Promise<ApiTestResult> {
        const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
        const method = options.method || 'GET';
        const startTime = Date.now();

        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
            });

            const responseTime = Date.now() - startTime;
            let data: unknown;

            try {
                data = await response.json();
            } catch {
                data = await response.text();
            }

            const result: ApiTestResult = {
                endpoint,
                method,
                status: response.status,
                responseTime,
                success: response.ok,
                data,
            };

            this.results.push(result);
            console.log(`${response.ok ? '✅' : '❌'} ${method} ${endpoint} - ${response.status} (${responseTime}ms)`);

            return result;
        } catch (err) {
            const responseTime = Date.now() - startTime;
            const result: ApiTestResult = {
                endpoint,
                method,
                status: 0,
                responseTime,
                success: false,
                error: err instanceof Error ? err.message : String(err),
            };

            this.results.push(result);
            console.log(`❌ ${method} ${endpoint} - ERROR: ${result.error}`);

            return result;
        }
    }

    async get(endpoint: string): Promise<ApiTestResult> {
        return this.fetch(endpoint, { method: 'GET' });
    }

    async post(endpoint: string, body: unknown): Promise<ApiTestResult> {
        return this.fetch(endpoint, {
            method: 'POST',
            body: JSON.stringify(body),
        });
    }

    async testAllRoutes(): Promise<void> {
        console.log('🧪 Testing all routes...\n');

        // Test main pages
        const routes = [
            '/',
            '/lessons',
            '/projects',
            '/lessons/01_foundations/1.1_what_is_python',
            '/lessons/02_data_structures/2.1_lists',
            '/projects/01_foundations/1.1_project_hello_world',
            '/api/execute', // API endpoint if exists
        ];

        for (const route of routes) {
            await this.get(route);
        }

        console.log('\n📊 Summary:');
        const successful = this.results.filter(r => r.success).length;
        const failed = this.results.filter(r => !r.success).length;
        const avgTime = this.results.reduce((a, r) => a + r.responseTime, 0) / this.results.length;

        console.log(`  ✅ Successful: ${successful}`);
        console.log(`  ❌ Failed: ${failed}`);
        console.log(`  ⏱️ Avg response time: ${avgTime.toFixed(0)}ms`);
    }

    async loadTest(endpoint: string, concurrency: number = 10, duration: number = 5000): Promise<void> {
        console.log(`\n🔥 Load testing ${endpoint} (${concurrency} concurrent, ${duration}ms)...\n`);

        const startTime = Date.now();
        let requestCount = 0;
        let errorCount = 0;
        const responseTimes: number[] = [];

        const workers = Array.from({ length: concurrency }, async () => {
            while (Date.now() - startTime < duration) {
                const reqStart = Date.now();
                try {
                    const response = await fetch(`${BASE_URL}${endpoint}`);
                    responseTimes.push(Date.now() - reqStart);
                    requestCount++;
                    if (!response.ok) errorCount++;
                } catch {
                    errorCount++;
                    requestCount++;
                }
            }
        });

        await Promise.all(workers);

        const elapsed = Date.now() - startTime;
        const rps = (requestCount / elapsed) * 1000;
        const avgTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
        const p95 = responseTimes.sort((a, b) => a - b)[Math.floor(responseTimes.length * 0.95)];

        console.log('📊 Load test results:');
        console.log(`  Total requests: ${requestCount}`);
        console.log(`  Requests/sec: ${rps.toFixed(1)}`);
        console.log(`  Errors: ${errorCount}`);
        console.log(`  Avg response: ${avgTime.toFixed(0)}ms`);
        console.log(`  P95 response: ${p95}ms`);
    }

    getResults(): ApiTestResult[] {
        return this.results;
    }
}

// Main execution
async function main() {
    const tester = new ApiTester();

    // Test all routes
    await tester.testAllRoutes();

    // Run load test on homepage
    await tester.loadTest('/', 5, 3000);
}

export { ApiTester };

// Run if called directly (ES module compatible)
main().catch(console.error);
