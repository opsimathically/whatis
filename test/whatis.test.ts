/* eslint-disable no-debugger */
/* eslint-disable @typescript-eslint/no-explicit-any */
import test from 'node:test';
import assert from 'node:assert';
import * as net from 'net';
import * as fs from 'fs';
import path from 'node:path';
import { Worker } from 'worker_threads';
import { spawn } from 'child_process';
import EventEmitter from 'node:events';

import util from 'node:util';
import { whatis } from '@src/whatis';
import { whatis_matches_t } from '@src/whatis';

(async function () {
  test('whatis null', async function () {
    assert(whatis(null).codes.null);
  });

  test('whatis undefined', async function () {
    assert(whatis(undefined).codes.undefined);
  });

  test('whatis string primitive', async function () {
    assert(whatis('abc').codes.string);
  });

  test('whatis number primitive', async function () {
    assert(whatis(1234).codes.number);
  });

  test('whatis boolean primitive', async function () {
    assert(whatis(true).codes.boolean);
    assert(whatis(false).codes.boolean);
  });

  test('whatis symbol primitive', async function () {
    assert(whatis(Symbol('test')).codes.symbol);
  });

  test('whatis bigint primitive', async function () {
    assert(whatis(1234567890123456789012345678901234567890n).codes.bigint);
  });

  test('whatis generator function', async function () {
    assert(whatis(function* () {}).codes.generator_function);
  });

  test('whatis async generator function', async function () {
    assert(whatis(async function* () {}).codes.async_generator_function);
  });

  test('whatis async function', async function () {
    assert(whatis(async () => {}).codes.async_function);
  });

  test('whatis synchronous function', async function () {
    assert(whatis(() => {}).codes.function);
  });

  test('whatis array', async function () {
    assert(whatis([1, 2, 3, 4]).codes.array);
  });

  test('whatis map', async function () {
    assert(whatis(new Map()).codes.map);
  });

  test('whatis set', async function () {
    assert(whatis(new Set()).codes.set);
  });

  test('whatis weakmap', async function () {
    assert(whatis(new WeakMap()).codes.weakmap);
  });

  test('whatis weakset', async function () {
    assert(whatis(new WeakSet()).codes.weakset);
  });

  test('whatis date', async function () {
    assert(whatis(new Date()).codes.date);
  });

  test('whatis regexp', async function () {
    assert(whatis(/test/).codes.regexp);
  });

  test('whatis buffer', async function () {
    assert(whatis(Buffer.from('abcd')).codes.buffer);
  });

  test('whatis array buffer', async function () {
    assert(whatis(new ArrayBuffer(16)).codes.array_buffer);
  });

  test('whatis shared array buffer', async function () {
    assert(whatis(new SharedArrayBuffer(16)).codes.shared_array_buffer);
  });

  test('whatis data view', async function () {
    const buffer = new ArrayBuffer(8);
    const view = new DataView(buffer);
    assert(whatis(view).codes.data_view);
  });

  test('whatis typed array', async function () {
    assert(whatis(new Uint8Array(4)).codes.typed_array);
    assert(whatis(new BigUint64Array(4)).codes.typed_array);
  });

  test('whatis promise', async function () {
    assert(whatis(new Promise(function () {})).codes.promise);
  });

  test('whatis error', async function () {
    assert(whatis(new Error('hello')).codes.error);
  });

  test('whatis socket', async function () {
    await (async function () {
      const server = net.createServer((socket) => {
        assert(whatis(socket).codes.socket);
        socket.on('data', (data) => {
          socket.write('Echo: ' + data);
        });
        socket.on('end', () => {});
      });
      await new Promise(function (resolve) {
        server.listen(58616, () => {
          resolve(true);
        });
      });
      await new Promise(function (resolve) {
        const client = net.createConnection({ port: 58616 }, () => {
          client.write('Hello server!');
        });
        client.on('data', () => {
          client.end();
          server.close();
          resolve(true);
        });
      });
    })();
  });

  test('whatis fs read/write streams', async function () {
    const fsread = fs.createReadStream(
      path.join(__dirname, 'fsstreams/read.txt')
    );
    const fswrite = fs.createWriteStream(
      path.join(__dirname, 'fsstreams/write.txt')
    );
    assert(whatis(fsread).codes.read_stream);
    assert(whatis(fswrite).codes.write_stream);
  });

  test('whatis child_process', async function () {
    assert(whatis(spawn('ls', ['-la'])).codes.child_process);
  });

  test('whatis worker_thread', async function () {
    const new_worker = new Worker(
      path.join(__dirname, 'worker_thread', 'worker.js')
    );
    assert(whatis(new_worker).codes.worker_thread);
    new_worker.terminate();
  });

  test('whatis event emitter', async function () {
    assert(whatis(new EventEmitter()).codes.event_emitter);
  });

  test('whatis global_process_object', async function () {
    assert(whatis(process).codes.global_process_object);
  });

  test('whatis an abort controller', async function () {
    assert(whatis(new AbortController()).codes.abort_controller);
  });

  test('whatis abort_signal', async function () {
    assert(whatis(new AbortController().signal).codes.abort_signal);
  });

  test('whatis url', async function () {
    console.log(
      util.inspect(whatis({ hello: 'blah' }), {
        depth: null
      })
    );
    assert(
      whatis(new URL('https://example.com:8080/path/name?foo=bar#section'))
        .codes.url
    );
  });

  test('whatis url search params', async function () {
    assert(
      whatis(
        new URL('https://example.com:8080/path/name?foo=bar#section')
          .searchParams
      ).codes.url_search_params
    );
  });

  test('whatis atomics', async function () {
    assert(whatis(Atomics).codes.atomics);
  });

  test('whatis reflect', async function () {
    assert(whatis(Reflect).codes.reflect);
  });

  test('whatis intl object', async function () {
    assert(
      whatis(
        new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        })
      ).codes.intl_object
    );
  });

  test('Test whatis extensible plugins.', async function () {
    const test_obj = {
      moo: 'cow',
      drink: 'milk'
    };

    const plugin = function (params: {
      value: any;
      matchset: whatis_matches_t;
      addToMatchSet: any;
    }) {
      if (!params.matchset.codes.object) return;
      params.addToMatchSet(params.matchset, {
        code: 'moo_cow_object',
        type: 'object',
        description: 'MOOOO!!!'
      });
    };

    const this_plugin_does_not_trigger = function (params: {
      value: any;
      matchset: whatis_matches_t;
      addToMatchSet: any;
    }) {
      if (params.matchset.codes.object) return;
      params.addToMatchSet(params.matchset, {
        code: 'drink_milk_object',
        type: 'object',
        description: 'Should not ever get here.'
      });
    };

    // run with plugins
    const whatis_with_plugin_custom_code_result = whatis(test_obj, [
      plugin,
      this_plugin_does_not_trigger
    ]);

    // check custom codes
    assert(whatis_with_plugin_custom_code_result.codes.moo_cow_object);
    assert(
      whatis_with_plugin_custom_code_result.codes.drink_milk_object !== true
    );
  });
})();
