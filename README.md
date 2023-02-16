# Node Serverless Twitter Gateway

### This Serverless JSON Rest API simplifies the curation of tweets on a website. Using TweetDeck, a website owner can dynamically control a collection of tweets that are pinned to a website, without the need for hardcoding tweets or the use of the Twitter Widget


- Tweets can be dynamically pinned to a website
- Full control of what appears on the website via Tweetdeck
- The tweet Collection is curated in [Tweetdeck](https://tweetdeck.twitter.com/)
- A Developer can hand off the management of Tweets to someone else
- This API also pulls in card_images, which is not supplied by the Twitter API
- Website user privacy, as data is not tracked. AWS provides a buffer. However, with modifications, some metadata can be tracked
- This API saves time going through the Twitter API reference and dealing with Twitters Widget issues
- Reduces complexity and coding effort, as the JSON is sorted logically and interpreted directly on the frontend
- Happiness. It should make your marketing team happy and you happy. They do tweets, you do other things

## Environment

JavaScript ES6, NodeJS, AWS API Gateway, Serverless Framework and AWS Lambda Functions. This is an AWS Rest API Gateway Serverless implementation. To modify for Google Cloud and Azure, modify `handler.js`

## Front End
The Front End has been built as a seperate project with reactjs. Open up the project and run from within the `frontend` folder
[More info read the Front End MD](/frontend/README.md)

![Screen shot of Twitter Cards](/frontend/TweetCards.png)

## Serverless Back End

Each serverless function is kept in a collection of supporting code in the form of a module. As each module in serverless is a different Lambda Function. Each module should be deployed. `sls deploy` takes care of the entire module deployment. Configuration is required before you deploy. [__API Configuration and deployment__](#API-Configuration-and-deployment).

## About this API

- When tested locally the Node part ran in under 2 seconds. This took some additional refactoring to obtain speed. Currently, Postman reports the execution round time between 1328 milliseconds and 568 milliseconds, for 11 tweets, when the Lambda function is warm. The code zipped is 47.49 KB. Minification might get an even smaller code base. Sadly, I need to include validation and sanitization of twitter data, so this number is bound to increase, only a little I hope. (Report back: API is still around these numbers)
- As mentioned, Tweets are curated via a Twitter Collection, in Tweetdeck and the output is JSON. No more need for hard coding tweets or implement widgets.
- Not all twitter data is forwarded, however it’s easy to modify should you require additional data. 
- To help with implementation, I plan to include sample front-end code ... standby.

## Why use this over the Twitter Widget or Twitter API?

- **Customisation** - The reason this all started. We needed a horizontal card slider. With the Twitter widget, there is limited control over how the tweet appears on a site. I was unable to find a way to add tweet cards to a horizontal slider. The timeline behaviour appears only as a vertical list in the Twitter Widget. It is a good idea to abide by the twitter style guide and be familiar with the twitter API terms of use. It’s not your data. Respect that. Twitter has the right to [terminate your API usage](https://techcrunch.com/2019/01/31/dont-buy-twitter-followers/). 

- **Widget injection** - When you use the Twitter widget, provided by Twitter,  it injects code in the form of an Iframe on a website. The code base is quite large making several calls to fetch additional tweets. Not all data is relevant when displaying a tweet.

- **CORS / CORB** - The Twitter widget behaviour is irregular. The Widget runs as JavaScript on the front end, rendering tweets as cards in an Iframe and this does not work with certain VPN providers. 
>For security reasons, browsers usually restrict cross-origin HTTP requests initiated from within scripts. [More at Mozilla.org](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) 

> CORB (Cross Origin Read Blocking). [More at developers.google.com](https://developers.google.com/web/updates/2018/07/site-isolation). Without Site Isolation, the contents of the JSON file would make it to the memory of the renderer process, at which point the renderer notices that it’s not a valid image format and doesn’t render an image. But, the attacker could then exploit a vulnerability like Spectre to potentially read that chunk of memory.

- **Twitter Credentials** - While doing research to meet a clients need, I could only get Twitter’s API working with oAuth1.a. Coding oAuth1.a credentials directly on a website, is not advisable.  This would expose your twitter security credentials on the front-end. Additionally, storing credentials in a DMZ is not advisable. Sometimes this happens with WordPress when the credentials are stored in a MySQL database. With this Serverless API, credentials are stored backend. Additionally, security can be applied by encrypting and storing details in AWS parameter store. Code not included.

- **Viewer Privacy** - Unless you send viewers back to Twitter, no metadata is collected in this version of the API. Read the Twitter privacy policy for details on their treatement of data.

- **Implement CORB** - The developer has direct control of CORB.(CORB - Cross Origin Read Blocking, CORS - Cross Origin Resource Sharing). Modify the handler.js payload.headers.'Access-Control-Allow-Origin': to restrict the API to your domain. CORB is not full proof. It's only front end behaviour.

## Prerequisites

- AWS CLI installed and configured with keys. [More info on AWS Access Keys](https://serverless.com/framework/docs/providers/aws/guide/credentials#creating-aws-access-keys)
- [Serverless Framework Installed](https://serverless.com/)
- NodeJS and NPM - Node v8.10.0 ( An AWS version requirement). 💡 Suggest using NVM to manage multiple Node versions.
- In the terminal, `npm install` in the root folder to initialze the development environment
- `cd backend/get-tweet-collection` and `nvm use v8.10.0`
- `npm install`

## API Configuration and deployment

There are two main areas of configuration.

### Twitter Setup Step 1

1. Create a Twitter account and login to tweetdeck https://tweetdeck.twitter.com/
2. Create a collection in Tweetdeck. (Add column -> Collection). Click share and embedded collection number. Only the number is required. This is added to the configuration, later. For testing purposes, add a few tweets to the collection.
3. Create a Twitter developer account at https://developer.twitter.com/ and apply for Twitter API access in step 1 below. Twitter requires you to apply to gain Twitter API access. Note their conditions of use.
4.  Create a Twitter "App" found under a dropdown on the right upper left dropdown. It's  essentially  creating your own Twitter API access. Recall, it’s not advisable to use these details on a publicly facing website.
  * Give it a name
  * Call back https://localhost. In this use case, the callback is not necessary, but add localhost anyway.
  * Safely store the Keys and Tokens (x4) (`API Key, API Secret Key, Access Token and Access Token Secret`).
5. Permissions. Set the App permissions to read-only. No need for publish permissions in this API. This API does not provide publish functionality.

### Deploying this API Step 2
1. Create an AWS account with limited access. Suggest you only use keys and limit what they can do.
Configure your AWS cli with limited access. 
2. [Configure the serverless framework](https://serverless.com/framework/docs/providers/aws/guide/quick-start/)
With the AWS cli, perform the parameter store steps below in the [__More on Encrypting Twitter Secrets__](#more-on-encrypting-twitter-secrets). Customise the command with the details you saved earlier in the twitter configuration. Include your collection UUID, the number you obtained from TweetDeck.
3. Clone or download this Repo. Change to /backend/get-tweet-collection.
4. Customise the `serverless.yml` file to meet your configuration needs.
Deploy the code with `sls deploy` via the terminal from /backend/get-tweet-collection. All the reset is taken care of by the Serverless framework YML. Note the API key and invocation url.
5. Test the API with Postman. Add your API key as x-api-key:value as a header. Test with a low usage plan and access without an API key. Should stop working when usage numbers are exceeded and not work without an API Key. Check CORS fails if you implemented it. [See Postman setup for AWS here.](https://docs.aws.amazon.com/apigateway/latest/developerguide/how-to-use-postman-to-call-api.html)

## Public Use Warning

This API is designed for public use.  API Keys, CORS and Rate limiting API abuse. Test to see that it has been applied. API Keys and rate Limiting have been included in serverless.yml. CORS can be customised in the `handler.js`. See the comments. There is also the option of adding a custom authorizer in API Gateway.
 

## AWS Authorisation Authorization

💡 The following can be done to thwart malicious use of a public API

1. Resource policies
2. CORS
3. Lambda custom authorizers
4. Client Side SSL Certificates
5. Usage Plans
6. API Keys


## The Twitter API performs traffic throttling

💡 To reduce traffic to this API and avoid down stream Twitter API throttling, the following could be done :

- Implement front end caching. front-end caching and only call the API when the TTL has expired.
- Implement backend caching. Logic to cache or store tweets has not been implemented on the backend with this code.



### More on Encrypting Twitter Secrets

To protect Twitter API Keys from prying eyes, encrypt and store them in AWS parameter store. Although I have mentioned it, code not included. AWS Systems Manager Parameter Store provides secure, hierarchical storage for configuration data management and secrets management. You can store data such as passwords, database strings, and license codes as parameter values. This should be encrypted and then decrypted at runtime for use in twitter collections API Gateway.

Below are some AWS CLI commands to help with configuring this API. As mentioned, decryption not performed during operation. See the lambda after deployment. Customise these commands with your specific details before use.

1. Setup KMS Key. `aws kms create-key --description kms-tweeter-lock --region ap-southeast-2 `. Store safely.
2. Setup Environment Parameters
1. `aws ssm put-parameter --name /twittergateway/ConsumerAPIKey --value "Your_API_Key_From_Twitter_Earlier" --type SecureString --key-id "AddYourKeyIdFromStep1" --region ap-southeast-2`
2. `aws ssm put-parameter --name /twittergateway/APISecretKey --value "Your_Secret_API_Key_From_Twitter_Earlier" --type SecureString --key-id "AddYourKeyIdFromStep1" --region ap-southeast-2`
3. `aws ssm put-parameter --name /twittergateway/OAuthAccessToken --value "Your_OAuth_AccessToken_from_Twitter_Earlier" --type SecureString --key-id "AddYourKeyIdFromStep1" --region ap-southeast-2`
4. `aws ssm put-parameter --name /twittergateway/OAuthTokenSecret --value "Your_OAuth_Secret_from_Twitter_Earlier" --type SecureString --key-id "AddYourKeyIdFromStep1" --region ap-southeast-2`
5. `aws ssm put-parameter --name /twittergateway/twitterAPIURL --value "api.twitter.com/1.1/collections/entries.json?id=custom-xxxxxxxxxxxxxxxxxxx&tweet_mode=extended" --type SecureString --key-id "AddYourKeyIdFromStep1" --region ap-southeast-2`
Where custom-xxxxxxxxxxxxxxxxxxx is the unique id of your collection created in TweetDeck. See above section [Twitter Setup](#twitter-setup-step-1).

## Twitter's Response to Card Images 😢 🤫 😉

Card Images are not supplied by Twitter. Have found a way to pull in Card_Images 🤫
![twitter forum](/NoTwitterCard.png)

## TODOS

~~1. front-end sample code~~
2. front-end caching of tweets to reduce API calls
3. BackEnd logic and caching of Tweets to reduce twitter api calls

## Contributing

Contributions Welcome. Use the "fork-and-pull" Git workflow.

# License

Please reference this source with any repo forks.

[mit-license](/LICENSE)
