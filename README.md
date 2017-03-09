 〰️ 🔵 🔺 🔶

## Installation
* `npm install`

## Config
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

## Run
* Prod: `npm start`
* Dev: `npm run dev`

## Shape Sounds
Each shape (line, circle, triangle, square, other) needs a sound file for each of the 6 'color groups' (black, blue, red, orange, brown, orange, green). Howler expects an audio sprite with them in that order, configured via a json file. To generate the audiosprites, use [audiosprite](https://github.com/tonistiigi/audiosprite). I had some issues installing ffmpeg with the correct codecs using brew on my Mac which I resolved by installing the problematic codecs manually.
The command to do that might be something like:
`audiosprite black.mp3 blue.mp3 red.mp3 orange.mp3 brown.mp3 green.mp3 -o circle --format howler`.

![Rose with Gray](/public/img/rose-with-gray.jpg?raw=true "Rose with Gray")
