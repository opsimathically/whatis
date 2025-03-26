# whatis

Give it a value, it will try to tell you what that value is (within reason). Supports
plugins in case you want to define what is unknown, as what is, yourself.

## Install

```bash
npm install @opsimathically/whatis
```

## Building from source

This package is intended to be run via npm, but if you'd like to build from source,
clone this repo, enter directory, and run `npm install` for dev dependencies, then run
`npm run build`.

## Usage

[See API Reference for documentation](https://github.com/opsimathically/whatis/blob/main/docs/)

[See unit tests for more usage examples](https://github.com/opsimathically/whatis/blob/main/test/whatis.test.ts)

```typescript
import { whatis } from '@opsimathically/whatis';

(async function () {
  // check arbitrary URL
  const url_whatis = whatis(
    new URL('https://example.com:8080/path/name?foo=bar#section')
  );
  /*
  // Returns: url_whatis
  {
      codes: { url: true, object: true },
      types: { object: true },
      matched: [
        {
          code: 'url',
          type: 'object',
          description: 'URL object',
          metadata: {
            href: 'https://example.com:8080/path/name?foo=bar#section',
            origin: 'https://example.com:8080',
            pathname: '/path/name'
          }
        },
        {
          code: 'object',
          type: 'object',
          description: 'plain or serializable object',
          metadata: { constructor_name: 'URL', json_serializable: true }
        }
      ]
    };
  */

  // check arbitrary object
  const some_object_whatis = whatis({ hello: there });
  /*
  Returns: some_object_whatis
    {
      codes: { object: true },
      types: { object: true },
      matched: [
        {
          code: 'object',
          type: 'object',
          description: 'plain or serializable object',
          metadata: { constructor_name: 'Object', json_serializable: true }
        }
      ]
    };
  */
})();
```

### Possible Default Types/Codes List

These variables are exported and can be used where necessary.

```typescript
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
```
