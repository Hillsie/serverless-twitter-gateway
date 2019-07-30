import styled from 'styled-components'
import { Twitter } from 'styled-icons/boxicons-logos/Twitter';

export const StylingCard = styled.div`
    display:flex;
    font-size: 16px;
    font-stretch:100%;
    font-weight:400;
    line-height:22.4px;
    font: normal normal 16px/1.4 Helvetica,Roboto,"Segoe UI",Calibri,sans-serif;
    color: #1c2022;
    padding: 10px;
    text-align:left;
    -webkit-tap-highlight-color:rgba(0, 0, 0, 0);
    
    
`;

export const TweetCardStyle = styled.div`
  background: white;
  margin: 10px 5px;
  padding: 0 19px 16px 16px;
  border-radius: 10px;
  transition:  0.6s cubic-bezier(0.075, 0.82, 0.165, 1);
  display:inline-block;
  max-width: 268px;
 
 
  :hover {
    -moz-box-shadow:    10px 10px 5px 0px #1d1d1da6;
    -webkit-box-shadow: 10px 10px 5px 0px #1d1d1da6;
    box-shadow:         10px 10px 5px 0px #1d1d1da6;
    transition:  0.6s cubic-bezier(0.075, 0.82, 0.165, 1);
    transform: scale(1.05);
  }
  .profile_photo{
        float: left;
        border-radius: 50%;
        margin-right: 10px;
        width: 40px;
        border: 2px solid rgba(182, 181, 181, 0.76);;
    }

    .twitter_name{
        line-height: 1;
        padding-top: 3px;
    }

    .twitter_handle{
        display: inline-block;
        color: #777777;
    }
    .card_img{
        width: 100%;
        margin-bottom: 10px;
        margin-top: 5px;
        border-radius: 10px;
    }

    .card_block, .card_block:hover, .card_block:focus, .card_block:visited{
        text-decoration: none;
        display: block;
        color: black;
    }

    .tweet_full_txt{
        padding-top: 10px;
        padding-bottom: 15px;
        font-size: 14px;
        color: #2a2e35;
    }

    .tweet_like span{
        font-size: 12px;
        margin-right: 20px;
    }
    .tweet_date{
        color: #444444;
        font-size: 14px;
        padding-top: 3px;
    }
    .card_source{
        font-size: 13px;
        color: #aaa;
    }
    .cardLead{
        font-size: 12px;
        color: #555;
        margin-bottom: 5px;
    }
    .tweet_like{
        display: flex;
        align-items: center;
    }
`

export const TwitterIcon = styled(Twitter)`
    color:#1DA1F2;
    background-color:"transparent";
    }
`