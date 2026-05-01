import {readFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const PKG_VERSION = (JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf8')) as {version: string}).version;
