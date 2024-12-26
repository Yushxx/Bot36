const http = require('http');
const { Telegraf } = require('telegraf');
const cron = require('node-cron');

// Token du bot Telegram
const BOT_TOKEN = process.env.BOT_TOKEN || '8175272076:AAEwt3kmxfStzvVgLTOPoUU4rIpOFV8shvc';
const bot = new Telegraf(BOT_TOKEN);

// Liste des séquences et des vidéos associées
const sequences = [
    { code: "A", positions: "2.2.1.3", video: "t.me/pvvvvip/2" },
    { code: "B", positions: "1.2.2.1", video: "t.me/pvvvvip/3" },
    { code: "C", positions: "4.5.3.3", video: "t.me/pvvvvip/4" },
    { code: "D", positions: "3.1.4.5", video: "t.me/pvvvvip/5" },
    { code: "E", positions: "2.4.3.1", video: "t.me/pvvvvip/6" },
    { code: "F", positions: "5.3.2.2", video: "t.me/pvvvvip/7" },
    { code: "G", positions: "4.2.1.4", video: "t.me/pvvvvip/8" },
    { code: "H", positions: "3.5.4.3", video: "t.me/pvvvvip/9" },
    { code: "I", positions: "2.1.3.5", video: "t.me/pvvvvip/10" },
    { code: "J", positions: "3.3.2.4", video: "t.me/pvvvvip/11" }
];

// URL des boutons
const signupUrl = "https://bit.ly/3v6rgFc";
const howToPlayUrl = "https://t.me/c/2035790146/11014";

// Fonction pour générer une séquence visuelle
function generateVisualSequence(positions) {
    const rows = ["1", "2", "3", "4"];
    const result = [];
    const positionArray = positions.split('.');

    if (positionArray.length !== rows.length) {
        throw new Error("Le format des positions est invalide. Assurez-vous qu'il contient exactement 4 positions séparées par des points.");
    }

    rows.forEach((row, index) => {
        const rowArray = Array(5).fill("🟩");
        const applePosition = parseInt(positionArray[index], 10) - 1;

        if (applePosition < 0 || applePosition >= rowArray.length) {
            throw new Error(`Position invalide dans la ligne ${row}: ${positionArray[index]}`);
        }

        rowArray[applePosition] = "🍎";
        result.push(`${row}: ${rowArray.join(" ")}`);
    });

    return result.join("\n");
}

// Fonction pour envoyer une séquence au canal
async function sendSequenceToChannel(chatId, sequence) {
    try {
        const visualSequence = generateVisualSequence(sequence.positions);

        const sequenceMessage = `
🔔 CONFIRMED ENTRY!
🍎 Apple : 4
🔐 Attempts: 5
⏰ Validity: 5 minutes
${visualSequence}

🚨 The signal works only on Linebet with promo code PX221 ✅️! 

[Ouvrir Mega Pari](${signupUrl})
[Tuto en Français](${howToPlayUrl})
`;

        const inlineKeyboard = {
            inline_keyboard: [
                [
                    { text: 'Register', url: signupUrl },
                    { text: 'Comment jouer', url: howToPlayUrl }
                ]
            ]
        };

        // Envoi de la séquence
        await bot.telegram.sendMessage(chatId, sequenceMessage, {
            reply_markup: inlineKeyboard,
            parse_mode: "Markdown"
        });

        // Envoi de la vidéo après 3 minutes
        setTimeout(async () => {
            await bot.telegram.sendVideo(chatId, sequence.video);
        }, 3 * 60 * 1000);

    } catch (error) {
        console.error('Erreur lors de l\'envoi de la séquence:', error.message);
    }
}

// Commande pour envoyer une séquence dans le canal
bot.command('test_sequence', async (ctx) => {
    try {
        const args = ctx.message.text.split(' ');
        const code = args[1]?.toUpperCase();
        const channelId = '-1002035790146'; // Remplacez par l'ID de votre canal

        let sequence;

        if (code) {
            sequence = sequences.find(seq => seq.code === code);
            if (!sequence) {
                return ctx.reply("Code invalide. Veuillez fournir un code valide (A à J).");
            }
        } else {
            sequence = sequences[Math.floor(Math.random() * sequences.length)];
        }

        await sendSequenceToChannel(channelId, sequence);
        ctx.reply(`La séquence ${sequence.code} a été envoyée au canal avec succès !`);
    } catch (error) {
        console.error('Erreur dans la commande /test_sequence:', error.message);
        ctx.reply("Une erreur est survenue lors de l'exécution de la commande.");
    }
});

// Planification automatique des séquences avec node-cron
cron.schedule('40 11,17,20,23 * * *', async () => {
    const sequence = sequences[Math.floor(Math.random() * sequences.length)];
    const channelId = '-1002035790146'; // Remplacez par l'ID de votre canal

    try {
        await sendSequenceToChannel(channelId, sequence);
    } catch (error) {
        console.error('Erreur lors de la planification automatique:', error.message);
    }
});

// Démarrer le bot
bot.launch();

// Serveur keep_alive
http.createServer((req, res) => {
    res.write("I'm alive");
    res.end();
}).listen(8080);

// Gestion globale des erreurs
bot.catch((err, ctx) => {
    console.error('Erreur de bot:', err.message);
});
