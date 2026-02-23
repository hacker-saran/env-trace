import fs from 'fs';
import dotenv from 'dotenv';

export interface AuditResult {
    missing: string[];
    unused: string[];
    existing: string[];
}

export function auditEnvs(codeVars: string[], envFilePath: string): AuditResult {
    const envContent = fs.existsSync(envFilePath)
        ? fs.readFileSync(envFilePath, 'utf-8')
        : '';
    const parsedEnv = dotenv.parse(envContent);
    const envKeys = Object.keys(parsedEnv);

    return {
        missing: codeVars.filter(v => !envKeys.includes(v)),
        unused: envKeys.filter(v => !codeVars.includes(v)),
        existing: envKeys.filter(v => codeVars.includes(v))
    };
}

/**
 * Syncs missing variables to a template file (e.g., .env.example)
 */
export function syncTemplate(missingVars: string[], templatePath: string) {
    if (missingVars.length === 0) return;

    let content = fs.existsSync(templatePath)
        ? fs.readFileSync(templatePath, 'utf-8')
        : '# Environment Variables Template\n';

    // Ensure there's a newline at the end
    if (content && !content.endsWith('\n')) content += '\n';

    missingVars.forEach(v => {
        if (!content.includes(`${v}=`)) {
            content += `${v}=\n`;
        }
    });

    fs.writeFileSync(templatePath, content, 'utf-8');
}