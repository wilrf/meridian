/**
 * Dynamic Browser Testing Script for Sandbox
 * 
 * This script allows for interactive, exploratory testing of the app.
 * Run with: npx ts-node scripts/sandbox/explore-browser.ts
 * 
 * Or inside Docker:
 * docker compose --profile testing exec playwright npx ts-node /app/scripts/sandbox/explore-browser.ts
 */

import { chromium, Browser, Page } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || process.env.APP_URL || 'http://localhost:3000';

interface ExplorationResult {
    url: string;
    title: string;
    timestamp: string;
    findings: string[];
    screenshots: string[];
    errors: string[];
    metrics: {
        loadTime?: number;
        elementCount?: number;
        consoleErrors?: number;
    };
}

class BrowserExplorer {
    private browser: Browser | null = null;
    private page: Page | null = null;
    private results: ExplorationResult[] = [];

    async init() {
        this.browser = await chromium.launch({ headless: true });
        const context = await this.browser.newContext({
            viewport: { width: 1280, height: 720 },
            recordVideo: { dir: './test-screenshots' }
        });
        this.page = await context.newPage();

        // Capture console errors
        this.page.on('console', msg => {
            if (msg.type() === 'error') {
                console.log(`[CONSOLE ERROR] ${msg.text()}`);
            }
        });

        this.page.on('pageerror', err => {
            console.log(`[PAGE ERROR] ${err.message}`);
        });

        console.log('🚀 Browser explorer initialized');
        return this;
    }

    async goto(path: string): Promise<ExplorationResult> {
        if (!this.page) throw new Error('Browser not initialized');

        const url = path.startsWith('http') ? path : `${BASE_URL}${path}`;
        const startTime = Date.now();
        const errors: string[] = [];

        // Track errors during navigation
        const errorHandler = (err: Error) => errors.push(err.message);
        this.page.on('pageerror', errorHandler);

        await this.page.goto(url, { waitUntil: 'networkidle' });
        const loadTime = Date.now() - startTime;

        this.page.off('pageerror', errorHandler);

        const title = await this.page.title();
        const elementCount = await this.page.evaluate(() => document.querySelectorAll('*').length);

        const result: ExplorationResult = {
            url,
            title,
            timestamp: new Date().toISOString(),
            findings: [],
            screenshots: [],
            errors,
            metrics: { loadTime, elementCount }
        };

        this.results.push(result);
        console.log(`📍 Navigated to: ${url} (${loadTime}ms, ${elementCount} elements)`);

        return result;
    }

    async screenshot(name: string): Promise<string> {
        if (!this.page) throw new Error('Browser not initialized');

        const filename = `./test-screenshots/${name}-${Date.now()}.png`;
        await this.page.screenshot({ path: filename, fullPage: true });
        console.log(`📸 Screenshot saved: ${filename}`);
        return filename;
    }

    async findElements(selector: string): Promise<{ count: number; texts: string[] }> {
        if (!this.page) throw new Error('Browser not initialized');

        const elements = await this.page.locator(selector).all();
        const texts = await Promise.all(elements.slice(0, 10).map(el => el.textContent()));

        console.log(`🔍 Found ${elements.length} elements matching "${selector}"`);
        return { count: elements.length, texts: texts.filter(Boolean) as string[] };
    }

    async click(selector: string): Promise<void> {
        if (!this.page) throw new Error('Browser not initialized');

        await this.page.locator(selector).first().click();
        console.log(`👆 Clicked: ${selector}`);
    }

    async type(selector: string, text: string): Promise<void> {
        if (!this.page) throw new Error('Browser not initialized');

        await this.page.locator(selector).first().fill(text);
        console.log(`⌨️ Typed "${text}" into ${selector}`);
    }

    async evaluate<T>(fn: () => T): Promise<T> {
        if (!this.page) throw new Error('Browser not initialized');
        return this.page.evaluate(fn);
    }

