## Color Composer
An interactive installation for the [Nelson-Atkins Museum of Art](http://nelson-atkins.org/).

### Installation
* `npm install`

### Config
Add a `.env` file with the following vars:
```
PORT=''
DB_URI=''
S3_KEY=''
S3_SECRET=''
S3_BUCKET=''
TWILIO_NUMBER=''
TWILIO_SID=''
TWILIO_TOKEN=''
ROOT_URL=''
SECRET_KEY=''
MAILGUN_DOMAIN=''
MAILGUN_SENDER=''
MAILGUN_KEY=''
```

### Routes
* POST `/process`: receives video and audio blobs, recorded from the client, then merges and resizes and converts them to a single video file with FFMPEG before texting user's number with link to composition detail
* GET `/composition`: renders the composition detail link with embedded video and social media share buttons
* POST `/composition/new`: saves composition information to DB
* POST `/composition/send-email`: emails composition link and video file to user specified in query params
* POST `/text-message`: handles request to send email to user specified via text (this endpoint is used by Twilio webhooks)
* GET `/`: application

### Run
* Prod: `npm start`
* Dev: `npm run dev`

### Shape Sounds
Each shape (line, circle, triangle, square, other) needs a sound file for each of the 6 'color groups' (black, blue, red, orange, brown, orange, green). Howler expects an audio sprite with them in that order, configured via a json file. To generate the audiosprites, use [audiosprite](https://github.com/tonistiigi/audiosprite). I had some issues installing ffmpeg with the correct codecs using brew on my Mac which I resolved by installing the problematic codecs manually.
The command to do that might be something like:
`audiosprite black.mp3 blue.mp3 red.mp3 orange.mp3 brown.mp3 green.mp3 -o circle --format howler`.
