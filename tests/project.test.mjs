import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {APP_VERSION} from '../core.mjs';

const file = path => readFileSync(new URL(path,import.meta.url),'utf8');

test('App, service worker and package share release version',()=>{
  const pkg=JSON.parse(file('../package.json'));
  assert.equal(pkg.version,APP_VERSION);
  assert.match(file('../sw.js'),new RegExp(`mesa-shell-${APP_VERSION.replaceAll('.','\\.')}`));
  assert.match(file('../index.html'),new RegExp(`v?${APP_VERSION.replaceAll('.','\\.')}`));
});

test('Optic forms are registered for submit processing',()=>{
  const app=file('../app.mjs');
  assert.match(app,/\['job-form','stock-form','point-form','splice-form','optic-form'\]\.includes\(event\.target\.id\)/);
  assert.match(app,/else if\(form\.id==='optic-form'\)/);
});

test('GitHub Pages deploy must run tests before publishing',()=>{
  const workflow=file('../.github/workflows/pages.yml');
  assert.ok(workflow.indexOf('run: npm test')>-1);
  assert.ok(workflow.indexOf('run: npm test')<workflow.indexOf('uses: actions/deploy-pages@'));
});
