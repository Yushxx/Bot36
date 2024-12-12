const TelegramBot = require('node-telegram-bot-api');
const schedule = require('node-schedule');
const http = require('http');

// Charger les variables d'environnement
require('dotenv').config();

// Initialisation du bot
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });
const channelId = process.env.CHANNEL_ID; // ID du canal où les messages seront envoyés
const signupUrl = process.env.SIGNUP_URL;
const howToPlayUrl = process.env.HOW_TO_PLAY_URL;
const howToPlayUrlB = process.env.HOW_TO_PLAY_URLB;

// Liste des séquences prédéfinies
const sequences = {
    SeqA: { positions: [2, 1, 3, 4], video: 't.me/pvvvvip/1' },
    SeqB: { positions: [1, 2, 3, 4], video: 't.me/pvvvvip/2' },
    SeqC: { positions: [1, 3, 3, 2], video: 't.me/pvvvvip/3' },
    SeqD: { positions: [5, 5, 3, 2], video: 't.me/pvvvvip/4' },
    SeqE: { positions: [3, 2, 2, 5], video: 't.me/pvvvvip/5' },
    SeqF: { positions: [4, 4, 2, 1], video: 't.me/pvvvvip/6' },
    SeqG: { positions: [3, 3, 3, 3], video: 't.me/pvvvvip/7' },
    SeqH: { positions: [5, 5, 2, 4], video: 't.me/pvvvvip/8' },
    SeqI: { positions: [4, 4, 1, 1], video: 't.me/pvvvvip/9' },
    SeqJ: { positions: [1, 1, 2, 2], video: 't.me/pvvvvip/10' },
};

// Fonction pour choisir une séquence aléatoire
function getRandomSequence() {
    const keys = Object.keys(sequences);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    return sequences[randomKey];
}

// Fonction pour envoyer une séquence dans le canal
function sendSequenceToChannel() {
    const sequence = getRandomSequence();
    const sequenceMessage = `
🔔 **CONFIRMED ENTRY!**
🍎 **Apple Sequence**: ${sequence.positions.join(', ')}
🔐 **Attempts**: 5
⏰ **Validity**: 5 minutes

🚨 The signal works only on Linebet with promo code PX221 ✅️!
`;

    const inlineKeyboard = {
        inline_keyboard: [
            [
                { text: 'Sign up', url: signupUrl },
                { text: 'How to play', url: howToPlayUrl },
                { text: 'Tuto Français', url: howToPlayUrlB },
            ],
        ],
    };

    const options = {
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
        reply_markup: inlineKeyboard,
    };

    bot.sendMessage(channelId, sequenceMessage, options)
        .then(() => {
            // Attendre 3 minutes avant d'envoyer la preuve
            setTimeout(() => {
                bot.sendVideo(channelId, sequence.video, { caption: '🎥 **Proof of Sequence**' });
            }, 3 * 60 * 1000); // 3 minutes
        })
        .catch((err) => console.error('Erreur d\'envoi dans le canal :', err));
}

// Planification des sessions
const sessions = [
    { name: 'Matin', times: ['09:00', '09:30', '10:00'] },
    { name: 'Après-midi', times: ['14:00', '14:30', '15:00'] },
    { name: 'Soir', times: ['18:00', '18:30', '19:00'] },
    { name: 'Nuit', times: ['22:00', '22:30', '23:00'] },
];

// Créer les tâches planifiées pour chaque session
sessions.forEach((session) => {
    session.times.forEach((time) => {
        const [hour, minute] = time.split(':').map(Number);

        schedule.scheduleJob({ hour, minute }, () => {
            sendSequenceToChannel(); // Envoi au canal
        });
    });
});

// Gérer la commande /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const inlineKeyboard = {
        inline_keyboard: [
            [{ text: 'Test', callback_data: 'test_message' }],
        ],
    };

    bot.sendMessage(chatId, 'Cliquez sur le bouton ci-dessous pour tester une séquence :', {
        reply_markup: inlineKeyboard,
    });
});

// Gérer les clics sur les boutons
bot.on('callback_query', (query) => {
    if (query.data === 'test_message') {
        sendSequenceToChannel(); // Tester en envoyant au canal
        bot.answerCallbackQuery(query.id, { text: 'Test envoyé au canal.' });
    }
});

// Serveur pour éviter l'inactivité
http.createServer((req, res) => {
    res.write("I'm alive");
    res.end();
}).listen(8080);
