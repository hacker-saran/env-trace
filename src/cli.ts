#!/usr/bin/env node
import { Command } from 'commander';
import { glob } from 'glob';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import boxen from 'boxen';
import inquirer from 'inquirer';
import { scanFileForEnvs } from './scanner.js';
import { auditEnvs, syncTemplate } from './auditor.js';

const program = new Command();

program
  .name('env-guardian')
  .description('🛡️  Audit and sync environment variables with style')
  .version('1.1.0')
  .option('-e, --env <path>', 'Path to your local .env file', '.env')
  .option('-t, --template <path>', 'Path to your template file', '.env.example')
  .option('-i, --include <glob>', 'Files to scan', 'src/**/*.{js,ts,jsx,tsx}')
  .option('-s, --sync', 'Automatically add missing keys to the template file', false)
  .action(async (options) => {
    console.log(
      boxen(chalk.bold.cyan('🛡️  ENV GUARDIAN'), {
        padding: 1,
        margin: 1,
        borderStyle: 'double',
        borderColor: 'cyan',
        title: 'v1.1.0',
        titleAlignment: 'right',
      })
    );

    const spinner = ora(chalk.blue('Scanning codebase for secrets...')).start();

    // 1. Discovery Phase
    const files = await glob(options.include);
    const allUsedVars = new Set<string>();

    for (const file of files) {
      const vars = await scanFileForEnvs(file);
      vars.forEach(v => allUsedVars.add(v));
    }

    // 2. Audit Phase
    const envPath = path.resolve(process.cwd(), options.env);
    const results = auditEnvs(Array.from(allUsedVars), envPath);
    spinner.stop();

    // 3. Reporting
    if (results.missing.length > 0) {
      console.log(chalk.bold.red(`\n❌ DRIFT DETECTED: Missing in ${options.env}`));
      results.missing.forEach(v => console.log(chalk.red(`   → ${v}`)));

      let shouldSync = options.sync;

      if (!shouldSync && process.stdin.isTTY) {
        console.log('');
        const answers = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'sync',
            message: chalk.yellow(`Would you like to sync these missing keys to ${options.template}?`),
            default: true,
          },
        ]);
        shouldSync = answers.sync;
      }

      if (shouldSync) {
        const templatePath = path.resolve(process.cwd(), options.template);
        syncTemplate(results.missing, templatePath);
        console.log(chalk.green(`\n✨ Successfully updated ${options.template}`));
      } else if (!options.sync) {
        console.log(chalk.dim(`\n💡 Tip: Use --sync or follow the interactive prompt to keep your template updated.`));
      }

      // Exit with error for CI/CD even if synced, because .env is still incomplete
      if (!process.stdin.isTTY || !shouldSync) {
        process.exit(1);
      }
    } else {
      console.log(chalk.bold.green('\n✅ HARMONY: Code and .env are in sync!'));
    }

    if (results.unused.length > 0) {
      console.log(chalk.bold.yellow('\n⚠️  UNUSED VARIABLES (Potential Bloat):'));
      results.unused.forEach(v => console.log(chalk.yellow(`   - ${v}`)));
    }

    console.log(
      chalk.dim(
        `\n${chalk.blue('Stats:')} ${files.length} files scanned | ${allUsedVars.size} variables found\n`
      )
    );

    // Final exit code based on project health
    if (results.missing.length > 0) {
      process.exit(1);
    }
  });

program.parse();