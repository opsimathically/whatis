/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Socket } from 'net';
import { ReadStream, WriteStream } from 'fs';
import { ChildProcess } from 'child_process';
import { Worker } from 'worker_threads';
import { EventEmitter } from 'events';
import { URL, URLSearchParams } from 'url';
const AsyncFunction = (async () => {}).constructor;
const GeneratorFunction = function* () {}.constructor;
const AsyncGeneratorFunction = async function* () {}.constructor;

type whatis_matches_t = {
  codes: any;
  types: any;
  metadata?: any;
  matched: type_code_info_t[];
};

type type_code_info_t = {
  code: string;
  type: string;
  description: string;
  metadata?: Record<string, unknown>;
};

// we don't acutally use these lists in whatis(), this is just for devs to be able
// to reference in their own code.
const whatis_code_list: string[] = [
  'null',
  'undefined',
  'string',
  'number',
  'boolean',
  'symbol',
  'bigint',
  'async_generator_function',
  'generator_function',
  'async_function',
  'function',
  'array',
  'map',
  'set',
  'weakmap',
  'weakset',
  'date',
  'regexp',
  'buffer',
  'array_buffer',
  'shared_array_buffer',
  'data_view',
  'typed_array',
  'promise',
  'error',
  'socket',
  'read_stream',
  'write_stream',
  'child_process',
  'worker_thread',
  'event_emitter',
  'global_process_object',
  'abort_controller',
  'abort_signal',
  'url',
  'url_search_params',
  'atomics',
  'reflect',
  'intl_object',
  'object',
  'unknown'
];
const whatis_type_list: string[] = [
  'undefined',
  'string',
  'number',
  'boolean',
  'symbol',
  'bigint',
  'function',
  'object'
];

/**
 * simply adds a match to the match set
 */
function addToMatchSet(match_set: any, match_info: type_code_info_t) {
  if (!match_set.codes[match_info.code])
    match_set.codes[match_info.code] = true;
  if (!match_set.types[match_info.type])
    match_set.types[match_info.type] = true;

  if (!match_set.metadata) match_set.metadata = {};

  if (match_info.metadata)
    Object.assign(match_set.metadata, match_info.metadata);
  match_set.matched.push(match_info);
}

type whatis_plugin_t = (params: {
  value: any;
  matchset: whatis_matches_t;
  addToMatchSet: (match_set: any, match_info: type_code_info_t) => void;
}) => any;

/**
 * what is param?  Lets try to find out
 */

