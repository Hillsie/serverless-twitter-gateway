import React, { Component } from 'react'
import styled from 'styled-components'

const StylingHeader = styled.div`
    font: 700 24px 'Open Sans', sans-serif;
    .cardsectionheading{
        font: 16px 'Open Sans', sans-serif;
    }
`;

export default class SliderHeader extends Component {

    render() {
        return (
            <StylingHeader >
                <div id="allcardsBelow">Recent Tweets</div>
                <div id="cardsectionheading">{this.props.collectionData.description}</div>
            </StylingHeader>
        )
    }
}
