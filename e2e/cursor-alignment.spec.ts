import { test, expect } from '@playwright/test'

test.describe('LightEditor Cursor Alignment', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to a lesson with a code editor
        await page.goto('/lessons/01_foundations/1.1_what_is_python')
        // Wait for the page to fully load
        await page.waitForLoadState('networkidle')
    })

    test('cursor aligns correctly on first line', async ({ page }) => {
        // Find the code editor textarea
        const textarea = page.locator('textarea.light-editor-input').first()
        await expect(textarea).toBeVisible()

        // Click at the start of the editor
        await textarea.click()
        await textarea.fill('')
        await textarea.type('hello')

        // Get cursor element
        const cursor = page.locator('.light-editor-cursor').first()
        await expect(cursor).toBeVisible()

        // Verify cursor has inline pixel styles (not ch/lh units)
        const style = await cursor.getAttribute('style')
        expect(style).toContain('px')
        expect(style).not.toContain('ch')
        expect(style).not.toContain('lh')

        // Take screenshot for visual verification
        await page.screenshot({ path: 'e2e/screenshots/cursor-line-1.png' })
    })

    test('cursor does not drift on later lines', async ({ page }) => {
        const textarea = page.locator('textarea.light-editor-input').first()
        await expect(textarea).toBeVisible()

        // Clear and type multiple lines
        await textarea.click()
        await textarea.fill('')
        await textarea.type('line 1\nline 2\nline 3\nline 4\nline 5\nline 6\nline 7\nline 8\nline 9\nline 10')

        // Get cursor position on line 10
        const cursor = page.locator('.light-editor-cursor').first()
        const cursorBox = await cursor.boundingBox()
        expect(cursorBox).toBeTruthy()

        // Get the text content position to compare
        const textLine = page.locator('.light-editor-visual').first()
        const textBox = await textLine.boundingBox()
        expect(textBox).toBeTruthy()

        // Cursor should be within reasonable bounds of the editor
        // (This verifies no major drift)
        if (cursorBox && textBox) {
            const cursorRelativeTop = cursorBox.y - textBox.y
            // Line 10 (0-indexed as 9) should be at approximately 9 * lineHeight
            // With lineHeight ~24.5px, line 10 should be around 220px
            expect(cursorRelativeTop).toBeGreaterThan(200)
            expect(cursorRelativeTop).toBeLessThan(250)
        }

        // Take screenshot for visual verification
        await page.screenshot({ path: 'e2e/screenshots/cursor-line-10.png' })
    })

    test('cursor height matches line height from font metrics', async ({ page }) => {
        const textarea = page.locator('textarea.light-editor-input').first()
        await expect(textarea).toBeVisible()
        await textarea.click()

        const cursor = page.locator('.light-editor-cursor').first()
        await expect(cursor).toBeVisible()

        // Verify cursor height is set via inline style (from font metrics)
        const style = await cursor.getAttribute('style')
        expect(style).toMatch(/height:\s*[\d.]+px/)

        // Get computed height
        const height = await cursor.evaluate(el => {
            return parseFloat(getComputedStyle(el).height)
        })

        // Height should be approximately the line height (24-25px)
        expect(height).toBeGreaterThan(20)
        expect(height).toBeLessThan(30)
    })
})