function whatis(param: unknown, plugins?: whatis_plugin_t[]): whatis_matches_t {
  const whatis_matches = {
    codes: {},
    types: {},
    matched: []
  };

  const type = typeof param;

  if (param === null) {
    addToMatchSet(whatis_matches, {
      code: 'null',
      type: type,
      description: 'null value'
    });
    return whatis_matches;
  }
  if (param === undefined) {
    addToMatchSet(whatis_matches, {
      code: 'undefined',
      type: type,
      description: 'undefined value'
    });
    return whatis_matches;
  }

  switch (type) {
    case 'string':
      addToMatchSet(whatis_matches, {
        code: 'string',
        type: type,
        description: 'string primitive',
        metadata: { length: (param as string).length }
      });
      break;

    case 'number':
      addToMatchSet(whatis_matches, {
        code: 'number',
        type: type,
        description: 'number primitive',
        metadata: {
          is_nan: isNaN(param as number),
          is_finite: isFinite(param as number)
        }
      });
      break;

    case 'boolean':
      addToMatchSet(whatis_matches, {
        code: 'boolean',
        type: type,
        description: 'boolean primitive'
      });
      break;

    case 'symbol':
      addToMatchSet(whatis_matches, {
        code: 'symbol',
        type: type,
        description: 'symbol primitive'
      });
      break;

    case 'bigint':
      addToMatchSet(whatis_matches, {
        code: 'bigint',
        type: type,
        description: 'bigint primitive'
      });
      break;

    case 'function':
      if (param instanceof AsyncGeneratorFunction) {
        addToMatchSet(whatis_matches, {
          code: 'async_generator_function',
          type: type,
          description: 'asynchronous generator function'
        });
      } else if (param instanceof GeneratorFunction) {
        addToMatchSet(whatis_matches, {
          code: 'generator_function',
          type: type,
          description: 'generator function'
        });
      } else if (param instanceof AsyncFunction) {
        addToMatchSet(whatis_matches, {
          code: 'async_function',
          type: type,
          description: 'asynchronous function'
        });
      } else {
        addToMatchSet(whatis_matches, {
          code: 'function',
          type: type,
          description: 'synchronous function'
        });
      }
      break;

    case 'object':
      {
        // --- Core JS types ---
        if (Array.isArray(param)) {
          addToMatchSet(whatis_matches, {
            code: 'array',
            type: type,
            description: 'array',
            metadata: { length: param.length }
          });
        }

        if (param instanceof Map) {
          addToMatchSet(whatis_matches, {
            code: 'map',
            type: type,
            description: 'map object',
            metadata: { size: param.size }
          });
        }

        if (param instanceof Set) {
          addToMatchSet(whatis_matches, {
            code: 'set',
            type: type,
            description: 'set object',
            metadata: { size: param.size }
          });
        }

        if (param instanceof WeakMap) {
          addToMatchSet(whatis_matches, {
            code: 'weakmap',
            type: type,
            description: 'weakmap object'
          });
        }

        if (param instanceof WeakSet) {
          addToMatchSet(whatis_matches, {
            code: 'weakset',
            type: type,
            description: 'weakset object'
          });
        }

        if (param instanceof Date) {
          addToMatchSet(whatis_matches, {
            code: 'date',
            type: type,
            description: 'date object',
            metadata: {
              iso_string: param.toISOString(),
              timestamp: param.getTime()
            }
          });
        }

        if (param instanceof RegExp) {
          addToMatchSet(whatis_matches, {
            code: 'regexp',
            type: type,
            description: 'regular expression',
            metadata: { pattern: param.source, flags: param.flags }
          });
        }

        if (Buffer.isBuffer(param)) {
          addToMatchSet(whatis_matches, {
            code: 'buffer',
            type: type,
            description: 'node.js buffer',
            metadata: { length: param.length }
          });
        }

        if (param instanceof ArrayBuffer) {
          addToMatchSet(whatis_matches, {
            code: 'array_buffer',
            type: type,
            description: 'array buffer',
            metadata: { byte_length: param.byteLength }
          });
        }

        if (param instanceof SharedArrayBuffer) {
          addToMatchSet(whatis_matches, {
            code: 'shared_array_buffer',
            type: type,
            description: 'shared array buffer',
            metadata: { byte_length: param.byteLength }
          });
        }

        if (param instanceof DataView) {
          addToMatchSet(whatis_matches, {
            code: 'data_view',
            type: type,
            description: 'data view',
            metadata: {
              byte_length: param.byteLength,
              byte_offset: param.byteOffset
            }
          });
        }

        if (ArrayBuffer.isView(param)) {
          const constructor_name = (param as any).constructor?.name;
          addToMatchSet(whatis_matches, {
            code: 'typed_array',
            type: type,
            description: 'typed array',
            metadata: {
              type: constructor_name,
              length: (param as any).length,
              byte_length: (param as any).byteLength
            }
          });
        }

        if (param instanceof Promise) {
          addToMatchSet(whatis_matches, {
            code: 'promise',
            type: type,
            description: 'promise object'
          });
        }

        if (param instanceof Error) {
          addToMatchSet(whatis_matches, {
            code: 'error',
            type: type,
            description: 'error object',
            metadata: {
              name: param.name,
              message: param.message,
              stack: param.stack
            }
          });
        }

        // --- Node.js core types ---
        if (param instanceof Socket) {
          addToMatchSet(whatis_matches, {
            code: 'socket',
            type: type,
            description: 'net.Socket',
            metadata: {
              remote_address: param.remoteAddress,
              remote_port: param.remotePort,
              local_address: param.localAddress,
              local_port: param.localPort
            }
          });
        }

        if (param instanceof ReadStream) {
          addToMatchSet(whatis_matches, {
            code: 'read_stream',
            type: type,
            description: 'ReadStream',
            metadata: { path: param.path?.toString() }
          });
        }

        if (param instanceof WriteStream) {
          addToMatchSet(whatis_matches, {
            code: 'write_stream',
            type: type,
            description: 'WriteStream',
            metadata: { path: param.path?.toString() }
          });
        }

        if (param instanceof ChildProcess) {
          addToMatchSet(whatis_matches, {
            code: 'child_process',
            type: type,
            description: 'child process',
            metadata: {
              pid: param.pid,
              connected: param.connected,
              exit_code: param.exitCode
            }
          });
        }

        if (param instanceof Worker) {
          addToMatchSet(whatis_matches, {
            code: 'worker_thread',
            type: type,
            description: 'worker thread',
            metadata: { thread_id: param.threadId }
          });
        }

        if (param instanceof EventEmitter) {
          addToMatchSet(whatis_matches, {
            code: 'event_emitter',
            type: type,
            description: 'event emitter',
            metadata: { event_names: param.eventNames() }
          });
        }

        if (param === process) {
          addToMatchSet(whatis_matches, {
            code: 'global_process_object',
            type: type,
            description: 'node.js process object',
            metadata: {
              pid: process.pid,
              platform: process.platform,
              arch: process.arch,
              uptime: process.uptime()
            }
          });
        }

        // --- Modern ES features ---
        if (param instanceof AbortController) {
          addToMatchSet(whatis_matches, {
            code: 'abort_controller',
            type: type,
            description: 'AbortController instance'
          });
        }

        if (param instanceof AbortSignal) {
          addToMatchSet(whatis_matches, {
            code: 'abort_signal',
            type: type,
            description: 'AbortSignal instance'
          });
        }

        if (param instanceof URL) {
          addToMatchSet(whatis_matches, {
            code: 'url',
            type: type,
            description: 'URL object',
            metadata: {
              href: param.href,
              origin: param.origin,
              pathname: param.pathname
            }
          });
        }

        if (param instanceof URLSearchParams) {
          addToMatchSet(whatis_matches, {
            code: 'url_search_params',
            type: type,
            description: 'URLSearchParams object',
            metadata: Object.fromEntries(param.entries())
          });
        }

        if (param === Atomics) {
          addToMatchSet(whatis_matches, {
            code: 'atomics',
            type: type,
            description: 'Atomics namespace'
          });
        }

        if (param === Reflect) {
          addToMatchSet(whatis_matches, {
            code: 'reflect',
            type: type,
            description: 'Reflect namespace'
          });
        }

        if (
          param instanceof Intl.Collator ||
          param instanceof Intl.NumberFormat ||
          param instanceof Intl.DateTimeFormat
        ) {
          addToMatchSet(whatis_matches, {
            code: 'intl_object',
            type: type,
            description: 'Intl.* formatter object',
            metadata: { constructor: param.constructor.name }
          });
        }

        // Check for JSON-serializability
        try {
          JSON.stringify(param);
          addToMatchSet(whatis_matches, {
            code: 'object',
            type: type,
            description: 'plain or serializable object',
            metadata: {
              constructor_name: (param as object).constructor?.name,
              json_serializable: true
            }
          });
        } catch {
          addToMatchSet(whatis_matches, {
            code: 'object',
            type: type,
            description: 'non-serializable object',
            metadata: {
              constructor_name: (param as object).constructor?.name,
              json_serializable: false
            }
          });
        }
      }
      break;

    default:
      addToMatchSet(whatis_matches, {
        code: 'unknown',
        type: type,
        description: 'unrecognized type'
      });
      break;
  }

  // run plugins if we have any
  if (plugins) {
    for (let idx = 0; idx < plugins.length; idx++) {
      plugins[idx]({
        value: param,
        matchset: whatis_matches,
        addToMatchSet: addToMatchSet
      });
    }
  }

  // return the matches
  return whatis_matches;
}

export {
  whatis,
  type_code_info_t,
  whatis_matches_t,
  whatis_plugin_t,
  whatis_code_list,
  whatis_type_list
};
