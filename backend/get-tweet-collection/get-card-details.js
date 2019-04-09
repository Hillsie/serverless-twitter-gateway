/* eslint-disable consistent-return */
/* eslint-disable strict */

/* MIT License

Copyright (c) 2019 iautomate.cloud Hills <hills+serverless-twitter-gateway@iautomate.cloud>

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

/* 
Unfortunately, this data is not provided by the Twitter API. See  Twitter communication in the README.md
To have an authentic looking Twitter Card, this information is required.
Be good internet citizens. Don't abuse it. Only hit the edge location so twitter can manage load.
Other considerations:
0. Do not pin any tweets you don't trust. Like tweets with code or a string of weird characters in them.
1. When the twitter edge cache is not warm this code may return nothing.
2. Sanitization. https://threatpost.com/tweetdeck-taken-down-in-wake-of-xss-attacks/106597/
3. Penetration Testing
*/



'use strict';


const https = require('https');
const { escapeHTML, checkURLPermit } = require('./sanitizenvalidate/sanitizenvalidate');

function validate(cardNumber) {
  let typeStatus = null;
  if (Number.isNaN(cardNumber) || !(typeof cardNumber === 'string')) {
    typeStatus = {
      statusCode: 406,
      expected: { type: 'string', numeric: 'true' },
      received: {
        type: `${typeof cardNumber}`,
        numeric: `${!Number.isNaN(cardNumber)}`,
      },
    };
  }
  const validated = { typeStatus, cardNumber };
  return validated;
}

function compilePayload(cardNumber, errStatus, cardObject) {
  return {
    [cardNumber]: {
      statusCode: errStatus.statusCode,
      headline: cardObject.headline,
      lead: cardObject.lead,
      source: cardObject.source,
      card_image: checkURLPermit(cardObject.card_image),
    },
  };
}

async function scrapTweetDetails(typeStatus, cardNumber) {
  const cardResult = new Promise(resolve => {
    // don't give this secret url away. Took some research to find it. This project has taken way way more than expected.
    const url = `https://twitter.com/i/cards/tfw/v1/${cardNumber}?cardname=summary_large_image&autoplay_disabled=true&earned=true&edge=true`;
    const cardObject = {};
    let errStatus = {};

    if (typeStatus === null) {
      https.get(url, res => {
        const { statusCode } = res;
        const contentType = res.headers['content-type'];

        // validate status code
        if (statusCode !== 200) {
          errStatus = {
            statusCode,
            expected: 200,
            received: 'nada',
            tweetid: cardNumber,
          };
          console.error(JSON.stringify(errStatus));
          return resolve(compilePayload(cardNumber, errStatus, cardObject));
        } if (!/^text\/html/.test(contentType)) {
          // validate content type
          errStatus = {
            statusCode: 412,
            expected: 'text/html;charset=utf-8',
            received: 'Bad Content type',
          };
          console.error(JSON.stringify(errStatus));
          return resolve(compilePayload(cardNumber, errStatus, cardObject));
        }
        res.setEncoding('utf8');
        let body = '';
        res.on('data', data => { (body += escapeHTML(data)) },
          res.on('end', () => {
            const h2 = /&lt;[H][123].+?&gt;/gi;
            const h2C = /&lt;\/[H][123]&gt;/gi;

            const p = /&lt;[P].+?&gt;/gi;
            const pc = /&lt;\/[P]&gt;/gi;

            const span = /&lt;[SPAN]{4}.+?&gt;/gi;
            const spanc = /&lt;\/[SPAN]{4}&gt;/gi;

            const urlS = 'background-image: url(';
            const urlE = '); background-size: cover;';

            const cardMatch = [
              {
                name: 'headline',
                length: body.search(h2) + body.match(h2)[0].length,
                endPos: body.search(h2C),
              },
              {
                name: 'lead',
                length: body.search(p) + body.match(p)[0].length,
                endPos: body.search(pc),
              },
              {
                name: 'source',
                length: body.search(span) + body.match(span)[0].length,
                endPos: body.search(spanc),
              },
              {
                name: 'card_image',
                length: body.indexOf(urlS) + urlS.length,
                endPos: body.indexOf(urlE),
              },
            ];
            errStatus = { statusCode: 201, tweetid: cardNumber };
            cardMatch.map(cardItem => {
              cardObject[cardItem.name] = body.substring(cardItem.length, cardItem.endPos);
              return cardObject[cardItem.name];
            });
            return resolve(compilePayload(cardNumber, errStatus, cardObject));

          })
        );


      });
    } else {
      return resolve(compilePayload(cardNumber, errStatus, cardObject));
    }
  });
  return cardResult;
}

async function getCardDetails(cardNumber) {
  return new Promise(async (resolve, reject) => {
    const result = validate(cardNumber);
    if (result.typeStatus !== null) {
      return reject(result.typeStatus);
    }
    const cardData = await scrapTweetDetails(
      result.typeStatus,
      result.cardNumber,
    );
    return resolve(cardData);

  });
}

module.exports.getCardDetails = getCardDetails;
