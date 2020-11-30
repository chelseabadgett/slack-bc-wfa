require('dotenv').config();

const { App } = require('@slack/bolt');
const axios = require('axios');

axios.defaults.baseURL = 'https://api.bettercloud.com/api/v1/';
axios.defaults.headers['Authorization'] = process.env.BETTERCLOUD_TOKEN;

const app = new App({
  token: process.env.SLACK_BOT_TOKEN, /** Bot User OAuth Access Token */
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

function username(username1) {
  // eslint-disable-line no-shadow
  return async ({ message, next }) => {
      if (message.username === username1) {
          // TODO: remove the non-null assertion operator
          await next();
      }
  };
}

app.message(username('incoming-webhook'), async ({ message, say }) => {
  const userId = message.text.match(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi)[0];
  console.log(message);
  
  if (message.text.match(/^offboard\s+\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b$/gi)){
    await say({
      "blocks": [
        {
          "type": "header",
          "text": {
            "type": "plain_text",
            "text": "Execute Offboard Workflow",
            "emoji": true
          }
        },
        {
          "type": "section",
          "fields": [
            {
              "type": "mrkdwn",
              "text": `*It appears you're trying to trigger an offboarding for user*: \n${userId}`,
            }
          ]
        },
        {
          "type": "section",
          "fields": [
            {
              "type": "mrkdwn",
              "text": `Please select an offboarding type to trigger:`,
            },
          ]
        },
        {
          "type": "actions",
          "elements": [
            {
              "type": "button",
              "text": {
                "type": "plain_text",
                "emoji": true,
                "text": "Full Offboard"
              },
              "style": "primary",
              "action_id": "trigger_full_offboard"
            },
            {
              "type": "button",
              "text": {
                "type": "plain_text",
                "emoji": true,
                "text": "Furlough Offboard"
              },
              "action_id": "trigger_furlough_offboard"
            }
          ]
        }
      ]
    });

  }

});

app.action('trigger_full_offboard', async (slackArgs) => {
  const workflowId = '6970e4fe-8015-4429-976c-743dad6fe77e';
  const workflowName = 'Full Offboard';
  await triggerWorkflow(workflowId, workflowName, slackArgs);
});

app.action('trigger_furlough_offboard', async (slackArgs) => {
  const workflowId = '784eafbc-b624-4c75-b47d-0fdf455f306d';
  const workflowName = 'Furlough Offboard';
  await triggerWorkflow(workflowId, workflowName, slackArgs);
});

const triggerWorkflow = async (workflowId, workflowName, slackArgs) => {
  const { body, ack, say, client } = slackArgs;
  await ack();
  let blocks = body.message.blocks;
  const messageText = blocks[1].fields[0].text;
  const userId = messageText.match(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi)[0];

  const triggeredWorkflowMetadataBlock = {
    "type": "section",
    "fields": [
      {
        "type": "mrkdwn",
        "text": `*Workflow Name*: ${workflowName}\n*Triggered By*: <@${body.user.id}>`,
      }
    ]
  }
  blocks = [...blocks, triggeredWorkflowMetadataBlock]
  await client.apiCall('chat.update', { ts: body.message.ts, channel: body.channel.id, blocks })
  addTextToBlock(triggeredWorkflowMetadataBlock, `*Offboard User*: ${userId}`)

  try {
    await axios.post(`workflows/${workflowId}/execute`, { userId });
    deleteTriggerSelectionBlocks(blocks);
    addTextToBlock(triggeredWorkflowMetadataBlock, `*Status*: Trigger Successful ✅`)
    await client.apiCall('chat.update', { ts: body.message.ts, channel: body.channel.id, blocks })
  } catch (e) {
    addTextToBlock(triggeredWorkflowMetadataBlock, '*Status*: Trigger Failed 🚫');
    await client.apiCall('chat.update', { ts: body.message.ts, channel: body.channel.id, blocks })
  }
}

const deleteTriggerSelectionBlocks = (blocks) => {
  blocks.splice(1,3);
}

const addTextToBlock = (block, text) => {
  block.fields[0].text += `\n${text}`;
}

(async () => {
  await app.start(process.env.PORT || 3000);
  console.log('⚡️ Bolt app is running!');
})();
