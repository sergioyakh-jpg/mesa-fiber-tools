import test from 'node:test';
import assert from 'node:assert/strict';
import {locationOfFiber,fiberTable,matchSplice,safeCSV,normalizeCoordinates} from '../core.mjs';
test('TIA-598 order and tube progress',()=>{
 const f1=locationOfFiber(1); assert.equal(f1.tube,1);assert.equal(f1.color.name,'Blu');
 const f12=locationOfFiber(12);assert.equal(f12.color.name,'Acquamarina');assert.equal(f12.tube,1);
 const f13=locationOfFiber(13);assert.equal(f13.tube,2);assert.equal(f13.tubeColor.name,'Arancio');assert.equal(f13.color.name,'Blu');
 const f36=locationOfFiber(36,36);assert.equal(f36.tube,1);assert.equal(f36.cycle,3);
});
test('fiber count and invalid entries',()=>{
 assert.equal(fiberTable(24,12).length,24);
 assert.throws(()=>locationOfFiber(0));assert.throws(()=>fiberTable(0));assert.throws(()=>locationOfFiber(5,0));
});
test('splicing has correct progressive correspondence',()=>{
 const rows=matchSplice(11,45,4,0,12); assert.equal(rows[0].input.fiber,11);assert.equal(rows[3].output.fiber,48);
});
test('coordinates validation',()=>{assert.deepEqual(normalizeCoordinates('44.65','10.93'),{lat:44.65,lon:10.93});assert.throws(()=>normalizeCoordinates('','10'));assert.throws(()=>normalizeCoordinates('95',10));});
test('CSV escapes dangerous spreadsheet formulas',()=>{const csv=safeCSV([{v:'=HYPERLINK("url")'},{v:'Normal'}],[{key:'v',label:'Data'}]);assert.ok(csv.includes("'=HYPERLINK"));assert.ok(csv.includes('Normal'));});
