# whatis

Give it a value, it will try to tell you what that value is (within reason). Supports
plugins in case you want to define what is unknown, as what is, yourself. In the match
results the 'type' refers to what was returned via typeof. The 'code' value is one that
we define ourselves (url, async_generator_function, etc, etc). The full list of 'code'
values can be found below.

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
import { whatis, whatis_matches_t } from '@opsimathically/whatis';
import assert from 'node:assert';
(async function () {
  // check arbitrary URL
  whatis(new URL('https://example.com:8080/path/name?foo=bar#section'));
  /*
  // Returns: 
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
  whatis({ hello: 'there' });
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

  // a plugin is just a function that lets you examine values and add them
  // to the current match set.  A match set is just the current types/codes
  // which have matched to the object.  Plugins run after all default match
  // tests have completed at the end of whatis().
  const plugin = function (params: {
    value: any;
    matchset: whatis_matches_t;
    addToMatchSet: any;
  }) {
    if (!params.matchset.codes.object) return;
    if (params.value?.hello === 'there')
      params.addToMatchSet(params.matchset, {
        code: 'hello_there_object',
        type: 'object',
        description: 'Hi!'
      });
  };

  // Run whatis on an object, using the plugin defined above.  You can have multiple plugins
  // within the plugin array and they'll all run one after the other linerally.
  const some_object_whatis = whatis({ hello: 'there' }, [plugin]);

  // the custom code from the plugin will be set
  assert(some_object_whatis.codes.hello_there_object);
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
