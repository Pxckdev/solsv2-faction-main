// ===== SOLS FACTION SITE SETTINGS =====

const SITE = {
  // Discord webhook for your faction applications FORUM channel.
  // Discord: Server Settings > Integrations > Webhooks > New Webhook > pick your forum channel > Copy Webhook URL
  webhookUrl: 'https://discord.com/api/webhooks/1569596765655531621/h4ClANMWwT44hAr7htUV-PBoRxnnNktQN4kH1-D5oxWGp1-De4DWUEaebE0x63G5w-oQ',

  // How long (minutes) before the same browser can send another application.
  // The bot also blocks anyone who already has a pending application.
  cooldownMinutes: 10,

  // Uploads (photos, GIFs, videos) per question
  maxFilesPerQuestion: 5,
  maxFileMB: 10, // Discord's limit for normal servers is 10 MB per file
};

// ===== APPLICATION QUESTIONS =====
// Discord username and faction name are always asked first (the bot needs them).
// Add, remove or reorder questions below.
//
// type:
//   'short'  = one line of text
//   'long'   = a big plain text box
//   'rich'   = big text box with fonts, sizes, links, photos, GIFs and videos
//   'select' = pick one option from a list (needs options: [...])
// required: true = they can't submit without answering it
// help: small grey text under the question (optional)

const QUESTIONS = [
  {
    label: 'Faction type',
    type: 'select',
    options: ['Illegal Faction Type','Legal Faction Type'],
    required: true,
  },
  {
    label: 'All Leaders And High Council Discord IDs.',
    type: 'short',
    required: true,
  },
  {
    label: 'All Members Discord IDs.',
    type: 'long',
    required: true,
    help: 'One member per line.',
  },
  {
    label: 'Thread Link.',
    type: 'rich',
    required: true,
    help: 'Faction Thread Link.',
  },
  {
    label: 'Faction color & turf',
    type: 'rich',
    required: true,
    help: 'Color and the area you want to claim. Pictures help a lot.',
  },
  {
    label: 'What type of roleplay will your faction bring to the city?',
    type: 'rich',
    required: true,
  },
  {
    label: 'Has everyone read the Server Guidelines, Faction ROE and Faction Roleplay Guide?',
    type: 'select',
    options: ['Yes, everyone has read them', 'No'],
    required: true,
  },
];
