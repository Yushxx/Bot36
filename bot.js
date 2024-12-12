const TelegramBot = require('node-telegram-bot-api');
const schedule = require('node-schedule');

// Token de votre bot Telegram
const token = process.env.BOT_TOKEN; // Utilisation de la variable d'environnement pour le token du bot
const bot = new TelegramBot(token, { polling: true });

// Liste des séquences prédéfinies avec les positions des pommes
const sequences = {
    SeqA: { positions: [2, 1, 3, 4], video: process.env.VIDEO_1 },
    SeqB: { positions: [1, 2, 3, 4], video: process.env.VIDEO_2 },
    SeqC: { positions: [1, 3, 3, 2], video: process.env.VIDEO_3 },
    SeqD: { positions: [5, 5, 3, 2], video: process.env.VIDEO_4 },
    SeqE: { positions: [3, 2, 2, 5], video: process.env.VIDEO_5 },
    SeqF: { positions: [4, 4, 2, 1], video: process.env.VIDEO_6 },
    SeqG: { positions: [3, 3, 3, 3], video: process.env.VIDEO_7 },
    SeqH: { positions: [5, 5, 2, 4], video: process.env.VIDEO_8 },
    SeqI: { positions: [4, 4, 1, 1], video: process.env.VIDEO_9 },
    SeqJ: { positions: [1, 1, 2, 2], video: process.env.VIDEO_10 },
};

// Fonction pour choisir une séquence aléatoire
function getRandomSequence() {
    const keys = Object.keys(sequences);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    return sequences[randomKey];
}

// Fonction pour générer la grille de positions des pommes
function generateAppleGrid(positions) {
    // Créer une grille vide de 4x5 (4 lignes, 5 colonnes)
    let grid = [];
    for (let i = 0; i < 4; i++) {
        let row = [];
        for (let j = 0; j < 5; j++) {
            row.push('🟩');  // Remplir de carrés vides
        }
        grid.push(row);
    }

    // Placer les pommes 🍎 aux positions données
    positions.forEach((pos) => {
        const row = Math.floor((pos - 1) / 5);  // Déterminer la ligne (0-3)
        const col = (pos - 1) % 5;  // Déterminer la colonne (0-4)
        grid[row][col] = '🍎';  // Placer la pomme à la position
    });

    // Retourner la grille sous forme de chaîne de caractères
    return grid.map(row => row.join(' ')).join('\n');
}

// Fonction pour générer les codes associés à chaque ligne
function generateCodes() {
    const codes = [
        '2.41', '1.93', '1.54', '1.23'
    ];
    return codes;
}

// Fonction pour envoyer une séquence dans le canal
function sendSequenceToChannel() {
    const sequence = getRandomSequence();
    const codes = generateCodes();
    const sequenceMessage = `
CONFIRMED ENTRY!
🍎 Apple Sequence: ${sequence.positions.join(', ')}
🔐 Attempts: 5
⏰ Validity: 5 minutes

${codes.map((code, index) => `${code}: ${generateAppleGrid(sequence.positions)[index]}`).join('\n')}

🚨 The signal works only on Linebet with promo code PX221 ✅️!
`;

    const inlineKeyboard = {
        inline_keyboard: [
            [
                { text: 'Sign up', url: process.env.SIGNUP_URL },
                { text: 'How to play', url: process.env.HOW_TO_PLAY_URL },
                { text: 'Tuto Français', url: process.env.HOW_TO_PLAY_URLB },
            ],
        ],
    };

    const options = {
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
        reply_markup: inlineKeyboard,
    };

    bot.sendMessage(process.env.CHANNEL_ID, sequenceMessage, options)
        .then(() => {
            // Attendre 3 minutes avant d'envoyer la preuve
            setTimeout(() => {
                bot.sendVideo(process.env.CHANNEL_ID, sequence.video, { caption: '🎥 **Proof of Sequence**' });
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
