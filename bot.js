const { Telegraf } = require('telegraf');
const bot = new Telegraf('7755510262:AAEV0nemt9tpH7-jKV6XFEHaarnfFVKMA6E'); // Remplacez par le token de votre bot

// Liste des séquences et des vidéos associées
const sequences = [
    { code: "A", positions: "2.2.1.3", video: "t.me/pvvvvip/2" },
    { code: "B", positions: "1.2.2.1", video: "t.me/pvvvvip/3" },
    { code: "C", positions: "4.5.3.3", video: "t.me/pvvvvip/4" },
    { code: "D", positions: "2.3.3.5", video: "t.me/pvvvvip/5" },
    { code: "E", positions: "1.1.1.4", video: "t.me/pvvvvip/6" },
    { code: "F", positions: "3.2.3.2", video: "t.me/pvvvvip/7" },
    { code: "G", positions: "1.2.3.4", video: "t.me/pvvvvip/8" },
    { code: "H", positions: "5.5.3.3", video: "t.me/pvvvvip/9" },
    { code: "I", positions: "1.2.2.1", video: "t.me/pvvvvip/10" },
    { code: "J", positions: "3.3.2.4", video: "t.me/pvvvvip/11" },
];

// Modèle de séquence
const sequenceTemplate = `
🔔 CONFIRMED ENTRY!
🍎 Apple : 4
🔐 Attempts: 5
⏰ Validity: 5 minutes
`;

// URL des boutons
const signupUrl = "https://example.com/signup";
const howToPlayUrl = "https://example.com/howtoplay";

// Fonction pour générer une séquence visuelle avec 🟩 et 🍎
function generateVisualSequence(positions) {
    const rows = ["2.41", "1.93", "1.54", "1.23"]; // Les noms des lignes
    const result = [];

    const positionArray = positions.split('.'); // Convertir "3.2.3.2" en ["3", "2", "3", "2"]

    rows.forEach((row, index) => {
        const rowArray = Array(5).fill("🟩"); // Créer une ligne avec 5 carrés verts
        const applePosition = parseInt(positionArray[index]) - 1; // Calculer l'index de la pomme (0-based)
        rowArray[applePosition] = "🍎"; // Placer la pomme à la position correcte
        result.push(`${row}: ${rowArray.join(" ")}`); // Construire la ligne et l'ajouter au résultat
    });

    return result.join("\n"); // Retourner toutes les lignes comme un seul texte
}

// Fonction pour envoyer une séquence au canal
async function sendSequenceToChannel(chatId, sequence) {
    const visualSequence = generateVisualSequence(sequence.positions);

    const sequenceMessage = `
${sequenceTemplate}
${visualSequence}

🚨 The signal works only on Linebet with promo code PX221 ✅️! 
 
[Ouvrir Mega Pari](${signupUrl})
[Tuto en Français](${howToPlayUrl})
`;

    const inlineKeyboard = {
        inline_keyboard: [
            [
                { text: 'Sign up', url: signupUrl },
                { text: 'How to play', url: howToPlayUrl }
            ]
        ]
    };

    // Envoyer la séquence
    await bot.telegram.sendMessage(chatId, sequenceMessage, {
        reply_markup: inlineKeyboard,
        parse_mode: "Markdown"
    });

    // Envoyer la vidéo associée après 3 minutes
    setTimeout(async () => {
        await bot.telegram.sendVideo(chatId, sequence.video);
    }, 3 * 60 * 1000);
}

// Commande manuelle pour envoyer une séquence
bot.command('send_sequence', async (ctx) => {
    const args = ctx.message.text.split(' ');
    const code = args[1]?.toUpperCase(); // Code de la séquence (A, B, C, etc.)
    const chatId = ctx.chat.id;

    let sequence;

    if (code) {
        // Rechercher une séquence par code
        sequence = sequences.find(seq => seq.code === code);
        if (!sequence) {
            return ctx.reply("Code invalide. Veuillez fournir un code valide (A à J), ou utilisez `/send_sequence` sans argument pour une séquence aléatoire.");
        }
    } else {
        // Si aucun code n'est fourni, choisir une séquence aléatoire
        sequence = sequences[Math.floor(Math.random() * sequences.length)];
    }

    // Envoyer la séquence choisie
    await sendSequenceToChannel(chatId, sequence);
    ctx.reply(`Séquence "${sequence.code}" envoyée avec succès !`);
});

// Planification automatique des séquences
const schedule = [
    { hour: 11, minute: 40 },
    { hour: 17, minute: 27 },
    { hour: 20, minute: 37 },
    { hour: 23, minute: 44 }
];

function scheduleSequences() {
    schedule.forEach(item => {
        const now = new Date();
        const target = new Date();
        target.setHours(item.hour, item.minute, 0, 0);

        if (now > target) {
            target.setDate(target.getDate() + 1); // Planifier pour le lendemain si l'heure est passée
        }

        const delay = target - now;
        setTimeout(async () => {
            const sequence = sequences[Math.floor(Math.random() * sequences.length)]; // Obtenir une séquence aléatoire
            if (sequence) {
                await sendSequenceToChannel('-1002275506732', sequence); // Remplacez par l'ID de votre canal
                scheduleSequences(); // Replanifier après l'exécution
            }
        }, delay);
    });
}

// Lancer la planification
scheduleSequences();

// Démarrer le bot
bot.launch();
