import React from 'react';
import { StylingCard, TweetCardStyle, TwitterIcon } from './TweetCardCSS.js';

class TweetCard extends React.Component {
    render() {
        let { tweetDetails } = this.props;
        let cardImage = null, cardHeadline = null, cardLead = null, cardsource = null;

        if ((tweetDetails.media.statusCode === 200) || (tweetDetails.media.statusCode === 201)) {
            // don't want to render the card media if status is not family 200
            // probably could tidy up and put in one line in JSX with ternary operator
            cardImage = <img className="card_img" src={tweetDetails.media.card_image} alt="twitter card" />;
            cardHeadline = <div className="cardHeadline">{tweetDetails.media.headline}</div>;
            cardLead = <div className="cardLead">{tweetDetails.media.lead}</div>;
            cardsource = <div className="card_source">{tweetDetails.media.source}</div>;
        }
        return (
            <TweetCardStyle>
                <StylingCard>
                    <a className="card_block" target="_blank" rel="noreferrer noopener" href={tweetDetails.card_url}>
                        <img className="profile_photo" src={tweetDetails.profile_image_url_https} alt={tweetDetails.name} />
                        <div className="twitter_name"><b>{tweetDetails.name}</b></div>
                        <div className="twitter_handle"><small>@{tweetDetails.screen_name}</small></div>
                        <TwitterIcon className="twitter_icon" size="35" />
                        <div className="tweet_full_txt">{tweetDetails.full_text}</div>
                        <div className="tweet_like"><span>{tweetDetails.favorite_count}</span> <span>{tweetDetails.retweet_count}</span></div>
                        <div className="tweet_date"><small>{tweetDetails.created_at}</small></div>
                        {cardImage}
                        {cardHeadline}
                        {cardLead}
                        {cardsource}
                    </a>
                </StylingCard>
            </TweetCardStyle>
        )
    }
}
export default TweetCard;