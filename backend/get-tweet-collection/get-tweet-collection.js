/* eslint-disable no-console */
/* eslint-disable no-restricted-syntax */
/* eslint-disable strict */
/* eslint-disable guard-for-in */


/* Notes on above exclusions
Strict for node v8.10.0
Using 'in' for this code
Console.error reports errors in AWS CloudWatch logs

/*
  Important!
    This code is intended to be used on the backend.The twitterCredentials should not be shared on a frontend. 
    Do not assume any of the JSON from Twitter is clean on the front end. Sanitize any data before using it.
    Consider the Lambda TimeOut as your trip switch if the Twitter API takes too long.
    The code acts as a proxy to the twitter collection with some additionals. Code in is only from the twitter API.
    Curate the collection in tweetdeck.twitter.com. Add the collection UUID in the configuration setup. 
    See the README.md for more configuration .
*/

'use strict';

const { OAuth } = require('oauth');
const { getCardDetails } = require('./get-card-details');
const { escapeHTML } = require('./sanitizenvalidate/sanitizenvalidate');

// TODO function to decrypt secrets dynamically
const twitterCredentials = {
  clientID: process.env.ConsumerAPIKey,
  clientSecret: process.env.APISecretKey,
  OAuthAccessToken: process.env.OAuthAccessToken,
  oAuthAccessTokenSecret: process.env.OAuthTokenSecret,
  twitterCollectionUUID: process.env.twitterCollectionUUID,
  callbackURL: null,
};

const OAuthTwitter = new OAuth(
  'https://api.twitter.com/oauth/request_token',
  'https://api.twitter.com/oauth/access_token',
  twitterCredentials.clientID,
  twitterCredentials.clientSecret,
  '1.0A',
  twitterCredentials.callbackURL,
  'HMAC-SHA1',
);

function getTwitterData() {
  return new Promise((resolve, reject) => {
    OAuthTwitter.get(
      twitterCredentials.twitterCollectionUUID,
      twitterCredentials.OAuthAccessToken,
      twitterCredentials.oAuthAccessTokenSecret,
      async (error, data) => {
        if (!error) {
          return resolve(JSON.parse(data));
        }
        console.error(new Error(`Credentials error`));
        return reject(error);

      },
    );
  });
}

function getCardMedia(data, tweeterid) {
  let cardMedia = {};
  let lookuplater = '';
  /* TODO Add Twitter Variants.
    Variants hold information about different media formats such as animated gifs;
  */
  if (data.objects.tweets[tweeterid].extended_entities) {
    if (data.objects.tweets[tweeterid].extended_entities.media) {
      // The TODO data.objects.tweets[tweeterid].extended_entities.media.video_info.variants.url
      for (const newindex in data.objects.tweets[tweeterid].extended_entities
        .media)
        cardMedia = {
          statusCode: 200,
          card_image:
            data.objects.tweets[tweeterid].extended_entities.media[newindex]
              .media_url_https,
          /* The TODO media_type: data.objects.tweets[tweeterid].extended_entities.media[newindex].type, */
        };
    }
  } else if (data.objects.tweets[tweeterid].entities) {
    if (data.objects.tweets[tweeterid].entities.urls.length > 0) {
      lookuplater = tweeterid;
    }
  }
  return [cardMedia, lookuplater];
}

function getUserDetails(data, tweeterid) {
  let tweeterUserDetails = {};
  for (const newindex in data.objects.users) {
    if (tweeterid === data.objects.users[newindex].id) {
      tweeterUserDetails = {
        user_id: escapeHTML(data.objects.users[newindex].id),
        name: escapeHTML(data.objects.users[newindex].name),
        screen_name: escapeHTML(data.objects.users[newindex].screen_name),
        profile_image_url_https:
          data.objects.users[newindex].profile_image_url_https,
      };
      break;
    }
  }
  return tweeterUserDetails;
}

function compileTweetHeader(data) {
  return {
    collection_url: `${
      data.objects.timelines[`${data.response.timeline_id}`].collection_url
      }`,
    description: `${
      data.objects.timelines[`${data.response.timeline_id}`].description
      }`,
    twitter_privacy: `https://help.twitter.com/en/twitter-for-websites-ads-info-and-privacy`,
    created_hills: `https://iautomate.cloud`,
  };
}

async function tweetDetails(data) {
  const tweetbyid = {};
  const collection = compileTweetHeader(data);
  const lookmeup = [];

  for (const index in data.objects.tweets) {
    const userid = getUserDetails(data, data.objects.tweets[index].user.id);
    const cardMediaResult = getCardMedia(
      data,
      data.objects.tweets[index].id_str,
    );
    /* lookuplater ? lookmeup.push(lookuplater) : null;  // alternative to line below 
    Below line of code so can use async nature of JS and not do await. Await is too slow. Big O.
    Turns this into horrid syncronous code that way. This halts the whole program until the lookup
    is complete.
    */
    // eslint-disable-next-line no-unused-expressions
    cardMediaResult[1] && lookmeup.push(cardMediaResult[1]);

    tweetbyid[index] = {
      name: escapeHTML(userid.name),
      screen_name: escapeHTML(userid.screen_name),
      profile_image_url_https: userid.profile_image_url_https,
      full_text: escapeHTML(data.objects.tweets[index].full_text),
      favorite_count: data.objects.tweets[index].favorite_count,
      retweet_count: data.objects.tweets[index].retweet_count,
      created_at: data.objects.tweets[index].created_at,
      media: cardMediaResult[0],
      card_url: `https://twitter.com/${userid.screen_name}/status/${
        data.objects.tweets[index].id_str
        }`,
    };
  }

  // AWS lambda timeout should terminate if the code below if it takes forever
  return Promise.all(
    lookmeup.map(async lookup => getCardDetails(lookup)),
  ).then(cards => {
    // Disabled eslint because Oject.entries returns array with 2 elements
    // eslint-disable-next-line no-unused-vars 
    for (const [key, val] of Object.entries(cards)) {
      tweetbyid[Object.keys(val)[0]].media = val[Object.keys(val)[0]];
    }
    return { statusCode: 200, collection, tweetbyid };
  });
}
async function getTweetCollection() {
  return new Promise(async (resolve, reject) => {
    getTwitterData()
      .then(data => resolve(tweetDetails(data)))
      .catch(e => {
        console.error(new Error(`get-Tweet-Collection-error: ${JSON.stringify(e)}`));
        // eslint-disable-next-line prefer-promise-reject-errors
        return reject({ status: 404 }); // Exception to eslint rule bacause the API should pass back info to the implementor.
      });
  });
}

module.exports.getTweetCollection = getTweetCollection;
