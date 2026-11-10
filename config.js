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
    options: ['Gang', 'Cartel', 'Mafia', 'Motorcycle club', 'Crew / organization', 'Legal faction'],
    required: true,
  },
  {
    label: 'Leader and second in command (character names and Discord usernames)',
    type: 'short',
    required: true,
  },
  {
    label: 'Full member list (character names and Discord usernames)',
    type: 'long',
    required: true,
    help: 'One member per line.',
  },
  {
    label: 'Faction backstory',
    type: 'rich',
    required: true,
    help: 'Who you are, where you came from and why you run your area. Add photos, GIFs or videos if you have them.',
  },
  {
    label: 'Faction colors, look and turf',
    type: 'rich',
    required: true,
    help: 'Colors, clothing style, cars and the area you want to claim. Pictures help a lot.',
  },
  {
    label: 'What roleplay will your faction bring to the city?',
    type: 'rich',
    required: true,
  },
  {
    label: 'Clips or examples of your roleplay',
    type: 'rich',
    help: 'Optional. Streamable, YouTube or Medal links, or upload clips.',
  },
  {
    label: 'Has everyone read the Server Guidelines, Faction ROE and Faction Roleplay Guide?',
    type: 'select',
    options: ['Yes, everyone has read them', 'No'],
    required: true,
  },
];
