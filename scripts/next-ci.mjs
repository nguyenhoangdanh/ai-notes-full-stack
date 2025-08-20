#!/usr/bin/env node
import { spawn } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';

const cmd = process.argv[2] || 'build';
const passArgs = process.argv.slice(3);

// 1) Hard-disable all telemetry / notifiers during any Next command
const env = {
    ...process.env,
    NEXT_TELEMETRY_DISABLED: '1',
    NO_UPDATE_NOTIFIER: '1',
    ADBLOCK: '1',
    DISABLE_OPENCOLLECTIVE: '1',
    CI: process.env.CI || '1',
    npm_config_update_notifier: 'false',
};

// 2) Resolve local next binary
const binName = process.platform === 'win32' ? 'next.cmd' : 'next';
const nextBin = path.resolve(process.cwd(), 'node_modules', '.bin', binName);

// 3) Run Next with the selected subcommand (build | lint | dev | start)
const child = spawn(nextBin, [cmd, ...passArgs], {
    stdio: 'inherit',
    env,
    shell: false,
});

child.on('close', (code) => {
    process.exit(code ?? 1);
});
child.on('error', (err) => {
    console.error(err);
    process.exit(1);
});