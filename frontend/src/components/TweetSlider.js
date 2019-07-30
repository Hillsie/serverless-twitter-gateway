import React, { Component } from 'react'
import SliderHeader from './SliderHeader'
import TweetCard from './TweetCard'
import styled from 'styled-components'

const StyledBackGround = styled.div`
    background-image: linear-gradient(to right bottom, #0f75bc, #0098cb, #00b5af, #24ca76, #b7d43a);
    width: calc(100% - 60px);
    overflow: hidden;
    padding: 30px;
    min-height: 100vh;
    justify-content: center;
    .cardHeadline{
        font-weight: bold;
        margin-bottom: 10px;
        font-size: 13px;
        }
`;

const HeaderBlockStyle = styled.div`
    text-align: center;
    min-height: 10vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    font-size: calc(10px + 2vmin);
    color: white;
`;

const CardStyling = styled.div`
    justify-content: center;
    text-align: center;
`;
export default class TweetSlider extends Component {

    state = {
        collection: {},
        tweetbyid: {},
    }


    componentWillMount() {

        // Modify this to work with your API credentials and all xxxx for your implementation

        const APIEndPoint = 'https://xxxxxxx.execute-api.ap-southeast-xxxx.amazonaws.com/devs/getCuratedTweets';
        const APIKey = 'xxxxxxxYourAPIKeyxxxxxxxxxxx';
        fetch(APIEndPoint,
            {
                method: 'get',
                mode: 'cors',
                headers:
                {
                    'Content-Type': 'text/json',
                    'x-api-key': `${APIKey}`
                }
            })
            /* 
            // Read the Readme.md
            const Testdata = '../testdata/collectiondata.json';
            fetch(Testdata) */
            .then(result => result.json())
            .then(collectionData => this.setState(collectionData))
            .catch(error => console.error(error));
    }

    render() {
        return (
            <StyledBackGround>
                <HeaderBlockStyle>
                    <SliderHeader collectionData={this.state.collection} />
                </HeaderBlockStyle>
                <CardStyling >
                    {Object.keys(this.state.tweetbyid).map((key, value) => <TweetCard key={key} index={value} tweetDetails={this.state.tweetbyid[key]} />)}
                </CardStyling>
            </StyledBackGround >
        )
    }
}