    async testCursorAlignment(): Promise<{ line: number; cursorTop: number; expectedTop: number; drift: number }[]> {
        if (!this.page) throw new Error('Browser not initialized');

        console.log('🧪 Testing cursor alignment...');

        // Navigate to a lesson with code editor
        await this.goto('/lessons/01_foundations/1.1_what_is_python');
        await this.page.waitForTimeout(2000);

        // Find and focus editor
        const textarea = this.page.locator('textarea.light-editor-input').first();
        if (await textarea.count() === 0) {
            console.log('❌ No editor found on page');
            return [];
        }

        await textarea.click();

        // Clear and type test content
        await textarea.fill('');
        const testLines = Array.from({ length: 15 }, (_, i) => `# Line ${i + 1}`).join('\n');
        await textarea.fill(testLines);

        // Measure cursor positions at different lines
        const results: { line: number; cursorTop: number; expectedTop: number; drift: number }[] = [];

        for (const line of [0, 4, 9, 14]) {
            // Move cursor to start of line
            await textarea.press('Control+Home'); // Go to start
            for (let i = 0; i < line; i++) {
                await textarea.press('ArrowDown');
            }

            await this.page.waitForTimeout(100);

            const cursor = this.page.locator('.light-editor-cursor').first();
            const cursorBox = await cursor.boundingBox();
            const visual = this.page.locator('.light-editor-visual').first();
            const visualBox = await visual.boundingBox();

            if (cursorBox && visualBox) {
                const cursorTop = cursorBox.y - visualBox.y;
                const lineHeight = await cursor.evaluate(el => parseFloat(getComputedStyle(el).height));
                const expectedTop = line * lineHeight;
                const drift = Math.abs(cursorTop - expectedTop);

                results.push({ line: line + 1, cursorTop, expectedTop, drift });
                console.log(`  Line ${line + 1}: cursor at ${cursorTop.toFixed(1)}px, expected ${expectedTop.toFixed(1)}px, drift: ${drift.toFixed(1)}px`);
            }
        }

        await this.screenshot('cursor-alignment-test');
        return results;
    }

    async stressTestEditor(iterations: number = 100): Promise<{ avgTime: number; errors: number }> {
        if (!this.page) throw new Error('Browser not initialized');

        console.log(`🔥 Stress testing editor with ${iterations} operations...`);

        await this.goto('/lessons/01_foundations/1.1_what_is_python');
        await this.page.waitForTimeout(2000);

        const textarea = this.page.locator('textarea.light-editor-input').first();
        if (await textarea.count() === 0) {
            console.log('❌ No editor found');
            return { avgTime: 0, errors: 1 };
        }

        await textarea.click();
        await textarea.fill('');

        const times: number[] = [];
        let errorCount = 0;

        for (let i = 0; i < iterations; i++) {
            try {
                const start = Date.now();
                await textarea.pressSequentially(`print("iteration ${i}")`, { delay: 5 });
                await textarea.press('Enter');
                times.push(Date.now() - start);
            } catch (err) {
                errorCount++;
            }

            if (i % 20 === 0) {
                console.log(`  Progress: ${i}/${iterations}`);
            }
        }

        const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
        console.log(`✅ Stress test complete: avg ${avgTime.toFixed(1)}ms per operation, ${errorCount} errors`);

        await this.screenshot('stress-test-result');
        return { avgTime, errors: errorCount };
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
            console.log('🔒 Browser closed');
        }
        return this.results;
    }
}

// Main execution
async function main() {
    const explorer = await new BrowserExplorer().init();

    try {
        // Example exploration - customize as needed
        await explorer.goto('/');
        await explorer.screenshot('homepage');

        // Find all navigation links
        const navLinks = await explorer.findElements('nav a');
        console.log('Navigation links:', navLinks.texts);

        // Test cursor alignment
        const cursorResults = await explorer.testCursorAlignment();

        // Check for any drift issues
        const maxDrift = Math.max(...cursorResults.map(r => r.drift));
        if (maxDrift > 5) {
            console.log(`⚠️ WARNING: Max cursor drift is ${maxDrift.toFixed(1)}px`);
        } else {
            console.log(`✅ Cursor alignment looks good (max drift: ${maxDrift.toFixed(1)}px)`);
        }

    } catch (err) {
        console.error('Error during exploration:', err);
    } finally {
        await explorer.close();
    }
}

// Export for use as module
export { BrowserExplorer };

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}
