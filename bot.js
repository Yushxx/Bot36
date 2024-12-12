const TelegramBot = require('node-telegram-bot-api');
const schedule = require('node-schedule');
const http = require('http');

// Variables sensibles
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });
const channelId = process.env.CHANNEL_ID;

// Séquences définies et leurs vidéos associées
const sequences = {
    SeqA: { positions: [2, 1, 3, 4], video: 'https://t.me/pvvvvip/1' },
    SeqB: { positions: [1, 2, 3, 4], video: 'https://t.me/pvvvvip/2' },
    SeqC: { positions: [1, 3, 3, 2], video: 'https://t.me/pvvvvip/3' },
    SeqD: { positions: [5, 5, 3, 2], video: 'https://t.me/pvvvvip/4' },
    SeqE: { positions: [3, 2, 2, 5], video: 'https://t.me/pvvvvip/5' },
    SeqF: { positions: [4, 4, 2, 1], video: 'https://t.me/pvvvvip/6' },
    SeqG: { positions: [3, 3, 3, 3], video: 'https://t.me/pvvvvip/7' },
    SeqH: { positions: [5, 5, 2, 4], video: 'https://t.me/pvvvvip/8' },
    SeqI: { positions: [4, 4, 1, 1], video: 'https://t.me/pvvvvip/9' },
    SeqJ: { positions: [1, 1, 2, 2], video: 'https://t.me/pvvvvip/10' },
};

// Fonction pour formater une séquence
function formatSequence(seq) {
    const positions = seq.positions;
    return `
2.41:${'🟩 '.repeat(positions[0] - 1)}🍎${'🟩 '.repeat(5 - positions[0])}
1.93:${'🟩 '.repeat(positions[1] - 1)}🍎${'🟩 '.repeat(5 - positions[1])}
1.54:${'🟩 '.repeat(positions[2] - 1)}🍎${'🟩 '.repeat(5 - positions[2])}
1.23:${'🟩 '.repeat(positions[3] - 1)}🍎${'🟩 '.repeat(5 - positions[3])}
    `;
}

// Fonction pour envoyer une séquence et la preuve après un délai
function sendSequenceAndProof(chatId, seqKey) {
    const seq = sequences[seqKey];
    const sequenceMessage = `
🔔 CONFIRMED ENTRY!
🍎 Apple sequence:
${formatSequence(seq)}

🚨 The signal works only on Linebet with promo code PX221 ✅️!
`;

    bot.sendMessage(chatId, sequenceMessage).then(() => {
        // Envoyer la preuve après 3 minutes
        setTimeout(() => {
            bot.sendMessage(chatId, '📹 Proof:', { reply_to_message_id: sequenceMessage.message_id });
            bot.sendVideo(chatId, seq.video);
        }, 3 * 60 * 1000);
    });
}

// Planification des sessions
const sessionTimes = ['10:00', '14:00', '18:00', '22:00'];
sessionTimes.forEach((time) => {
    const [hour, minute] = time.split(':').map(Number);

    schedule.scheduleJob({ hour, minute }, () => {
        // Envoyer une séquence aléatoire parmi les séquences définies
        const seqKeys = Object.keys(sequences);
        const randomSeq = seqKeys[Math.floor(Math.random() * seqKeys.length)];
        sendSequenceAndProof(channelId, randomSeq);
    });
});

// Commande /start pour interactions
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const replyMarkup = {
        inline_keyboard: [
            [{ text: 'Test Signal', callback_data: 'test_signal' }],
        ],
    };

    bot.sendMessage(chatId, 'Bienvenue! Utilisez le bouton ci-dessous pour tester un signal :', {
        reply_markup: replyMarkup,
    });
});

// Gérer les clics sur les boutons
bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;

    if (query.data === 'test_signal') {
        // Envoyer une séquence test
        const testSeqKey = 'SeqA'; // Exemple : utiliser SeqA pour le test
        sendSequenceAndProof(chatId, testSeqKey);
    }
});

// Serveur HTTP pour maintenir le bot actif
http.createServer((req, res) => {
    res.write("Bot is running!");
    res.end();
}).listen(8080);
