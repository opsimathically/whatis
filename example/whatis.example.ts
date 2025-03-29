/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  whatis,
  whatis_matches_t,
  add_match_set_func_t,
  whatis_plugin_t
} from '@src/whatis';
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
  type some_whatever_type_t = { some_extra_data: string };

  const plugin: whatis_plugin_t<some_whatever_type_t> = function (params: {
    value: any;
    matchset: whatis_matches_t;
    addToMatchSet: add_match_set_func_t;
    extra?: some_whatever_type_t;
  }) {
    // gather, set type of, and use, extra data if relevant
    if (params.extra) {
      if (params.extra.some_extra_data !== 'hi!') return;
    }

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
  const some_object_whatis = whatis({ hello: 'there' }, [plugin], {
    some_extra_data: 'hi!'
  });

  // the custom code from the plugin will be set
  assert(some_object_whatis.codes.hello_there_object);

  console.log(
    "Example finished!  Look at whatis.example.ts to see what's going on."
  );
})();
