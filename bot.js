const TelegramBot = require('node-telegram-bot-api');
const schedule = require('node-schedule');
const dotenv = require('dotenv');
const http = require('http');
dotenv.config();

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });
const channelId = process.env.CHANNEL_ID;
const signupUrl = process.env.SIGNUP_URL;
const howToPlayUrl = process.env.HOW_TO_PLAY_URL;
const howToPlayUrlB = process.env.HOW_TO_PLAY_URLB;

// Liste des séquences
const sequences = {
    SeqA: "2,1,3,4",
    SeqB: "1,2,3,4",
    SeqC: "1,3,3,2",
    SeqD: "5,5,3,2",
    SeqE: "3,2,2,5",
    SeqF: "4,4,2,1",
    SeqG: "3,3,3,3",
    SeqH: "5,5,2,4",
    SeqI: "4,4,1,1",
    SeqJ: "1,1,2,2"
};

// Fonction pour choisir une séquence aléatoire
function getRandomSequence() {
    const keys = Object.keys(sequences);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    return { key: randomKey, value: sequences[randomKey] };
}

// Fonction pour envoyer une séquence au canal
function sendSequenceToChannel() {
    const { key, value } = getRandomSequence();

    const sequenceMessage = `
🔔 CONFIRMED ENTRY!
🍎 Sequence: ${key} (${value})
⏰ Validity: 5 minutes
    
🚨 The signal works only on Linebet with promo code PX221 ✅️!

[Ouvrir mega pari](${signupUrl})
[Tuto en Français](${howToPlayUrlB})
`;

    const inlineKeyboard = {
        inline_keyboard: [
            [
                { text: 'Sign up', url: signupUrl },
                { text: 'How to play', url: howToPlayUrl }
            ]
        ]
    };

    const options = {
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
        reply_markup: inlineKeyboard
    };

    // Envoi au canal
    bot.sendMessage(channelId, sequenceMessage, options);
}

// Gérer la commande /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;

    const inlineKeyboard = {
        inline_keyboard: [
            [
                { text: 'Test', callback_data: 'test_message' }
            ]
        ]
    };

    const replyMarkup = { reply_markup: inlineKeyboard };
    bot.sendMessage(chatId, 'Cliquez sur "Test" pour envoyer une séquence au canal :', replyMarkup);
});

// Gérer les clics sur les boutons
bot.on('callback_query', (query) => {
    if (query.data === 'test_message') {
        sendSequenceToChannel(); // Envoi dans le canal
    }
});

// Gérer le maintien du bot en vie
http.createServer((req, res) => {
    res.write("I'm alive");
    res.end();
}).listen(8080);
