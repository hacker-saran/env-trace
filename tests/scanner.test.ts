import { describe, it, expect, vi } from 'vitest';
import { scanFileForEnvs } from '../src/scanner.js';
import fs from 'fs';

vi.mock('fs');

describe('scanFileForEnvs', () => {
    it('detects basic process.env.KEY', async () => {
        const code = 'console.log(process.env.DB_URL)';
        vi.mocked(fs.readFileSync).mockReturnValue(code);

        const result = await scanFileForEnvs('test.ts');
        expect(result).toContain('DB_URL');
    });

    it('detects square bracket access', async () => {
        const code = "console.log(process.env['API_KEY'])";
        vi.mocked(fs.readFileSync).mockReturnValue(code);

        const result = await scanFileForEnvs('test.ts');
        expect(result).toContain('API_KEY');
    });

    it('detects destructuring from process.env', async () => {
        const code = 'const { PORT, NODE_ENV } = process.env';
        vi.mocked(fs.readFileSync).mockReturnValue(code);

        const result = await scanFileForEnvs('test.ts');
        expect(result).toContain('PORT');
        expect(result).toContain('NODE_ENV');
    });

    it('detects assignment destructuring', async () => {
        const code = '({ STRIPE_KEY } = process.env)';
        vi.mocked(fs.readFileSync).mockReturnValue(code);

        const result = await scanFileForEnvs('test.ts');
        expect(result).toContain('STRIPE_KEY');
    });
});
