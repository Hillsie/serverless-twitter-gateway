# Status
The slider part isn't complete. Cards have been created and styling is in progress as I have time. The slider code is in progress.

# Front End Twitter Slider
The front-end Web Slider displays the tweets as a horizontal card.  The slider uses the REST API built from the backend part of this project.
![Screen shot of Twitter Cards](/TweetCards.png)

# Front End Technology
Built using HTML, CSS, Styled Components, JavaScript and ReactJS.
There is some CSS not in styled components. This may have to do for now. 

# Front End Configuration
1. Setup the backend to have a working slider or use the test code for to evaluate the code
2. For a functional slider, uncomment and modify  `TweetSlider.js` adding the APIEndPoint and APIKey variables with the values obtained during the backend deployment. Comment out or delete the test code:

`/*  const Testdata = '../testdata/collectiondata.json';
             fetch(Testdata) */`

3. Intall the node packages and then `yarn start`