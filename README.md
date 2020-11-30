## Requirements

- Homebrew
  - In terminal run: `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`
- Node.js
  - In terminal run: `brew install node`
- ngrok
  - In terminal run:  `brew cask install ngrok`

## Setup

1. Install Project Dependencies
    - In terminal, in `slack-funs` directory, run: `npm install`

## Development

1. Setup Environment Variables
   1. Create `.env` File In Root Directory With Contents:

```bash
SLACK_BOT_TOKEN=   # Bot User OAuth Access token found on OAuth & Permissions page
SLACK_SIGNING_SECRET=  # Slack Signing Secret found on Basic Information page
BETTERCLOUD_TOKEN=     # BetterCloud API token created in BetterCloud APIs
```
2. Start Application
    - In terminal, in `slack-funs` directory, run: `npm run start`

3. Expose Our Local Server Externally For Slack API
    - In separate terminal window, `ngrok http 3000`

![image](https://user-images.githubusercontent.com/19396883/100467471-7d4c8700-30a0-11eb-8497-c3a7a797ae2d.png)

4. Update Event Subscriptions Request URL with URL From ngrok

This allows our application to respond to Slack events.

_NOTE: be sure to append `/slack/events` to the end of our URL._

![image](https://user-images.githubusercontent.com/19396883/100467910-580c4880-30a1-11eb-9e3c-67f07169db8b.png)


1. Update Interactivity Request URL with URL From ngrok

This allows our application to respond to Slack actions (button clicks, etc.).

_NOTE: be sure to append `/slack/events` to the end of our URL._

![image](https://user-images.githubusercontent.com/19396883/100467811-26937d00-30a1-11eb-957d-459c725cd85e.png)
