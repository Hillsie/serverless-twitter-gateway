/* eslint-disable strict */

/* 
Outside Data is dirty, even if it comes from Twitter.
This contains a collection of helper functions to validate and "clean" "dirty" data.
Unable to find anything specific Node and Serverless.

Cherry Picked Collection of sanitizers and validators applicable to this serverless API
Rather stand on the collective shoulders of giants. Many of these have been sourced from
https://github.com/chriso/validator.js which has many contributors. Thanks to them all.

Lots of reading at
https://github.com/OWASP/CheatSheetSeries

 If you see modifictions applicable to this Serverless API. Please raise a pull request and contribute your knowledge.

 All the Node 8.10.0 examples have 'use Strict'

*/

/*
Copyright (c) 2018 Chris O'Hara <cohara87@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/



/*

MIT License

Copyright (c) 2019 iautomate.cloud  Hills  <hills+twittercollectiongateway@iautomate.cloud>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/


function checkinput(input) {
  /*   
  Know of one case outside boundary
  modified from: https://github.com/chriso/validator.js
  under MIT License, see above
  */

  'use strict';

  let output = input;

  try {
    if (checkinput.length !== 1) {
      throw new Error('More than one argument');
    } else if (typeof input === 'object' && input !== null) {
      if (typeof input.checkinput === 'function') {
        output = input.checkinput(); // make sure it's nothing. Comes from source. Not sure of the implementers original logic here.
        throw new Error('Input not a String ');
      } else {
        throw new Error('Input not a String');
      }
    } else if (
      input === null ||
      typeof input === 'undefined' ||
      (Number.isNaN(input) && !input.length)
    ) {
      throw new Error('Input not a String');
    }
    return String(output);
  } catch (e) {
    // Log it in AWS CloudWatch
    console.error(
      `${new Error(`sanitizenvalidate.js - Expected string input`)} : ${e}`,
    );
    output = '[object Object]';
    return output;
  }
}

function redact(str) {

  'use strict';

  let output = str;

  const redactThese = {
    javaScript: /(<script\b[^>]*>([\s\S]*?)<\/script>)/gim,
    // TODO : .css and .wasm ????
  };
  Object.freeze(redactThese);
  // eslint-disable-next-line no-unused-vars
  Object.entries(redactThese).forEach(([key, val]) => {
    output = str.replace(val, '');
  });
  return output;
}

function escapeHTML(str) {
  'use strict';

  const output = redact(checkinput(str));

  return output
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/`/g, '&#96;')
    .replace(/\\/g, '&#x5C;')
    .replace(/\n/g, ' ');
}

function checkURLPermit(checkMyPermit) {
  // Only permitted allowable urls into the API

  'use strict';

  const urlDenied = '';
  let validatedPermit = checkMyPermit;

  try {
    validatedPermit = checkinput(checkMyPermit);
    const urlsWithPermits = {
      twimg: 'https://pbs.twimg.com/',
      twitter: 'https://twitter.com/',
      t: 'https://t.co/',
      help: 'https://help.twitter.com/',
      iautomate: 'https://iautomate.cloud',
    };
    Object.freeze(urlsWithPermits);
    if (validatedPermit !== '[object Object]') {
      // eslint-disable-next-line no-restricted-syntax
      for (const index in urlsWithPermits) {
        if (validatedPermit.startsWith(urlsWithPermits[index])) {
          break;
        } else {
          validatedPermit = urlDenied; // url not valid;
        }
      }
    } else {
      validatedPermit = urlDenied;
    }
    return validatedPermit;
  } catch (e) {
    console.error(
      `sanitizevalidate.js CheckURLPermit Exception: ${String(
        checkMyPermit,
      )} warning: ${e} `,
    );
    return urlDenied;
  }
}

module.exports.escapeHTML = escapeHTML;
module.exports.checkinput = checkinput;
module.exports.checkURLPermit = checkURLPermit;
