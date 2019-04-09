/* eslint-disable strict */
/* All examples for Lambada and Node v8.10.0 seem have 'use strict' */
/* MIT License

Copyright (c) 2018 iautomate.cloud Andrew Hills

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
SOFTWARE. */

'use strict';

const { getTweetCollection } = require('./get-tweet-collection');

module.exports.getCuratedTweets = async (event, context, callback) => {

  const headers = {
    'Content-Type': 'text/json',
    'Access-Control-Allow-Origin': '*', // Add the URL that can use this API. CORS is a frontend browser implementation.
    'Access-Control-Allow-Methods': 'GET',
    // X-Content-Type-Options: nosniff. based on this, https://www.keycdn.com/support/x-content-type-options doesn't seem necessary. 
    // What else do I need here?
  };
  let payload;
  try {
    // No need to check API keys. This is done by AWS.
    // At this point in the API Gateway lifecyle, Port, GET and HTTPS are always True. 
    // The negative test case (where all or any of these tests are false), code is never activated. AWS manages before this point.
    // Tests reveal that a postman call for OPTIONS 200 OK with unexpcted '', so cannot control an Options call in Lambda.
    if ((event.httpMethod.toUpperCase() === 'GET') && (event.headers['X-Forwarded-Port'] === '443') && (event.headers['X-Forwarded-Proto'].toLowerCase() === 'https')) {
      const collection = await getTweetCollection();
      payload = {
        statusCode: collection.statusCode,
        headers,
        body: JSON.stringify({
          collection: collection.collection,
          tweetbyid: collection.tweetbyid,
        })
      };
    } else {
      payload = { 'message': 'Missing Authentication token' };
    }
    callback(null, payload);
  } catch (e) {
    console.error(`Error handler.getCuratedTweets: ${e}`);
    payload = {
      statusCode: '404',
      headers,
      body: JSON.stringify({
        collection: { status: 404 },
        tweetbyid: null
      }),
    };
    // Don't want to pass a stack trace to the user. Not helpful and not a prefered security approach.
    callback(null, payload);
  }
};
