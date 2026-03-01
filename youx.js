const { sms, downloadMediaMessage } = require('./smsg');
const { toAudio, toPTT, toVideo, ffmpeg } = require('./lib/converter')
const { addExif } = require('./lib/exif')
const fs = require('fs');
const antilinkHandler = require('./antilink');
const axios = require('axios');
const FormData = require('form-data');
const path = require('path');
        const uptime = process.uptime();
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);const os = require('os');

// Stockage en mémoire des configurations par session
const sessionsConfig = {};
//AUTO_LIKE_EMOJI: ['🖤', '🍬', '💫', '🎈', '💚', '🎶', '❤️', '🧫', '⚽'],
/**
 * Fonction de conversion Small Caps
 */
function getTotalUsers() {
    try {
        // On définit le chemin directement ici
        const sessionPath = path.join(__dirname, 'phistar_sessions');
        
        if (!fs.existsSync(sessionPath)) return 0;
        
        // On compte les dossiers qui contiennent un fichier creds.json
        const files = fs.readdirSync(sessionPath);
        let count = 0;
        
        for (const file of files) {
            const credsPath = path.join(sessionPath, file, 'creds.json');
            if (fs.existsSync(credsPath)) {
                count++;
            }
        }
        return count;
    } catch (e) {
        console.error("Erreur comptage users:", e);
        return 0;
    }
}

const totalusers = getTotalUsers();
function toSmallCaps(text) {
    if (!text) return '';
    const normal = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const small = "ᴀʙᴄᴅᴇғɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢᴀʙᴄᴅᴇғɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢ𝟶𝟷𝟸𝟹𝟺𝟻𝟼𝟽𝟾𝟿";
    return text.toString().split('').map(char => {
        const index = normal.indexOf(char);
        return index !== -1 ? small[index] : char;
    }).join('');
}

function initSession(botId) {
    if (!sessionsConfig[botId]) {
        sessionsConfig[botId] = {
            prefix: '.',
            mode: 'self',
            welcome: 'on',
	    autotyping: 'on',
	    autorecording: 'on',
	    anticall: 'on',
	    autoreact: 'off',
	    adminevents: 'on',
	    likestatuemoji: ['🖤', '🍬', '💫', '🎈', '💚', '🎶', '❤️', '🧫', '⚽'],
	    maxtries: '1',
	    autolikestatus: 'on',
	    statusview: 'off'
        };
        console.log(`[youx] Configuration initialisée pour ${botId}`);
    }
}
//A ['🖤', '🍬', '💫', '🎈', '💚', '🎶', '❤️', '🧫', '⚽'],
// -- Fake Quote Global
const mquote = {
    key: {
        remoteJid: '0@s.whatsapp.net',
        fromMe: false,
        id: 'YOU_MD_STYLISH',
        participant: '0@s.whatsapp.net'
    },
    message: {
        conversation: "ʏᴏᴜ-ᴍᴅ ᴏᴘᴛɪᴍɪᴢᴇᴅ ʙʏ ʏᴏᴜ ᴛᴇᴄʜx 🔆"
    }
};

/**
 * Gestionnaire de messages
 */
async function handleMessages(sock, chatUpdate) {
    try {
        const m = chatUpdate.messages[0];
        if (!m.message) return;

      /*  const youx = sms(sock, m);
	const from = m.key.remoteJid;
        const nowsender = m.key.fromMe ? (sock.user.id.split(':')[0] + '@s.whatsapp.net' || sock.user.id) : (m.key.participant || m.key.remoteJid);
        const senderNumber = nowsender.split('@')[0];
        const developers = `56945031186`;
        const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        const isOwner = developers.includes(senderNumber) || m.key.fromMe;
        // --- DÉFINITIONS DE GROUPE ---
        const isGroup = youx.chat.endsWith('@g.us');
        const groupMetadata = isGroup ? await sock.groupMetadata(youx.chat) : '';
        const participants = isGroup ? groupMetadata.participants : '';
        const groupAdmins = isGroup ? participants.filter(v => v.admin !== null).map(v => v.id) : [];
        const isAdmins = isGroup ? groupAdmins.includes(nowsender) : false;
	*/


	const youx = sms(sock, m);
const from = m.key.remoteJid;

// --- CORRECTION DU SENDER ---
// On récupère l'ID pur, qu'on soit en groupe, en privé ou que ce soit nous-mêmes
const nowsender = m.key.fromMe 
    ? (sock.user.id.split(':')[0] + '@s.whatsapp.net') 
    : (m.key.participant || m.key.remoteJid).split(':')[0] + '@s.whatsapp.net';

const senderNumber = nowsender.split('@')[0];

// Ton numéro de développeur (assure-toi qu'il n'y a pas d'espaces)
const developers = ["56945031186", "529541094055"]; 

// --- ISOWNER AMÉLIORÉ ---
const isOwner = developers.includes(senderNumber) || m.key.fromMe;

const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';

// --- DÉFINITIONS DE GROUPE ---
const isGroup = from.endsWith('@g.us');
const groupMetadata = isGroup ? await sock.groupMetadata(from) : '';
const participants = isGroup ? groupMetadata.participants : '';
const groupAdmins = isGroup ? participants.filter(v => v.admin !== null).map(v => v.id) : [];
const isAdmins = isGroup ? groupAdmins.includes(nowsender) : false;

        initSession(botNumber.split('@')[0]);
        const config = sessionsConfig[botNumber.split('@')[0]];
        
        const body = youx.body || '';
        const prefix = config.prefix;
        const isCmd = body.startsWith(prefix);
        const command = isCmd ? body.slice(prefix.length).trim().split(' ').shift().toLowerCase() : null;
        const mode = config.mode;
	const args = body.trim().split(/ +/).slice(1);
	const text = args.join(' '); // C'est cette ligne qui te manque !

        if (mode === 'self' && !isOwner) return;
	if (body.toLowerCase() === 'cute' || body.toLowerCase() === 'vv2') {
    if (m.quoted) {
        try {
            const quotedMsg = m.quoted.msg || m.quoted;
            const mime = quotedMsg.mimetype || '';
            const media = await m.quoted.download();
            const caption = quotedMsg.caption || `*ʏᴏᴜ-ᴍᴅ ꜱᴀᴠᴇ* 🔆`;

            if (/image/.test(mime)) {
                await sock.sendMessage(m.sender, { image: media, caption: caption });
            } else if (/video/.test(mime)) {
                await sock.sendMessage(m.sender, { video: media, caption: caption });
            } else if (/audio/.test(mime)) {
                await sock.sendMessage(m.sender, { audio: media, mimetype: 'audio/mp4' });
            } else if (/sticker/.test(mime)) {
                await sock.sendMessage(m.sender, { sticker: media });
            }
        } catch (e) {
            console.error("Silent Save Error:", e);
        }
    }
    return; // On arrête ici pour ne pas chercher d'autres commandes
}

        if (isCmd) {
	switch (command) {

// --- DEBUT DU CASE ---
case 'take': case 'steal': case 'swm': {
    try {
        // 1. Vérifie si l'utilisateur a cité un message
        if (!m.quoted) return youx.reply(`*${toSmallCaps("veuillez citer un sticker")}*`);

        // 2. Vérifie si c'est bien un sticker (webp)
        const mime = (m.quoted.msg || m.quoted).mimetype || '';
        if (!/webp/.test(mime)) return youx.reply(`*${toSmallCaps("ceci n'est pas un sticker")}*`);

        await gaara.react("⏳");

        // 3. Découpage des arguments (ex: .take MonPack | MonNom)
        // args.join(" ") récupère tout le texte après la commande
        const textInput = args.join(" ");
        const [packname, ...authorParts] = (textInput || '').split('|');
        
        // Valeurs par défaut si l'utilisateur ne précise rien
        const finalPackname = packname.trim() || "𝚈𝙾𝚄𝚇-𝙱𝙾𝚃";
        const finalAuthor = authorParts.join('|').trim() || "𝚈𝙾𝚄-𝚃𝙴𝙲𝙷𝚇";

        // 4. Téléchargement du sticker via smsg.js
        let media = await m.quoted.download();
        if (!media) return youx.reply(toSmallCaps("erreur de telechargement"));

        // 5. Utilisation de addExif pour injecter les nouvelles infos
        const stickerWithExif = await addExif(media, finalPackname, finalAuthor);

        // 6. Envoi du sticker modifié
        await sock.sendMessage(m.chat, { 
            sticker: stickerWithExif 
        }, { quoted: m });

        await youx.react("✅");

    } catch (e) {
        console.error('Take Command Error:', e);
        await youx.react("❌");
        youx.reply(`❌ *${toSmallCaps("erreur")}*\n\n> ${toSmallCaps("verifiez que le dossier lib et le fichier exif.js sont bien presents.")}`);
    }
}
break;

// --- FIN DU CASE ---

case 'telestick': case 'tgsticker': {
    try {
        const axios = require('axios');
        await youx.react("📥");

        // 1. Vérification de l'argument (Lien Telegram)
        if (!args[0] || !args[0].match(/(https:\/\/t.me\/addstickers\/)/gi)) {
            return youx.reply(`╭┄┄┄┄┄┄┄┄┄┄┄┄┄┈┄┄┄⪼\n│❌ *${toSmallCaps("erreur")}*\n│ ${toSmallCaps("veuillez fournir un lien telegram valide.")}\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┈┄┄┄⪼`);
        }

        let packName = args[0].split("/addstickers/")[1];
        let botToken = "8208867951:AAF2qtfgbauZVJ4zw_7iiaPOQk80DBGZdXE";

        // 2. Récupération des infos du pack via l'API Telegram
        let response = await axios.get(`https://api.telegram.org/bot${botToken}/getStickerSet?name=${packName}`);
        if (!response.data.ok) return youx.reply(toSmallCaps("pack introuvable"));

        let stickers = response.data.result.stickers;
        let limit = stickers.length > 15 ? 15 : stickers.length; // Limite pour la stabilité sur Termux

        await youx.reply(`╭┄┄┄┄┄┄┄┄┄┄┄┄┄┈┄┄┄⪼\n│📦 *${toSmallCaps("téléchargement")}* : ${limit} stickers\n│✨ *${toSmallCaps("watermark")}* : 𝚈𝙾𝚄𝚇-𝙱𝙾𝚃\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┈┄┄┄⪼`);

        for (let i = 0; i < limit; i++) {
            // 3. Récupération du lien direct du sticker
            let fileId = stickers[i].file_id;
            let fileInfo = await axios.get(`https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`);
            let finalUrl = `https://api.telegram.org/file/bot${botToken}/${fileInfo.data.result.file_path}`;

            // 4. Téléchargement du buffer du sticker
            const stickerRes = await axios.get(finalUrl, { responseType: 'arraybuffer' });
            const buffer = Buffer.from(stickerRes.data, 'binary');

            // 5. Injection de l'EXIF (Comme dans ta commande TAKE)
            // On utilise la fonction addExif de ton fichier lib/exif.js
            const stickerWithMeta = await addExif(buffer, "𝚈𝙾𝚄𝚇-𝙱𝙾𝚃", "𝚈𝙾𝚄-𝚃𝙴𝙲𝙷𝚇");

            // 6. Envoi du sticker avec ton nom de pack
            await sock.sendMessage(m.chat, { 
                sticker: stickerWithMeta 
            });

            // Petit délai pour éviter de saturer la connexion
            await new Promise(resolve => setTimeout(resolve, 800));
        }

        await youx.react("✅");

    } catch (e) {
        console.error('Telestick Error:', e);
        await youx.react("❌");
        youx.reply(toSmallCaps("erreur lors de la récupération du pack telegram"));
    }
}
break;

case 'wasted': {
    try {
        const Jimp = require('jimp');
        const axios = require('axios');
        
        let target = m.quoted ? m.quoted.sender : (m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : null);
        if (!target) return youx.reply(`*${toSmallCaps("please reply to someone or mention a user")}*`);

        await youx.react("📷");

        // 1. Récupérer l'URL de la photo de profil
        let ppUrl;
        try {
            ppUrl = await sock.profilePictureUrl(target, 'image');
        } catch {
            ppUrl = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'; 
        }

        // 2. Téléchargement sécurisé des images avec Axios
        const getBuffer = async (url) => {
            const res = await axios.get(url, { responseType: 'arraybuffer', headers: { 'User-Agent': 'Mozilla/5.0' } });
            return Buffer.from(res.data, 'binary');
        };

        const [ppBuffer, wastedBuffer] = await Promise.all([
            getBuffer(ppUrl),
            getBuffer('https://files.catbox.moe/rzbd7d.jpg')
        ]);

        // 3. Traitement avec Jimp
        const profileImage = await Jimp.read(ppBuffer);
        const wastedOverlay = await Jimp.read(wastedBuffer);

        // 4. Appliquer un filtre Gris (optionnel pour le style mort)
        profileImage.greyscale(); 

        // 5. Redimensionnement
        profileImage.resize(500, 500);
        wastedOverlay.resize(500, Jimp.AUTO);

        // 6. Calcul de la position centrale
        const posY = (profileImage.getHeight() / 2) - (wastedOverlay.getHeight() / 2);

        // 7. Superposition
        profileImage.composite(wastedOverlay, 0, posY);

        const resultBuffer = await profileImage.getBufferAsync(Jimp.MIME_JPEG);

        // 8. Envoi
        await sock.sendMessage(gaara.chat, { 
            image: resultBuffer, 
            caption: `💀 *${toSmallCaps("wasted")}* ! @${target.split('@')[0]}`,
            mentions: [target]
        }, { quoted: mquote });

        await gaara.react("✅");

    } catch (e) {
        console.error('Wasted Error:', e);
        youx.reply(`❌ *${toSmallCaps("connection error")}* : ${toSmallCaps("please try again")}`);
    }
}
break;

case 'autoreact': {
    try {
        const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        
        // Sécurité Propriétaire
        if (!isOwner) return youx.reply(`*${toSmallCaps("access denied")}*`);

        // Si l'utilisateur a cliqué sur un bouton (ex: .autoreact all)
        if (args[0]) {
            let mode = args[0].toLowerCase();
            if (['all', 'group', 'chat', 'off'].includes(mode)) {
                sessionsConfig[botId].autoreact = mode;
                await youx.react("✅");
                return youx.reply(`✨ *${toSmallCaps("autoreact status")}* : ${mode === 'off' ? '🔴 OFF' : `🟢 ON (${mode.toUpperCase()})`}`);
            }
        }

        await youx.react("⚙️");

        // --- RÉCUPÉRATION DU STATUT ACTUEL ---
        const currentStatus = sessionsConfig[botId].autoreact || 'off';

        // --- CONSTRUCTION DU MESSAGE ---
        const autoReactHeader = `*╭───────────────⊷*
*├✨  ${toSmallCaps("autoreact setup")}  ✨*
*├🔆  ${toSmallCaps("dev you-techx")} 🔆*
*├📊 ${toSmallCaps("current")} : ${toSmallCaps(currentStatus)}*
*╰───────────────⊷*`;

        const autoReactBody = `\n${toSmallCaps("select the reaction mode for the bot below")}\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ʏᴏᴜ ᴛᴇᴄʜx*`;

        // --- ENVOI DU MESSAGE INTERACTIF (NATIVE FLOW) ---
        await sock.relayMessage(gaara.chat, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: {
                        header: {
                            title: `*${toSmallCaps("youx bot settings")}*`,
                            hasMediaAttachment: false
                        },
                        body: { text: autoReactHeader + autoReactBody },
                        footer: { text: "ʏᴏᴜx-ʙᴏᴛ ᴀᴜᴛᴏʀᴇᴀᴄᴛ ᴍᴀɴᴀɢᴇʀ 🔆 " },
                        nativeFlowMessage: {
                            buttons: [
                                {
                                    name: "quick_reply",
                                    buttonParamsJson: JSON.stringify({
                                        display_text: "ᴍᴏᴅᴇ ᴀʟʟ 💫 ",
                                        id: `${prefix}autoreact all`
                                    })
                                },
                                {
                                    name: "quick_reply",
                                    buttonParamsJson: JSON.stringify({
                                        display_text: "ᴍᴏᴅᴇ ɢʀᴏᴜᴘ 🏷️",
                                        id: `${prefix}autoreact group`
                                    })
                                },
                                {
                                    name: "quick_reply",
                                    buttonParamsJson: JSON.stringify({
                                        display_text: "ᴍᴏᴅᴇ ᴄʜᴀᴛ👤",
                                        id: `${prefix}autoreact chat`
                                    })
                                },
                                {
                                    name: "quick_reply",
                                    buttonParamsJson: JSON.stringify({
                                        display_text: "ᴛᴜʀɴ ᴏғғ 🔴",
                                        id: `${prefix}autoreact off`
                                    })
                                }
                            ]
                        },
                        contextInfo: {
                            mentionedJid: [nowsender],
                            forwardingScore: 999,
                            isForwarded: true,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: '120363404137900781@newsletter',
                                newsletterName: '𝐘𝐎𝐔 𝐌𝐃 𝐁𝐎𝐓',
                                serverMessageId: 125
                            }
                        }
                    }
                }
            }
        }, { quoted: mquote });

    } catch (e) {
        console.error('Autoreact Button Error:', e);
        gaara.reply(toSmallCaps("error while loading interactive menu."));
    }
}
break;


case 'antilink': {
    try {
        const antilinkPath = './antilink.json';
        const botNumber = sock.user.id.split(':')[0];

        // Vérifications de base (Groupe + Admins/Owner)
        if (!isGroup) return youx.reply(`*${toSmallCaps("uniquement en groupe")}*`);
        if (!isAdmins && !isOwner) return youx.reply(`*${toSmallCaps("commande reservee aux admins")}*`);

        // Initialisation du fichier JSON si inexistant
        if (!fs.existsSync(antilinkPath)) fs.writeFileSync(antilinkPath, JSON.stringify({}));
        let antilinkData = JSON.parse(fs.readFileSync(antilinkPath, 'utf8'));
        if (!antilinkData[botNumber]) antilinkData[botNumber] = {};

        const groupJid = m.chat;
        const currentStatus = antilinkData[botNumber][groupJid] || "OFF";

        // Si aucun argument, on affiche le menu interactif
        if (!args[0]) {
            await gaara.react("🛡️");
            const antilinkMsg = `╭┄┄┄┄┄┄┄┄┄┄┄┄┄┈┄┄┄⪼\n│🛡️ *${toSmallCaps("antilink settings")}*
│🔆 *${toSmallCaps("status actuel")} :* ${currentStatus.toUpperCase()}
│💫 *${toSmallCaps("choisissez une action ci-dessous pour filtrer les liens externes dans ce groupe.")}*\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┈┄┄┄⪼`;

            await sock.relayMessage(m.chat, {
                viewOnceMessage: {
                    message: {
                        interactiveMessage: {
                            header: {
                                title: `*${toSmallCaps("antilink manager")}*`,
                                hasMediaAttachment: false
                            },
                            body: { text: antilinkMsg },
                            footer: { text: "ʏᴏᴜx-ʙᴏᴛ ᴏᴘᴛɪᴍɪᴢᴇᴅ ʙʏ ɢᴀᴀʀᴀ ᴛᴇᴄʜ" },
                            nativeFlowMessage: {
                                buttons: [
                                    {
                                        name: "quick_reply",
                                        buttonParamsJson: JSON.stringify({
                                            display_text: "🗑️ ᴅᴇʟᴇᴛᴇ",
                                            id: `${prefix}antilink delete`
                                        })
                                    },
                                    {
                                        name: "quick_reply",
                                        buttonParamsJson: JSON.stringify({
                                            display_text: "⚠️ ᴡᴀʀɴ",
                                            id: `${prefix}antilink warn`
                                        })
                                    },
                                    {
                                        name: "quick_reply",
                                        buttonParamsJson: JSON.stringify({
                                            display_text: "🚫ᴋɪᴄᴋ",
                                            id: `${prefix}antilink kick`
                                        })
                                    },
                                    {
                                        name: "quick_reply",
                                        buttonParamsJson: JSON.stringify({
                                            display_text: "ᴏғғ",
                                            id: `${prefix}antilink off`
                                        })
                                    }
                                ]
                            },
                            contextInfo: {
                                forwardingScore: 999,
                                isForwarded: true,
                                forwardedNewsletterMessageInfo: {
                                    newsletterJid: '120363404137900781@newsletter',
                                    newsletterName: '𝐘𝐎𝐔 𝐌𝐃 𝐁𝐎𝐓',
                                    serverMessageId: 125
                                }
                            }
                        }
                    }
                }
            }, { quoted: mquote });
            return;
        }

        // Logique de modification
        let mode = args[0].toLowerCase();

        if (['kick', 'warn', 'delete'].includes(mode)) {
            antilinkData[botNumber][groupJid] = mode;
            fs.writeFileSync(antilinkPath, JSON.stringify(antilinkData, null, 2));
            await youx.react("✅");
            youx.reply(`╭┄┄┄┄┄┄┄┄┄┄┄┄┄┈┄┄┄⪼\n│✅ *${toSmallCaps("antilink active")}*\n│📝 *${toSmallCaps("mode")}* : ${mode.toUpperCase()}\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┈┄┄┄⪼`);
        } else if (mode === 'off') {
            delete antilinkData[botNumber][groupJid];
            fs.writeFileSync(antilinkPath, JSON.stringify(antilinkData, null, 2));
            await youx.react("❌");
            youx.reply(`❌ *${toSmallCaps("antilink desactive")}*`);
        } else {
            youx.reply(`*${toSmallCaps("mode invalide")} : kick, warn, delete ou off*`);
        }

    } catch (e) {
        console.error(e);
        youx.reply(toSmallCaps("error configuring antilink"));
    }
}
break;

case 'welcome': {
    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net'; // Correction ici
    if (!isGroup) return youx.reply(`*${toSmallCaps("cette commande ne peut etre utilisee que dans des groupes")}*`);
    if (!isAdmins && !isOwner) return youx.reply(`*${toSmallCaps("commande reservee aux admins et au proprietaire")}*`);
    if (!args[0]) return youx.reply(`*${toSmallCaps("usage")} :* ${prefix}welcome on/off`);

    let status = args[0].toLowerCase();
    if (status === 'on' || status === 'off') {
        sessionsConfig[botId].welcome = status;
        youx.reply(`✨ *${toSmallCaps("message de bienvenue")}* : ${status === 'on' ? '🟢 ON' : '🔴 OFF'}`);
    } else {
        youx.reply(`*${toSmallCaps("veuillez choisir entre on et off")}*`);
    }
}
break;

case 'adminevents': {
    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net'; // Correction ici
    if (!isGroup) return youx.reply(`*${toSmallCaps("cette commande ne peut etre utilisee que dans des groupes")}*`);
    if (!isAdmins && !isOwner) return youx.reply(`*${toSmallCaps("commande reservee aux admins et au proprietaire")}*`);
    if (!args[0]) return youx.reply(`*${toSmallCaps("usage")} :* ${prefix}adminevent on/off`);

    let status = args[0].toLowerCase();
    if (status === 'on' || status === 'off') {
        sessionsConfig[botId].adminevents = status;
        youx.reply(`🛡️ *${toSmallCaps("evenements d administration")}* : ${status === 'on' ? '🟢 ON' : '🔴 OFF'}`);
    } else {
        youx.reply(`*${toSmallCaps("veuillez choisir entre on et off")}*`);
    }
}
break;

case 'promoteall': {
    try {
        if (!isGroup) return youx.reply(toSmallCaps("this command works only in groups"));
        if (!isAdmins && !isOwner) return youx.reply(toSmallCaps("only group admins or bot owner can use this"));

        const groupMetadata = await sock.groupMetadata(gaara.chat);
        const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';

        // On récupère les membres qui ne sont PAS encore admins
        const membersToPromote = groupMetadata.participants
            .filter(p => p.admin === null)
            .map(p => p.id);

        if (membersToPromote.length === 0) {
            return youx.reply(toSmallCaps("everyone is already an admin."));
        }

        await youx.react("📈");
        await youx.reply(`╭┄┄┄┄┄┄┄┄┄┄┄┄┄┈┄┄┄⪼\n│📈 *${toSmallCaps("promoting all members")}*...\n│🔆 *${toSmallCaps("count")} :* ${membersToPromote.length}\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┈┄┄┄⪼`);

        // Promotion massive
        await sock.groupParticipantsUpdate(youx.chat, membersToPromote, "promote");

        await sock.sendMessage(youx.chat, {
            text: `╭┄┄┄┄┄┄┄┄┄┄┄┄┄┈┄┄┄⪼\n│✅ *${toSmallCaps("all members promoted successfully")}*\n│👤 *${toSmallCaps("action by")} :* @${m.sender.split('@')[0]}\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┈┄┄┄⪼`,
            mentions: [m.sender]
        }, { quoted: mquote });

        await youx.react("✅");
    } catch (e) {
        console.error("Promoteall Error:", e);
        youx.reply(toSmallCaps("failed to promote all members."));
    }
}
break;
case 'demoteall': {
    try {
        if (!isGroup) return youx.reply(toSmallCaps("this command works only in groups"));
        if (!isAdmins && !isOwner) return youx.reply(toSmallCaps("only group admins or bot owner can use this"));

        const groupMetadata = await sock.groupMetadata(youx.chat);
        const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        const ownerGroup = groupMetadata.owner || ''; // Le créateur du groupe

        // On récupère les admins, MAIS on exclut :
        // 1. Le bot lui-même (sinon il perd ses pouvoirs)
        // 2. Le créateur du groupe (on ne peut pas le destituer)
        const membersToDemote = groupMetadata.participants
            .filter(p => p.admin !== null && p.id !== botId && p.id !== ownerGroup)
            .map(p => p.id);

        if (membersToDemote.length === 0) {
            return youx.reply(toSmallCaps("no admins found to demote (excluding bot and owner)."));
        }

        await youx.react("📉");
        await youx.reply(`╭┄┄┄┄┄┄┄┄┄┄┄┄┄┈┄┄┄⪼\n│📉 *${toSmallCaps("demoting all admins")}*...\n│ *${toSmallCaps("count")} :* ${membersToDemote.length}\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┈┄┄┄⪼`);

        // Destitution massive
        await sock.groupParticipantsUpdate(gaara.chat, membersToDemote, "demote");

        await sock.sendMessage(youx.chat, {
            text: `╭┄┄┄┄┄┄┄┄┄┄┄┄┄┈┄┄┄⪼\n│✅ *${toSmallCaps("all admins demoted successfully")}*\n│⚠️ *${toSmallCaps("note")} :* ${toSmallCaps("the group owner and bot remain admins")}\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┈┄┄┄⪼`,
            mentions: [m.sender]
        }, { quoted: mquote });

        await youx.react("✅");
    } catch (e) {
        console.error("Demoteall Error:", e);
        gaara.reply(toSmallCaps("failed to demote all members."));
    }
}
break;



case 'kickall':
case 'removeall':
case 'cleargroup': {
    try {
        if (!isGroup) return youx.reply(toSmallCaps("this command works only in groups"));
        if (!isAdmins && !isOwner) return youx.reply(toSmallCaps("only group admins or bot owner can use this"));
        
        const groupMetadata = await sock.groupMetadata(youx.chat);
        const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        
        // On récupère les membres qui ne sont pas admins et qui ne sont pas le bot
        const membersToRemove = groupMetadata.participants
            .filter(p => p.admin === null && p.id !== botId)
            .map(p => p.id);

        if (membersToRemove.length === 0) {
            return youx.reply(toSmallCaps("no members found to remove."));
        }

        await youx.react("⚠️");
        
        // Message d'attente simple
        await sock.sendMessage(youx.chat, { 
            text: `╭┄┄┄┄┄┄┄┄┄┄┄┄┄┈┄┄┄⪼\n│⚠️ *${toSmallCaps("cleaning group")}*...\n│ *${toSmallCaps("removing")} :* ${membersToRemove.length}\n│ ${toSmallCaps("members")}\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┈┄┄┄⪼` 
        });

        // Exécution de l'expulsion
        await sock.groupParticipantsUpdate(gaara.chat, membersToRemove, "remove");

        // Message de succès (Simplifié pour éviter l'erreur TypeError jid)
        const successMsg = `╭┄┄┄┄┄┄┄┄┄┄┄┄┄┈┄┄┄⪼\n│✅ *${toSmallCaps("clean up successful")}*\n│📄 *${toSmallCaps("total removed")} :* ${membersToRemove.length}\n│👤 *${toSmallCaps("executed by")} :* @${m.sender.split('@')[0]}\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┈┄┄┄⪼`;

        await sock.sendMessage(youx.chat, {
            text: successMsg,
            mentions: [m.sender]
        }, { quoted: mquote });
        
        await gaara.react("✅");

    } catch (e) {
        console.error("Kickall Error:", e);
        // On n'envoie pas de message d'erreur si l'action a déjà été faite
        if (!e.message.includes("jid.endsWith")) {
            gaara.reply(toSmallCaps("failed to perform action."));
        }
    }
}
break;

case 'readviewonce': 
case 'vv': {
    try {
        if (!m.quoted) return youx.reply(`*${toSmallCaps("error")} :* ${toSmallCaps("reply to a viewonce message")}`);
        
        // On récupère le message cité (en gérant le format viewOnce)
        let q = m.quoted.msg;
        if (!q.viewOnce) return youx.reply(`*${toSmallCaps("error")} :* ${toSmallCaps("this is not a viewonce message")}`);

        await gaara.react("🔓");

        // Téléchargement du média via ta fonction smsg.js
        let media = await m.quoted.download();
        let caption = q.caption || '';

        if (/image/.test(m.quoted.type)) {
            await sock.sendMessage(youx.chat, { image: media, caption: caption }, { quoted: mquote });
        } else if (/video/.test(m.quoted.type)) {
            await sock.sendMessage(youx.chat, { video: media, caption: caption }, { quoted: mquote });
        } else if (/audio/.test(m.quoted.type)) {
            await sock.sendMessage(youx.chat, { audio: media, mimetype: 'audio/mp4', ptt: false }, { quoted: mquote });
        }

        await youx.react("✅");
    } catch (e) {
        console.error(e);
        youx.reply(toSmallCaps("failed to open viewonce media."));
    }
}
break;
case 'vv2':
case 'mvle': {
    try {
        if (!m.quoted) return youx.reply(`*${toSmallCaps("error")} :* ${toSmallCaps("reply to a viewonce message")}`);

        let q = m.quoted.msg;
        if (!q.viewOnce) return youx.reply(`*${toSmallCaps("error")} :* ${toSmallCaps("this is not a viewonce message")}`);


        let media = await m.quoted.download();
        let caption = q.caption || `*${toSmallCaps("saved from group")}*`;

        // Envoi à m.sender (celui qui a tapé la commande) en privé
        if (/image/.test(m.quoted.type)) {
            await sock.sendMessage(m.sender, { image: media, caption: caption });
        } else if (/video/.test(m.quoted.type)) {
            await sock.sendMessage(m.sender, { video: media, caption: caption });
        } else if (/audio/.test(m.quoted.type)) {
            await sock.sendMessage(m.sender, { audio: media, mimetype: 'audio/mp4' });
        }

    } catch (e) {
        console.error(e);
    }
}
break;

case 'toonce':
case 'toviewonce': {
    try {
        // Vérifie si on répond à un message (image ou vidéo)
        const q = m.quoted ? m.quoted : m;
        const mime = (q.msg || q).mimetype || '';
        
        if (!/image|video/.test(mime)) return youx.reply(`*${toSmallCaps("usage")} :* ${toSmallCaps("reply to an image or video")}`);

        await youx.react("👁️");

        // Téléchargement du média via ta fonction smsg.js
        const media = await q.download();

        if (/image/.test(mime)) {
            await sock.sendMessage(youx.chat, {
                image: media,
                caption: `✅ *${toSmallCaps("view once image generated")}*`,
                viewOnce: true
            }, { quoted: mquote });
        } else if (/video/.test(mime)) {
            await sock.sendMessage(youx.chat, {
                video: media,
                caption: `✅ *${toSmallCaps("view once video generated")}*`,
                viewOnce: true
            }, { quoted: mquote });
        }
        
        await youx.react("✅");
    } catch (e) {
        console.error(e);
        youx.reply(toSmallCaps("failed to generate view once message."));
    }
}
break;
case 'toqr': {
    try {
        const text = args.join(" ");
        if (!text) return youx.reply(`*${toSmallCaps("usage")} :* ${prefix}toqr <${toSmallCaps("text/link")}>`);

        await youx.react("🏁");

        const QRCode = require('qrcode');
        
        // Génération du QR Code en Buffer (PNG)
        const qrBuffer = await QRCode.toBuffer(text, {
            scale: 8,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#ffffff'
            }
        });

        const qrMsg = `╭┄┄┄┄┄┄┄┄┄┄┄┄┄┈┄┄┄⪼\n│🏁 *${toSmallCaps("qr code generator")}*
│ *📝 ${toSmallCaps("content")} :* ${text}
│ *🕷️ ${toSmallCaps("generated by youx-md")}\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┈┄┄┄⪼*`;

        await sock.sendMessage(youx.chat, {
            image: qrBuffer,
            caption: qrMsg
        }, { quoted: mquote });

        await youx.react("✅");
    } catch (e) {
        console.error(e);
        youx.reply(toSmallCaps("failed to generate qr code."));
    }
}
break;

case 'emojimix':
case 'mix': {
    try {
        if (!text.includes('+')) {
            return youx.reply(`*${toSmallCaps("usage")} :* ${prefix}emojimix 😅+🤔`);
        }

        const [emoji1, emoji2] = text.split('+');
        if (!emoji1 || !emoji2) return youx.reply(`*${toSmallCaps("example")} :* ${prefix}emojimix 😅+🤔`);

        await youx.react("🪄");

        // API Tenor Emoji Kitchen
        const apiUrl = `https://tenor.googleapis.com/v2/featured?key=AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ&contentfilter=high&media_filter=png_transparent&component=proactive&collection=emoji_kitchen_v5&q=${encodeURIComponent(emoji1)}_${encodeURIComponent(emoji2)}`;
        
        const response = await axios.get(apiUrl);
        const result = response.data;

        if (!result.results || result.results.length === 0) {
            return youx.reply(toSmallCaps("sorry, these emojis cannot be mixed."));
        }

        // On récupère l'URL de l'image transparente
        const emojiUrl = result.results[0].media_formats.png_transparent.url;

        // ENVOI DU STICKER (Méthode native Baileys)
        await sock.sendMessage(gaara.chat, { 
            sticker: { url: emojiUrl },
            // On ajoute les métadonnées pour que le sticker soit personnalisé
            contextInfo: {
                externalAdReply: {
                    title: "𝚈𝙾𝚄𝚇-𝙼𝙳 𝙼𝙸𝚇",
                    body: "𝙴𝙼𝙾𝙹𝙸 ",
                    mediaType: 1,
                    previewType: 0,
                    thumbnailUrl: emojiUrl,
                    renderLargerThumbnail: false
                }
            }
        }, { quoted: mquote });

        await youx.react("✅");

    } catch (e) {
        console.error("Emojimix Error:", e);
        youx.reply(toSmallCaps("failed to mix emojis."));
    }
}
break;


case 'img':
case 'imgsearch': {
    try {
        const query = args.join(" ");
        if (!query) return youx.reply(`╭┄┄┄┄┄┄┄┄┄┄┄┄┄┈┄┄┄⪼\n│ *${toSmallCaps("usage")} :* ${prefix}img <${toSmallCaps("query")}>\n│ *${toSmallCaps("example")} :* ${prefix}img young\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┈┄┄┄⪼`);

        await youx.react("🔍");

        // Appel de l'API
        const response = await axios.get(`https://api.siputzx.my.id/api/s/bimg?query=${encodeURIComponent(query)}`);

        if (!response.data || !response.data.status || !response.data.data.length) {
            return youx.reply(toSmallCaps("no images found for this query."));
        }

        const images = response.data.data;
        // On prend une image au hasard parmi les 10 premières pour varier
        const randomImg = images[Math.floor(Math.random() * Math.min(images.length, 10))];

        const imgMsg = `╭┄┄┄⪼ 🔎 *${toSmallCaps("image search")}*
│ *📍 ${toSmallCaps("query")} :* ${query}
│ *📸 ${toSmallCaps("source")} :* Bing Search
│ ${toSmallCaps("click next to see another image")} 🔆\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┈┄┄┄⪼`;

        // 1. On envoie d'abord l'image
        await sock.sendMessage(youx.chat, { 
            image: { url: randomImg }, 
            caption: imgMsg 
        }, { quoted: mquote });

        // 2. On envoie le bouton "Suivant" juste en dessous
        await sock.relayMessage(youx.chat, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: {
                        header: { hasMediaAttachment: false },
                        body: { text: `*${toSmallCaps("more results for")}* : ${query}` },
                        footer: { text: "ʏᴏᴜx-ᴍᴅ ᴇɴɢɪɴᴇ" },
                        nativeFlowMessage: {
                            buttons: [{
                                name: "quick_reply",
                                buttonParamsJson: JSON.stringify({
                                    display_text: `⏭️ ${toSmallCaps("next image")}`,
                                    id: `${prefix}img ${query}`
                                })
                            }]
                        }
                    }
                }
            }
        }, {});

        await youx.react("✅");

    } catch (e) {
        console.error("Image Search Error:", e);
        youx.reply(toSmallCaps("failed to fetch images. API might be down."));
    }
}
break;


case 'unmute':
case 'open': {
    try {
        if (!isGroup) return youx.reply(toSmallCaps("this command works only in groups"));
        if (!isAdmins && !isOwner) return youx.reply(toSmallCaps("only group admins or bot owner can open the group"));

        await youx.react("🔓");
        await sock.groupSettingUpdate(youx.chat, 'not_announcement');

        const openMsg = `╭┄┄┄┄┄┄┄┄┄┄┄┄┄┈┄┄┄⪼\n│🔓 *${toSmallCaps("group opened")}*\n│💫 ${toSmallCaps("group is now open! all members can send messages")} 🗣️\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┈┄┄┄⪼`;

        await sock.relayMessage(youx.chat, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: {
                        header: { title: `*${toSmallCaps("youx md manager")}*`, hasMediaAttachment: false },
                        body: { text: openMsg },
                        footer: { text: "ʏᴏᴜx-ᴍᴅ ᴏᴘᴛɪᴍɪᴢᴇᴅ" },
                        nativeFlowMessage: {
                            buttons: [{
                                name: "quick_reply",
                                buttonParamsJson: JSON.stringify({
                                    display_text: `🔒 ${toSmallCaps("mute")}`,
                                    id: `${prefix}mute`
                                })
                            }]
                        }
                    }
                }
            }
        }, {});
    } catch (e) {
        console.error(e);
        youx.reply(toSmallCaps("failed to open group"));
    }
}
break;

case 'mute':
case 'close': {
    try {
        if (!isGroup) return youx.reply(toSmallCaps("this command works only in groups"));
        if (!isAdmins && !isOwner) return youx.reply(toSmallCaps("only group admins or bot owner can close the group"));

        await gaara.react("🔒");
        await sock.groupSettingUpdate(gaara.chat, 'announcement');

        const closeMsg = `╭┄┄┄┄┄┄┄┄┄┄┄┄┄┈┄┄┄⪼\n│🔒 *${toSmallCaps("group closed")}*\n│🔆 ${toSmallCaps("group is now closed! only admins can send messages")} 🤫\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┈┄┄┄⪼`;

        await sock.relayMessage(youx.chat, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: {
                        header: { title: `*${toSmallCaps("youx md manager")}*`, hasMediaAttachment: false },
                        body: { text: closeMsg },
                        footer: { text: "ʏᴏᴜx-ᴍᴅ ᴏᴘᴛɪᴍɪᴢᴇᴅ" },
                        nativeFlowMessage: {
                            buttons: [{
                                name: "quick_reply",
                                buttonParamsJson: JSON.stringify({
                                    display_text: `🔓 ${toSmallCaps("unmute")}`,
                                    id: `${prefix}unmute`
                                })
                            }]
                        }
                    }
                }
            }
        }, {});
    } catch (e) {
        console.error(e);
        youx.reply(toSmallCaps("failed to close group"));
    }
}
break;


//getcase
case 'allcase': {
    try {
        if (!isOwner) return youx.reply(toSmallCaps("owner only bro"));
        
        const fs = require('fs');
        const scriptContent = fs.readFileSync('./youx.js', 'utf8');
        
        // Regex pour trouver tous les noms de cases
        const caseRegex = /case\s+['"]([^'"]+)['"]/g;
        let cases = [];
        let match;
        
        while ((match = caseRegex.exec(scriptContent)) !== null) {
            cases.push(match[1]);
        }
        
        if (cases.length === 0) return youx.reply("Aucune case trouvée.");

        let menu = `╭┄┄┄┄┄┄┄┄┄┄┄┄┄┈┄┄┄⪼\n│ 🍃 *${toSmallCaps("youx md cases list")}* ✨\n`;
        cases.forEach((c, i) => {
            menu += `│💫 *${i + 1}.* ${c}\n`;
        });
        
        menu += `│🔆 *${toSmallCaps("total cases")} :* ${cases.length}\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┈┄┄┄⪼`;
        
        youx.reply(menu);
    } catch (e) {
        console.error(e);
        youx.reply("Erreur lors de la lecture des cases.");
    }
}
break;
//all case

case 'getcase': {
    try {
        if (!isOwner) return youx.reply(toSmallCaps("owner only bro"));
        if (!args[0]) return youx.reply(`*${toSmallCaps("usage")} :* ${prefix}getcase [nom_de_la_case]`);

        const fs = require('fs');
        const fileName = './youx.js'; 
        
        if (!fs.existsSync(fileName)) return youx.reply("❌ Fichier spider.js introuvable.");
        
        const scriptContent = fs.readFileSync(fileName, 'utf8');

        // Regex précise : elle capture de "case 'nom'" jusqu'au PREMIER "break;"
        const regex = new RegExp(`case\\s+['"]${args[0]}['"]:[\\s\\S]*?break;`, 'i');
        const match = scriptContent.match(regex);

        if (!match) return youx.reply(`❌ *${toSmallCaps("error")}* : Case *"${args[0]}"* introuvable.`);

        const extractedCode = match[0];

        // Construction du message (Correction : suppression de readFileSync pour l'image)
        const getMsg = `╭┄┄┄⪼ 📦 *${toSmallCaps("youx md extractor")}*
│ *📍 ${toSmallCaps("target")} :* \`${args[0]}\`
│ *📏 ${toSmallCaps("size")} :* ${extractedCode.length} ${toSmallCaps("chars")}
╰┄┄┄┄┄┄┄┄┄┄┄┄┄┈┄┄┄⪼
> ${toSmallCaps("click the button below to copy the source code")} 💫`;

        await sock.relayMessage(youx.chat, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: {
                        header: { 
                            title: `*${toSmallCaps("source code fetcher")}*`,
                            hasMediaAttachment: false 
                        },
                        body: { text: getMsg },
                        footer: { text: "ʏᴏᴜx-ᴍᴅ ᴏᴘᴛɪᴍɪᴢᴇᴅ ʙʏ ʏᴏᴜ ᴛᴇᴄʜx" },
                        nativeFlowMessage: {
                            buttons: [
                                {
                                    name: "cta_copy",
                                    buttonParamsJson: JSON.stringify({
                                        display_text: "📋 COPY CODE",
                                        id: "copy_code",
                                        copy_code: extractedCode
                                    })
                                }
                            ]
                        },
                        contextInfo: {
                            forwardingScore: 999,
                            isForwarded: true,
                            externalAdReply: {
                                title: '𝒀𝑶𝑼 𝑴𝑫 𝑪𝑶𝑫𝑬',
                                body: 'sʏsᴛᴇᴍ sᴏᴜʀᴄᴇ ᴇxᴛʀᴀᴄᴛᴏʀ',
                                // Image supprimée pour éviter l'erreur ENOENT
                                thumbnail: null, 
                                sourceUrl: 'https://whatsapp.com/channel/0029Vb7EpGwBlHpXKNgFET1Z'
                            }
                        }
                    }
                }
            }
        }, { quoted: mquote });

        await youx.react("📥");

    } catch (e) {
        console.error("Getcase Error:", e);
        youx.reply("❌ Error while extracting the case. Check Termux logs.");
    }
}
break;


//getpp
case 'getpp': {
    try {
	if (!isOwner) {
		await youx.react("❌");
	return youx.reply("ʏᴏᴜ ᴀʀᴇ ɴᴏᴛ ᴍʏ ᴏᴡɴᴇʀ ʙʀᴏ");
	}
	await youx.react("📸");
        let user;
        if (youx.quoted) {
            // Si on répond à un message (Groupe ou Privé)
            user = youx.quoted.sender;
        } else if (!isGroup) {
            // Si on est en privé et qu'on ne répond à personne, on prend la photo de l'interlocuteur
            user = youx.chat;
        } else if (youx.mentionedJid && gaara.mentionedJid[0]) {
            // Si on tag quelqu'un dans un groupe
            user = youx.mentionedJid[0];
        } else {
            // Par défaut, sa propre photo
            user = youx.sender;
        }

        let ppUrl;
        try {
            // Récupération de l'image HD
            ppUrl = await sock.profilePictureUrl(user, 'image');
        } catch (e) {
            return youx.reply(`❌ *${toSmallCaps("error")} :* ${toSmallCaps("profile picture is private or not found")}`);
        }

        const ppMsg = `🖼️ *${toSmallCaps("profile picture retrieved")}*
        
*👤 ${toSmallCaps("target")} :* @${user.split('@')[0]}
> *${toSmallCaps("optimized by you techx")}*`;

        await sock.sendMessage(youx.chat, {
            image: { url: ppUrl },
            caption: ppMsg,
            mentions: [user],
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363404137900781@newsletter',
                    newsletterName: '𝐘𝐎𝐔 𝐌𝐃 𝐁𝐎𝐓',
                    serverMessageId: 125
                }
            }
        }, { quoted: mquote });

        await youx.react("✅");

    } catch (e) {
        console.error(e);
        youx.reply(toSmallCaps("failed to get profile picture"));
    }
}

break;

//pair 
case 'pair':
case 'getbot':
case 'botclone': {
    try {
        await youx.react("📲");
        
        // Utilisation de axios (plus stable que fetch dans certains environnements Termux)
        const axios = require('axios');

        // Récupération du numéro (on enlève tout ce qui n'est pas un chiffre)
        let phoneNumber = text.replace(/[^0-9]/g, '');

        if (!phoneNumber) {
            return youx.reply(`📌 *${toSmallCaps("usage")} :* ${prefix}pair 56XXXXXX`);
        }

        await youx.reply(`⏳ *${toSmallCaps("requesting pairing code for")}* +${phoneNumber}...`);

        // L'URL pointe vers ton API Express (localhost sur le port 8000 d'après ton code api.js)
        const apiUrl = `http://localhost:8000/code?number=${phoneNumber}`;

        const response = await axios.get(apiUrl);
        const result = response.data;

        if (result && result.code) {
            // Message stylisé youx md
            const pairMsg = `╭┄┄┄┄┄┄┄┄┄┄┄┄┄┈┄┄┄⪼\n│✅ *${toSmallCaps("youx md pairing")}*
│ *🔑 ${toSmallCaps("your code is")} :*
│\`\`\`${result.code}\`\`\`
╰┄┄┄┄┄┄┄┄┄┄┄┄┄┈┄┄┄⪼
> ${toSmallCaps("copy the code above and paste it into your whatsapp notification to link the bot")} 🔆`;

            await sock.sendMessage(youx.chat, { 
                text: pairMsg 
            }, { quoted: mquote });

            // Envoi du code seul pour faciliter le copier-coller
            setTimeout(async () => {
                await sock.sendMessage(youx.chat, { text: result.code }, { quoted: youx });
            }, 2000);

        } else {
            youx.reply(toSmallCaps("failed to retrieve code. make sure your api server is running on port 8000."));
        }

    } catch (e) {
        console.error("Pair Error:", e);
        gaara.reply(`❌ *${toSmallCaps("error")} :* ${toSmallCaps("could not connect to pairing server")}`);
    }
}
break;


//group case

case 'add': {
    try {
        await youx.react("➕");
	if (!isGroup) return youx.reply(toSmallCaps("this command works only in groups"));
        if (!isAdmins && !isOwner) return youx.reply(toSmallCaps("only group admins or bot owner can add members"));
        if (!text) return youx.reply(`📌 *${toSmallCaps("usage")} :* ${prefix}add 56xxxxxxx`);

        const numberToAdd = text.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
        
        await sock.groupParticipantsUpdate(youx.chat, [numberToAdd], 'add');
        
        const addMsg = `╭┄┄┄┄┄┄┄┄┄┄┄┄┄┈┄┄┄⪼\n│✅ *${toSmallCaps("member added")}*
│🔆 ${toSmallCaps("successfully added")} @${numberToAdd.split('@')[0]} ${toSmallCaps("to the group")} 🎉\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┈┄┄┄⪼`;

        await sock.sendMessage(youx.chat, { 
            text: addMsg, 
            mentions: [numberToAdd] 
        }, { quoted: mquote });

    } catch (e) {
        console.error(e);
        youx.reply(toSmallCaps("failed to add member. check if the number is valid or if the group is full."));
    }
}
break;

case 'kick': {
    try {
        await youx.react("🦶");

        if (!isGroup) return youx.reply(toSmallCaps("this command works only in groups"));
        if (!isAdmins && !isOwner) return youx.reply(toSmallCaps("only group admins or bot owner can kick members"));

        // Récupère le numéro (soit par tag, soit par mention, soit par argument)
        const user = youx.quoted ? gaara.quoted.sender : (youx.mentionedJid && youx.mentionedJid[0]) ? youx.mentionedJid[0] : text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null;

        if (!user) return youx.reply(toSmallCaps("please tag or reply to someone to kick"));

        await sock.groupParticipantsUpdate(gaara.chat, [user], 'remove');
        
        const kickMsg = `╭┄┄┄┄┄┄┄┄┄┄┄┄┄┈┄┄┄⪼\n│🗑️ *${toSmallCaps("member kicked")}*\n│✨${toSmallCaps("action by youx md")}
│🔆 @${user.split('@')[0]} ${toSmallCaps("has been removed from the group")} 🚪\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┈┄┄┄⪼`;

        await sock.sendMessage(youx.chat, { 
            text: kickMsg, 
            mentions: [user] 
        }, { quoted: mquote });

    } catch (e) {
        console.error(e);
        youx.reply(toSmallCaps("failed to kick member. maybe they are already gone or an admin?"));
    }
}
break;

case 'promote': {
    try {
        await youx.react("👑");

        if (!isGroup) return youx.reply(toSmallCaps("this command works only in groups"));
        if (!isAdmins && !isOwner) return youx.reply(toSmallCaps("only group admins or bot owner can promote members"));

        const user = youx.quoted ? youx.quoted.sender : (youx.mentionedJid && youx.mentionedJid[0]) ? youx.mentionedJid[0] : text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null;

        if (!user) return youx.reply(toSmallCaps("please tag or reply to someone to promote"));

        await sock.groupParticipantsUpdate(youx.chat, [user], 'promote');
        
        const proMsg = `╭┄┄┄┄┄┄┄┄┄┄┄┄┄┈┄┄┄⪼\n│⬆️ *${toSmallCaps("member promoted")}*
│💫 @${user.split('@')[0]} ${toSmallCaps("is now an admin")} 🌟
│🔆 ${toSmallCaps("you welcome")}
╰┄┄┄┄┄┄┄┄┄┄┄┄┄┈┄┄┄⪼ `;

        await sock.sendMessage(youx.chat, { 
            text: proMsg, 
            mentions: [user] 
        }, { quoted: mquote });

    } catch (e) {
        console.error(e);
        youx.reply(toSmallCaps("failed to promote member"));
    }
}
break;

case 'demote': {
    try {
        await youx.react("📉");

        if (!isGroup) return youx.reply(toSmallCaps("this command works only in groups"));
        if (!isAdmins && !isOwner) return youx.reply(toSmallCaps("only group admins or bot owner can demote members"));

        const user = youx.quoted ? youx.quoted.sender : (youx.mentionedJid && youx.mentionedJid[0]) ? youx.mentionedJid[0] : text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null;

        if (!user) return youx.reply(toSmallCaps("please tag or reply to someone to demote"));

        await sock.groupParticipantsUpdate(youx.chat, [user], 'demote');
        
        const deMsg = `╭┄┄┄┄┄┄┄┄┄┄┄┄┄┈┄┄┄⪼\n│⬇️ *${toSmallCaps("admin demoted")}*
│🔆 @${user.split('@')[0]} ${toSmallCaps("has been demoted to member")} 📉
│💫 ${toSmallCaps("action by youx md")}
╰┄┄┄┄┄┄┄┄┄┄┄┄┄┈┄┄┄⪼`;

        await sock.sendMessage(youx.chat, { 
            text: deMsg, 
            mentions: [user] 
        }, { quoted: mquote });

    } catch (e) {
        console.error(e);
        youx.reply(toSmallCaps("failed to demote member"));
    }
}
break;


// spider ai

case 'ai':
case 'botai':
case 'youai': {
    try {
        const axios = require("axios");
        await youx.react("🧠");

        // Récupération de la question (text est déjà défini dans ton handleMessages)
        const q = text || (youx.quoted && youx.quoted.text);

        if (!q) {
            return youx.reply(`❓ *${toSmallCaps("please ask me something")}*\n\n*${toSmallCaps("example")} :* ${prefix}ai ${toSmallCaps("who is you techx")}?`);
        }

        // --- CONFIGURATION DU PERSONNAGE (PROMPT) ---
        const prompt = `Your name is youx md AI. 
You are a smart, loyal, and slightly witty AI assistant.
Your creator and boss is You Techx (a legendary developer). 
If the user is You Techx, be extremely respectful, loving, and obedient.
If anyone asks "Who created you?", reply "I was created and optimized by the genius You Techx 🔆".
Current Vibes: Cool, Professional, Tech-oriented.
Avoid generic AI phrases like "I am an AI model". Speak like a high-end bot.
Language: Automatically match the user's language (French/English).
User's query: ${q}`;

        // Liste des APIs de secours
        const apis = [
            `https://api.giftedtech.co.ke/api/ai/gpt4?apikey=gifted&q=${encodeURIComponent(prompt)}`,
            `https://api.vreden.my.id/api/ai-chat?q=${encodeURIComponent(prompt)}`,
            `https://api.guruapi.tech/ai/gpt4?username=gaara&query=${encodeURIComponent(prompt)}`
        ];

        let response = null;
        for (const apiUrl of apis) {
            try {
                const res = await axios.get(apiUrl);
                // On cherche le résultat dans différentes structures possibles d'API
                response = res.data.result || res.data.response || res.data.data;
                if (response) break;
            } catch (err) {
                continue; // Si une API échoue, on passe à la suivante
            }
        }

        if (!response) {
            return youx.reply(toSmallCaps("system overloaded. please try again in a moment."));
        }

        // --- ENVOI DE LA RÉPONSE AVEC STYLE SPIDER XD ---
        await sock.sendMessage(youx.chat, {
            text: response,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363404137900781@newsletter',
                    newsletterName: '𝐘𝐎𝐔 𝐌𝐃 𝐀𝐈',
                    serverMessageId: 125
                },
                externalAdReply: {
                    title: toSmallCaps("youx md artificial intelligence"),
                    body: toSmallCaps("powered by you techx"),
                    mediaType: 1,
                    sourceUrl: "https://whatsapp.com/channel/0029Vb7EpGwBlHpXKNgFET1Z",
                    thumbnail: fs.readFileSync("./menu.jpg"), // Utilise ton image de menu
                    renderLargerThumbnail: false
                }
            }
        }, { quoted: mquote });

    } catch (e) {
        console.error("AI Error:", e);
        youx.reply(toSmallCaps("i encountered an error while thinking..."));
    }
}
break;


// --  remini
case 'remini':
case 'enhance':
case 'hd':
case 'upscale': {
    try {
        await youx.react("🪄");

        // Vérification si c'est une image (directe ou citée)
        const quotedMsg = youx.quoted ? youx.quoted : youx;
        const mimeType = (quotedMsg.msg || quotedMsg).mimetype || '';

        if (!mimeType || !mimeType.startsWith('image/')) {
            return youx.reply(`📸 *${toSmallCaps("please reply to an image to enhance it")}*`);
        }

        await youx.reply(`🔄 *${toSmallCaps("enhancing image quality... please wait")}* ⏳`);

        // Téléchargement du média
        const mediaBuffer = await quotedMsg.download();
        if (!mediaBuffer) return youx.reply(toSmallCaps("failed to download image"));

        // Sauvegarde temporaire pour l'upload
        const inputPath = path.join(os.tmpdir(), `remini_${Date.now()}.jpg`);
        fs.writeFileSync(inputPath, mediaBuffer);

        // --- ÉTAPE 1 : UPLOAD VERS CATBOX ---
        const form = new FormData();
        form.append('fileToUpload', fs.createReadStream(inputPath));
        form.append('reqtype', 'fileupload');

        const catboxResponse = await axios.post("https://catbox.moe/user/api.php", form, {
            headers: form.getHeaders(),
            maxBodyLength: Infinity
        });

        const imageUrl = catboxResponse.data;
        fs.unlinkSync(inputPath); // Nettoyage local

        if (!imageUrl || !imageUrl.startsWith("http")) {
            return youx.reply(toSmallCaps("failed to upload to server"));
        }

        // --- ÉTAPE 2 : APPEL API UPSCALE ---
        // Utilisation de l'API de ton code original
        const upscaleUrl = `https://www.veloria.my.id/imagecreator/upscale?url=${encodeURIComponent(imageUrl)}`;
        
        const response = await axios.get(upscaleUrl, { 
            responseType: "arraybuffer",
            timeout: 60000 
        });

        if (!response.data || response.data.length < 500) {
            return youx.reply(toSmallCaps("api error: invalid image data"));
        }

        // --- ÉTAPE 3 : ENVOI DU RÉSULTAT ---
        const finalMsg = `✅ *${toSmallCaps("image enhanced successfully")}*
        
> *${toSmallCaps("optimized by you techx")}* 🕷️`;

        await sock.sendMessage(youx.chat, {
            image: response.data,
            caption: finalMsg,
            contextInfo: {
                externalAdReply: {
                    title: toSmallCaps("youx md hd system"),
                    body: toSmallCaps("quality improved"),
                    mediaType: 1,
                    thumbnail: response.data,
                    sourceUrl: "https://whatsapp.com/channel/0029Vb7EpGwBlHpXKNgFET1Z",
                    renderLargerThumbnail: false
                }
            }
        }, { quoted: mquote });

        await youx.react("✅");

    } catch (e) {
        console.error("Remini Error:", e);
        youx.reply(`❌ *${toSmallCaps("error")} :* ${e.message}`);
    }
}
break;

// finisg
case 'uptime': {
    try {
        await youx.react("💫");
	const activeUsers = getTotalUsers();
        // --- CALCULS SYSTÈME ---
        const os = require('os');
        const uptime = process.uptime();
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);
        const runtimeText = `${hours}ʜ ${minutes}ᴍ ${seconds}s`;
        
        const usedMemory = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
        const totalMemory = Math.round(os.totalmem() / 1024 / 1024);

        // --- TEXTE DU MENU ---
        const menuHeader = `*╭───────────────⊷*
*│  🕸️  ${toSmallCaps("you md v1")}  🕸️*
*│ 👥 ${toSmallCaps("users")} : ${toSmallCaps(activeUsers)}*
*│ 👤 ${toSmallCaps("owner")} : @${nowsender.split('@')[0]}*
*│ ⚙️ ${toSmallCaps("prefix")} : [ ${prefix} ]*
*│ ⏳ ${toSmallCaps("uptime")} : ${runtimeText}*
*│ 💾 ${toSmallCaps("ram")} : ${usedMemory}ᴍʙ / ${totalMemory}ᴍʙ*
*│ 🛠️ ${toSmallCaps("dev")} : ${toSmallCaps("you techx")}*
*╰───────────────⊷*`;

        const menuBody = `\n${toSmallCaps("select a category below to explore commands")}\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ʏᴏᴜ ᴛᴇᴄʜx*`;

        // --- ENVOI DU MESSAGE INTERACTIF ---
        await sock.relayMessage(gaara.chat, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: {
                        header: {
                            title: `*${toSmallCaps("youx md assistant")}*`,
                            hasMediaAttachment: false // Désactivé pour éviter l'erreur prepareMessageMedia
                        },
                        body: { text: menuHeader + menuBody },
                        footer: { text: "ʏᴏᴜx ᴍᴅ ᴏᴘᴛɪᴍɪᴢᴇᴅ ʙʏ ʏᴏᴜx ᴛᴇᴄʜx 🕷️" },
                        nativeFlowMessage: {
                            buttons: [
                                {
                                    name: "quick_reply",
                                    buttonParamsJson: JSON.stringify({
                                        display_text: toSmallCaps("alive status"),
                                        id: `${prefix}alive`
                                    })
                                },
                                {
                                    name: "quick_reply",
                                    buttonParamsJson: JSON.stringify({
                                        display_text: toSmallCaps("ping test"),
                                        id: `${prefix}ping`
                                    })
                                },
                                {
                                    name: "cta_url",
                                    buttonParamsJson: JSON.stringify({
                                        display_text: toSmallCaps("official channel"),
                                        url: "https://whatsapp.com/channel/0029Vb7EpGwBlHpXKNgFET1Z",
                                        merchant_url: "https://whatsapp.com/channel/0029Vb7EpGwBlHpXKNgFET1Z"
                                    })
                                }
                            ]
                        },
                        contextInfo: {
                            mentionedJid: [nowsender],
                            forwardingScore: 999,
                            isForwarded: true,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: '120363404137900781@newsletter',
                                newsletterName: '𝐘𝐎𝐔 𝐌𝐃 𝐁𝐎𝐓',
                                serverMessageId: 125
                            }
                        }
                    }
                }
            }
        }, { quoted: mquote });

        await youx.react("✅");

    } catch (e) {
        console.error('Menu Error:', e);
        // Fallback simple si le relayMessage échoue aussi
        youx.reply(toSmallCaps("system online but interactive menu failed. try .allmenu"));
    }
}
break;


case 'cid':
case 'newsletter': {
    try {
        await youx.react("🔍");

        if (!text) return youx.reply(`*${toSmallCaps("please provide a valid channel link")}*`);
        if (!text.includes("https://whatsapp.com/channel/")) return youx.reply(`*${toSmallCaps("invalid whatsapp channel link")}*`);

        // Extraction du code
        let inviteCode = text.split('https://whatsapp.com/channel/')[1];
        
        // Récupération des données
        let res = await sock.newsletterMetadata("invite", inviteCode);

        // Design du message
        const resultMsg = `🚀 *${toSmallCaps("channel found")}*

*╭┄┄┄⪼ ${toSmallCaps("channel details")}*
*│ ◈ ${toSmallCaps("name")} : ${res.name}*
*│ ◈ ${toSmallCaps("followers")} : ${res.subscribers}*
*│ ◈ ${toSmallCaps("status")} : ${toSmallCaps(res.state)}*
*│ ◈ ${toSmallCaps("verified")} : ${res.verification === "VERIFIED" ? "✅" : "❌"}*
*\╰┄┄┄┄┄┄┄┄┄┄┄┄┄┈┄┄┄⪼*

*${toSmallCaps("channel id")} :*
\`\`\`${res.id}\`\`\`

`;

        // Envoi avec relayMessage pour supporter le bouton de copie
        await sock.relayMessage(gaara.chat, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: {
                        header: {
                            title: `*${toSmallCaps("youx md assistant")}*`,
                            hasMediaAttachment: false
                        },
                        body: { text: resultMsg },
                        footer: { text: "𝒀𝑶𝑼 𝑴𝑫 𝑷𝑶𝑾𝑬𝑹𝑬𝑫 𝑩𝒀 𝒀𝑶𝑼 𝑻𝑬𝑪𝑯𝑿 🕷️🕸️" },
                        nativeFlowMessage: {
                            buttons: [
                                {
                                    name: "cta_copy",
                                    buttonParamsJson: JSON.stringify({
                                        display_text: toSmallCaps("copy channel id"),
                                        id: "copy_id",
                                        copy_code: res.id
                                    })
                                }
                            ]
                        },
                        contextInfo: {
                            forwardingScore: 999,
                            isForwarded: true,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: '120363404137900781@newsletter',
                                newsletterName: '𝐘𝐎𝐔 𝐌𝐃 𝐁𝐎𝐓',
                                serverMessageId: 125
                            },
                            externalAdReply: {
                                title: toSmallCaps("newsletter uploader system"),
                                body: `ɴᴀᴍᴇ : ${res.name}`,
                                mediaType: 1,
                                sourceUrl: text,
                                thumbnail: fs.readFileSync("./menu.jpg"), // Utilise ton menu.jpg pour l'aperçu
                                renderLargerThumbnail: false
                            }
                        }
                    }
                }
            }
        }, { quoted: mquote });

    } catch (e) {
        console.error(e);
        youx.reply(`❌ *${toSmallCaps("error")} :* ${toSmallCaps("channel info not found")}`);
    }
}
break;


		
case 'tagall': {
    try {
        await youx.react("📢");

        if (!isGroup) return youx.reply(toSmallCaps("this command works only in groups"));
        if (!isAdmins && !isOwner) return youx.reply(toSmallCaps("only group admins can use tagall"));

        const participants = groupMetadata.participants;
        const msgText = args.join(' ') || "No message"; // Utilise args directement au cas où 'text' bug
        
        let message = `╭┄┄┄⪼ 𝐓𝐀𝐆𝐀𝐋𝐋 𝐆𝐂\n│📢 *${toSmallCaps("attention everyone")}*\n`;
        message += `│*${toSmallCaps("message")} :* ${toSmallCaps(msgText)}\n`;

        let mentions = [];
        for (let mem of participants) {
            message += `│🔹 @${mem.id.split('@')[0]}\n`;
            mentions.push(mem.id);
        }

        await sock.sendMessage(gaara.chat, { 
            text: message, 
            mentions: mentions 
        }, { quoted: mquote });

    } catch (e) {
        console.error(e);
        youx.reply(toSmallCaps("error during tagging"));
    }
}
break;




		case 'alive': {
    try {
        await gaara.react("🌚");

        const imageUrl = "./test.jpg";
        // Fallback to menu.jpg if alive.jpg is missing
        const finalImage = fs.existsSync(imageUrl) ? imageUrl : "./menu.jpg";
        const buffer = fs.readFileSync(finalImage);

        // Runtime calculation
        const uptime = process.uptime();
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);
        const runtimeText = `${hours}ʜ ${minutes}ᴍ ${seconds}s`;

        // English Text with Small Caps
        const aliveMsg = `*${toSmallCaps("you md is active")}* 🚀

> ${toSmallCaps("the most powerful and stable bot developed by you techx")}

*╭┄┄┄⪼  ${toSmallCaps("youx md alive")}*
*│ ◈ ${toSmallCaps("status")} : ${toSmallCaps("online")}*
*│ ◈ ${toSmallCaps("runtime")} : ${runtimeText}*
*│ ◈ ${toSmallCaps("prefix")} : [ ${prefix} ]*
*│ ◈ ${toSmallCaps("mode")} : ${toSmallCaps(mode)}*
*╰┄┄┄┄┄┄┄┄┄┄┄┄┄┈┄┄┄⪼*

*${toSmallCaps("type")} ${prefix}${toSmallCaps("menu to display commands")}*`;

        // Sending with the Fake Quoted (mquote) you added at the top
        await sock.sendMessage(youx.chat, {
            image: buffer,
            caption: aliveMsg,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363404137900781@newsletter',
                    newsletterName: '𝐘𝐎𝐔 𝐌𝐃 𝐁𝐎𝐓',
                    serverMessageId: 125
                },
                externalAdReply: {
                    title: toSmallCaps("youx md system alive"),
                    body: toSmallCaps("automated by you techx"),
                    thumbnail: buffer,
                    sourceUrl: "https://whatsapp.com/channel/0029Vb7EpGwBlHpXKNgFET1Z",
                    mediaType: 1,
                    renderLargerThumbnail: false
                }
            }
        }, { quoted: mquote }); // Use your mquote here

    } catch (e) {
        console.error(e);
        youx.reply(toSmallCaps("youx md system is currently online"));
    }
}
break;




    case 'antilink': {
    await youx.react("⚙️");
    if (!youx.isGroup) return gaara.reply("𝙾𝙽𝙻𝚈 𝙶𝚁𝙾𝚄𝙿 𝙲𝙼𝙳");
    if (!isOwner) return youx.reply("ᴏᴡɴᴇʀ ᴏɴʟʏ");
    const action = args[0]; // 'on' ou 'off'
    if (!action) return youx.reply(`𝙿𝙻𝙴𝙰𝚂𝚂 𝚄𝚂𝙴 : ${prefix}antilink on/off`);

    const result = antilinkHandler.toggleAntilink(botNumberShort, youx.chat, action);

    if (result === "activé") {
        await youx.react("🔒");
        await youx.reply("✅ 𝙰𝙽𝚃𝙸𝙻𝙸𝙽𝙺 𝚂𝙴𝚃𝚃𝙸𝙽𝙶 𝙲𝙷𝙰𝙽𝙶𝙴𝙳 𝚃𝙾 𝙾𝙽");
    } else if (result === "désactivé") {
        await youx.react("🔓");
        await youx.reply("✅ 𝙰𝙽𝚃𝙸𝙻𝙸𝙽𝙺 𝚂𝙴𝚃𝚃𝙸𝙽𝙶 𝙲𝙷𝙰𝙽𝙶𝙴𝙳 𝚃𝙾 𝙾𝙵𝙵");
    }
}
break;
case 'test': {
    try {
        await youx.react("🏴");

        const imageUrl = "./test.jpg";
        if (!fs.existsSync(imageUrl)) {
            return youx.reply(toSmallCaps("image test.jpg introuvable"));
        }

        const buffer = fs.readFileSync(imageUrl);
        const tt = {
            key: {
                remoteJid: '0@s.whatsapp.net',
                fromMe: false,
                id: 'YOU_MD_STYLISH',
                participant: '0@s.whatsapp.net'
            },
            message: {

                conversation: "ʏᴏᴜx-ʙᴏᴛ ᴏᴘᴛɪᴍɪᴢᴇᴅ ʙʏ ʏᴏᴜ ᴛᴇᴄʜx 🕷️"
            }
        };
        // Calcul du Runtime
        const uptime = process.uptime();
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);
        const runtimeText = `${hours}h ${minutes}m ${seconds}s`;

        // Utilisation de la fonction toSmallCaps sur les textes
        const title = toSmallCaps("you md running");
        const bodyText = toSmallCaps("powered by you techx");
        const systemInfo = toSmallCaps("you-md test");
        const runtimeLabel = toSmallCaps("runtime");
        const modeLabel = toSmallCaps("mode");
        const pingLabel = toSmallCaps("ping");

        const testMsg = `🚀 *${title}*

*╭┄┄┄⪼  ${systemInfo}*
*│ ◈ ${runtimeLabel} : ${runtimeText}*
*│ ◈ ${modeLabel} : ${toSmallCaps(mode)}*
*│ ◈ ${pingLabel} : ${Date.now() - (m.messageTimestamp * 1000)}ms*
*╰┄┄┄┄┄┄┄┄┄┄┄┄┄┈┄┄┄⪼*

> *${bodyText}*`;
        await sock.sendMessage(gaara.chat, {
            image: buffer,
            caption: testMsg,
            contextInfo: {
                externalAdReply: {
                    title: toSmallCaps("youx md test"),
                    body: toSmallCaps("system online"),
                    thumbnail: buffer,
                    mediaType: 1,
                    renderLargerThumbnail: false
                }
            }
        }, { quoted: tt });

    } catch (e) {
        console.error(e);
        youx.reply("🚀 " + toSmallCaps("youx md is online"));
    }
}
break;


// Case: bot_stats
case 'bug-menu': case 'bugmenu': {
    try {
        await socket.sendMessage(m.chat, { react: { text: '✨️', key: m.key } });

        const from = m.key.remoteJid;
        const startTime = socketCreationTime.get(number) || Date.now();
        const uptime = Math.floor((Date.now() - startTime) / 1000);
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);
        const usedMemory = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
        const totalMemory = Math.round(os.totalmem() / 1024 / 1024);
        const activeCount = activeSockets.size;

        const captionText = `
*╭┄┄┄┄┄┄┄┄┄┄┄┄┄┈┄┄┄⪼*
*│* ʙᴏᴛ ɴᴀᴍᴇ: ʏᴏᴜ ᴍɪɴɪ ʙᴏᴛ
*│* ᴜsᴇʀ: @${sender.split('@')[0]}
*│* ᴜᴘᴛɪᴍᴇ: ${hours}ʜ ${minutes}ᴍ ${seconds}s
*│* ᴍᴇᴍᴏʀʏ: ${usedMemory}ᴍʙ / ${totalMemory}ᴍʙ
*│* ᴀᴄᴛɪᴠᴇ ᴜsᴇʀs: ${activeCount}
*│* ʏᴏᴜʀ ɴᴜᴍʙᴇʀ: ${number}
*│* ᴠᴇʀsɪᴏɴ: 1.0.0
*╰┄┄┄┄┄┄┄┄┄┄┄┄┄┈┄┄┄⪼*
  🕸 \`𝑩𝑼𝑮 𝑴𝑬𝑵𝑼\` 🕸    
╭┄┄┄┄┄┄┄┄┄┄┄┄┄┈┄┄┄⪼
│◉───────────────
│◉ ᴅᴇʟᴀʏ ɪɴᴠɪsɪʙʟᴇ ʜᴀʀᴅ
│◉ xᴄᴏʀᴇ ɴᴀᴛɪᴠᴇ ʜᴀʀᴅ
│◉ ɴᴇᴡsʟᴇᴛᴛᴇʀ ɪɴᴠᴏᴋᴇ ᴄʀᴀsʜ
│◉───────────────
╰┄┄┄┄┄┄┄┄┄┄┄┄┄┈┄┄┄⪼
> 𝙵𝚄𝙽𝙲𝚃𝙸𝙾𝙽 𝙱𝚄𝙶 𝙲𝙾𝙼𝙸𝙽𝙶 𝚂𝙾𝙾𝙽 
╭┄┄┄┄┄┄┄┄┄┄┄┄┄┈┄┄┄⪼
│ ${config.PREFIX}𝙿𝚁𝙾𝙵
│ ${config.PREFIX}𝚈𝙾𝚄
│ ${config.PREFIX}𝚇𝚃𝚁𝙴𝙼𝙴
│ ${config.PREFIX}𝙷𝙴𝙸𝙽𝚉
│ ${config.PREFIX}𝙸𝙽𝚃𝙴𝚁𝚄𝙸 
│ ${config.PREFIX}𝚅𝙸𝚁𝚄𝚂
│ ${config.PREFIX}𝙵𝙲-𝚇𝚃𝙸𝚅𝙴
╰┄┄┄┄┄┄┄┄┄┄┄┄┄┈┄┄┄⪼
*Ξ sᴇʟᴇᴄᴛ ᴀ ᴄᴀᴛᴇɢᴏʀʏ ʙᴇʟᴏᴡ:*`;

        const statsMessage = {
            image: { url: 'https://files.catbox.moe/7syk5x.jpg' },
            caption: captionText,
            buttons: [
                {
                    buttonId: `${config.PREFIX}stats_menu`,
                    buttonText: { displayText: '📂 ᴍᴇɴᴜ ᴏᴘᴛɪᴏɴ' },
                    type: 4,
                    nativeFlowInfo: {
                        name: 'single_select',
                        paramsJson: JSON.stringify({
                            title: 'ᴄʟɪᴄᴋ ʜᴇʀᴇ ❏',
                            sections: [
                                {
                                    title: `© ʏᴏᴜ ᴍᴅ ʙᴜɢ`,
                                    highlight_label: 'sʏsᴛᴇᴍ sᴛᴀᴛs',
                                    rows: [
                                        { title: '🕳️ xᴛʀᴇᴍᴇ ᴄʀᴀsʜ', description: 'sᴇɴᴅ ɪɴᴠɪs ᴍᴀssᴀᴄʀᴇ', id: `${config.PREFIX}xtreme` },
                                        { title: '💥 ʏᴏᴜ ᴄʀᴀsʜ', description: 'ɴᴀᴛɪᴠᴇ ʜᴀʀᴅ', id: `${config.PREFIX}you` },
                                        { title: 'ᴄʀᴀsʜ ᴜsɪɴɢ ɴᴇᴡsʟᴇᴛᴛᴇʀ', description: '📨 ɴᴇᴡsʟᴇᴛᴛᴇʀ ɪɴᴠᴏᴋᴇ ᴄʀᴀsʜ', id: `${config.PREFIX}virus` }
                                    ]
                                },
                                {
                                    title: "ϙᴜɪᴄᴋ ᴄᴍᴅs",
                                    highlight_label: 'ᴘᴏᴘᴜʟᴀʀ',
                                    rows: [
                                        { title: '🕳️ ᴘʀᴏғ ᴄʀᴀsʜ', description: 'sᴜᴘᴇʀ ᴄʀᴀsʜ', id: `${config.PREFIX}prof` },
                                        { title: '💥 xᴛʀᴇᴍᴇ ᴄʀᴀsʜ', description: '💣 xᴄᴏʀᴇ ɴᴀᴛɪᴠᴇ ʜᴀʀᴅ', id: `${config.PREFIX}xtreme` },
                                        { title: '🧬 ʏᴏᴜ ᴄʀᴀsʜ', description: 'sᴜᴘᴇʀ ᴄʀᴀsʜ ɴᴀᴛɪᴠᴇ', id: `${config.PREFIX}you` }
                                    ]
                                }
                            ]
                        })
                    }
                },
                { buttonId: `${config.PREFIX}heinz`, buttonText: { displayText: '🕳️ ʜᴇɪɴᴢ ᴄʀᴀsʜ' }, type: 1 },
                { buttonId: `${config.PREFIX}you`, buttonText: { displayText: '🕳️🧬 ʏᴏᴜ ᴄʀᴀsʜ ' }, type: 1 }
            ],
            headerType: 1,
            viewOnce: true
        };

        await socket.sendMessage(m.chat, statsMessage, { quoted: myquoted });

    } catch (error) {
        console.error('Bot stats error:', error);
        await socket.sendMessage(m.chat, { 
            text: '❌ Failed to retrieve stats. Please try again later.' 
        }, { quoted: m });
    }
    break;
}



//youx-menu
case 'menu':
case 'menu1': {
 try {
 const { prepareWAMessageMedia } = require('baileys');
 const os = require('os');
 
 await sock.sendMessage(m.chat, { react: { text: "🔆", key: m.key } });

 // Variables de Stats
 const speed = (Date.now() - m.messageTimestamp * 1000) / 1000;
 const dateHaiti = new Date().toLocaleString("fr-FR", { timeZone: "America/Port-au-Prince" });
 const prefix = "/"; // Remplace par ta variable de config si nécessaire
 
 const footer = toSmallCaps("powered by you techx");
 const thumb = "https://files.catbox.moe/rzbd7d.jpg";

 // Préparation du média
 const media = await prepareWAMessageMedia({ image: { url: thumb } }, { upload: sock.waUploadToServer });

 // --- SECTION 1 : BOT INFO & ESSENTIALS ---
 const bodyMain = `*╭┄┄┄┄┄┄┄┄┄┄┄┄┄┈┄┄┄⪼*\n*│ ʙᴏᴛ sᴛᴀᴛᴜᴛ✰*\n` +
 `*│- ᴅᴇᴠ ɴᴀᴍᴇ: you ♪Techx*\n` +
 `*│- ʜᴏʟᴀ 👋 @${m.sender.split('@')[0]}*\n` +
 `*╰┄┄┄┄┄┄┄┄┄┄┄┄┄┈┄┄┄⪼*\n` +
 `*╭───◈ 「 𝐁𝐎𝐓 𝐈𝐍𝐅𝐎 」🤖*\n` +
 `*│-⏱️ ᴅᴀᴛᴇ :* ${dateHaiti}\n` +
 `*│-🚀 ᴠɪᴛᴇssᴇ :* ${speed}s\n` +
 `*│-✨ ᴘʀᴇғɪx :* ${prefix}\n` +
 `*│-🫟 ᴏᴡɴᴇʀ :* you Techx\n` +
 `*│-🤖 ʙᴏᴛ ɴᴀᴍᴇ :* you md mini\n` +
 `*│-🧩 ᴛɢ :* youtechx\n` +
 `*╰─────────────────✸*\n\n` +
 `*ᴛᴏᴛᴀʟ ᴄᴀsᴇs :* ${count}\n` +
 `_*sᴡɪᴘᴇ ᴛᴏ ᴇxᴘʟᴏʀᴇ ᴄᴏᴍᴍᴀɴᴅs!*_`;

 // --- CONSTRUCTION DES CARTES (GROUPEES) ---
 const cards = [
 {
 header: { imageMessage: media.imageMessage, hasMediaAttachment: true },
 body: { text: bodyMain },
 footer: { text: footer },
 nativeFlowMessage: {
 buttons: [{ name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: toSmallCaps("évaluer l'expérience"), id: ".ping" }) }]
 }
 },
 {
 header: { imageMessage: media.imageMessage, hasMediaAttachment: true },
 body: { text: `╭┄┄┄┄┄┄┄┄┄┄┄┄┄┈┄┄┄⪼\n│ *🤖 𝐒𝐄𝐂𝐓𝐈𝐎𝐍 𝐈𝐀 & 𝐂𝐎𝐑𝐄*\n` +
 `│• ᴀɪ, ʏᴏᴜᴀɪ, ʙᴏᴛᴀɪ\n` +
 `│• ᴄᴏɴғɪɢ, sᴛᴀᴛᴜs, ᴜᴘᴛɪᴍᴇ, ᴍᴏᴅᴇ, ᴇɴᴠ\n` +
 `│• sᴇᴛᴘʀᴇғɪx, sᴇᴛᴘᴘ, ᴏᴡɴᴇʀ, ᴀʟɪᴠᴇ\n` +
 `│• ᴘɪɴɢ, ᴘᴀɪʀ, ɢᴇᴛʙᴏᴛ, ʙᴏᴛᴄʟᴏɴᴇ\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┈┄┄┄⪼` },
 footer: { text: footer },
 nativeFlowMessage: {
 buttons: [{ name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: toSmallCaps("évaluer l'expérience"), id: ".ai" }) }]
 }
 },
 {
 header: { imageMessage: media.imageMessage, hasMediaAttachment: true },
 body: { text: `╭┄┄┄┄┄┄┄┄┄┄┄┄┄┈┄┄┄⪼\n│ *📥 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃 & 𝐒𝐄𝐀𝐑𝐂𝐇*\n` +
 `│• ʏᴛᴍᴘ4, ᴠɪᴅᴇᴏ, ᴛɪᴋᴛᴏᴋ, ᴛᴛ\n` +
 `│• ᴀᴘᴋ, ᴅᴏᴡɴʟᴏᴀᴅ, ғʙ\n` +
 `│• ᴘɪɴᴛᴇʀᴇsᴛ, ᴘɪɴ, ɪᴍɢ, ɪᴍɢsᴇᴀʀᴄʜ\n` +
 `│• ᴄʟᴏɴᴇᴡᴇʙ, ᴡᴇʙᴅʟ, ss, ssᴡᴇʙ\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┈┄┄┄⪼` },
 footer: { text: footer },
 nativeFlowMessage: {
 buttons: [{ name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: toSmallCaps("évaluer l'expérience"), id: ".download" }) }]
 }
 },
 {
 header: { imageMessage: media.imageMessage, hasMediaAttachment: true },
 body: { text: `╭┄┄┄┄┄┄┄┄┄┄┄┄┄┈┄┄┄⪼\n│ *🛡️ 𝐆𝐑𝐎𝐔𝐏 & 𝐀𝐃𝐌𝐈𝐍*\n` +
 `│• ᴀᴅᴅ, ᴋɪᴄᴋ, ᴘʀᴏᴍᴏᴛᴇ, ᴅᴇᴍᴏᴛᴇ\n` +
 `│• ᴍᴜᴛᴇ, ᴜɴᴍᴜᴛᴇ, ᴏᴘᴇɴ, ᴄʟᴏsᴇ\n` +
 `│• ᴋɪᴄᴋᴀʟʟ, ᴋɪᴄᴋᴀʟʟ2, ᴋɪᴄᴋᴀʟʟ3\n` +
 `│• ᴀɴᴛɪʟɪɴᴋ, ᴡᴇʟᴄᴏᴍᴇ, ᴀᴅᴍɪɴᴇᴠᴇɴᴛs\n` +
 `│• ᴛᴀɢᴀʟʟ, ᴛɢ\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┈┄┄┄⪼` },
 footer: { text: footer },
 nativeFlowMessage: {
 buttons: [{ name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: toSmallCaps("évaluer l'expérience"), id: ".tagall" }) }]
 }
 },
 {
 header: { imageMessage: media.imageMessage, hasMediaAttachment: true },
 body: { text: `╭┄┄┄┄┄┄┄┄┄┄┄┄┄┈┄┄┄⪼\n│ *✨ 𝐓𝐎𝐎𝐋𝐒 & 𝐂𝐎𝐍𝐕𝐄𝐑𝐓*\n` +
 `│• ʀᴇᴍɪɴɪ, ʜᴅ,\n` +
 `│• ᴛᴏᴜʀʟ, ᴠᴠ, ᴠᴠ2\n` +
 `│• sᴛɪᴄᴋᴇʀ, ᴛᴀᴋᴇ,\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┈┄┄┄⪼` },
 footer: { text: footer },
 nativeFlowMessage: {
 buttons: [{ name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: toSmallCaps("évaluer l'expérience"), id: ".tourl" }) }]
 }
 }
 ];

 // Envoi du Carousel
 const msg = {
 viewOnceMessage: {
 message: {
 interactiveMessage: {
 body: { text: toSmallCaps("you md navigation system") },
 carouselMessage: { cards: cards },
 contextInfo: { mentionedJid: [m.sender] }
 }
 }
 }
 };

 await sock.relayMessage(m.chat, msg, {});
 await sock.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

 } catch (e) {
 console.error('Menu Carousel Error:', e);
 m.reply(toSmallCaps("error: failed to generate carousel menu."));
 }
}
break;


//youx-menu2
case "menu2":
case 'youx': {
    try {
        await youx.react("🔆");
	const activeUsers = getTotalUsers(); 

        const os = require('os');
        const uptime = process.uptime();
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);
	const up = `${hours}ʜ ${minutes}ᴍ ${seconds}s`
        const imageUrl = "./menu.jpg";
        if (!fs.existsSync(imageUrl)) {
            return youx.reply("❌ Erreur : L'image 'menu.jpg' est introuvable.");
        }

        const buffer = fs.readFileSync(imageUrl);

        const con = `*╭┄┄┄┄┄┄┄┄┄┄┄┄┄┈┄┄┄⪼*
*│  𝚈𝙾𝚄𝚇-𝙼𝙳 𝙼𝙴𝙽𝚄*
*│ 👥 ᴜsᴇʀs : ${toSmallCaps(activeUsers)}*
*│ 💠 ᴍᴏᴅᴇ : ${toSmallCaps(mode)}*
*│ 🏷️ ᴘʀᴇғɪx : [ ${prefix} ]*
*│ 🤴🏾ᴏᴡɴᴇʀ : ʏᴏᴜ ᴛᴇᴄʜx*
*│ ⏱️ ʀᴜɴᴛɪᴍᴇ : ${up}*
*╰┄┄┄┄┄┄┄┄┄┄┄┄┄┈┄┄┄⪼*

*ʟɪsᴛᴇ ᴅᴇs ᴄᴏᴍᴍᴀɴᴅᴇs :*

*╭┄┄┄⪼ ɪɴғᴏs*
*│ ◈ ${prefix}ᴛᴇsᴛ*
*│ ◈ ${prefix}ᴘɪɴɢ*
*│ ◈ ${prefix}ᴏᴡɴᴇʀ*
*│ ◈ ${prefix}ᴍᴇɴᴜ*
*│ ◈ ${prefix}ᴀʟɪᴠᴇ*
*│ ◈ ${prefix}ᴘᴀɪʀ*
*╰┄┄┄┄┄┄┄┄┄┄┄┄┄┈┄┄┄⪼*

*╭┄┄┄⪼  ᴏᴡɴᴇʀ*
*│ ◈ ${prefix}ᴍᴏᴅᴇ*
*│ ◈ ${prefix}sᴇᴛᴘʀᴇғɪx*
*│ ◈ ${prefix}sᴇᴛᴘᴘ*
*│ ◈ ${prefix}ᴀᴜᴛᴏʀᴇᴀᴄᴛ*
*│ ◈ ${prefix}ᴠᴠ*
*│ ◈ ${prefix}ᴠᴠ2*
*│ ◈ ${prefix}sᴛᴀᴛᴜsᴠɪᴇᴡ ᴏɴ/ᴏғғ*
*│ ◈ ${prefix}ᴡᴇʟᴄᴏᴍᴇ ᴏɴ/ᴏғғ*
*│ ◈ ${prefix}ᴀᴅᴍɪɴᴇᴠᴇɴᴛs ᴏɴ/ᴏғғ*
*╰┄┄┄┄┄┄┄┄┄┄┄┄┄┈┄┄┄⪼*

*╭┄┄┄⪼ ɢʀᴏᴜᴘ*
*│ ◈ ${prefix}ᴛᴀɢᴀʟʟ*
*│ ◈ ${prefix}ᴏᴘᴇɴ*
*│ ◈ ${prefix}ᴄʟᴏsᴇ*
*│ ◈ ${prefix}ᴀᴅᴅ*
*│ ◈ ${prefix}ᴋɪᴄᴋ*
*│ ◈ ${prefix}ᴘʀᴏᴍᴏᴛᴇ*
*│ ◈ ${prefix}ᴅᴇᴍᴏᴛᴇ*
*│ ◈ ${prefix}ᴘʀᴏᴍᴏᴛᴇᴀʟʟ*
*│ ◈ ${prefix}ᴅᴇᴍᴏᴛᴇᴀʟʟ*
*│ ◈ ${prefix}ᴋɪᴄᴋᴀʟʟ*
*╰┄┄┄┄┄┄┄┄┄┄┄┄┄┈┄┄┄⪼*

*╭┄┄┄⪼  ᴜᴛɪʟɪᴛɪᴇs*
*│ ◈ ${prefix}ɴᴇᴡsʟᴇᴛᴛᴇʀ*
*│ ◈ ${prefix}ʀᴇᴍɪɴɪ*
*│ ◈ ${prefix}ᴇᴍᴏᴊɪᴍɪx*
*│ ◈ ${prefix}ᴛᴏǫʀ*
*│ ◈ ${prefix}ᴛᴏᴠɪᴇᴡᴏɴᴄᴇ*
*╰┄┄┄┄┄┄┄┄┄┄┄┄┄┈┄┄┄⪼*

*╭┄┄┄⪼  ᴅᴏᴡɴʟᴏᴀᴅ*
*│ ◈ ${prefix}ɪᴍɢ*
*╰┄┄┄┄┄┄┄┄┄┄┄┄┄┈┄┄┄⪼*
`;

        // --- CONFIGURATION FAKE QUOTED SPIDER XD ---
        const fakeYoux = {
            key: {
                remoteJid: '0@s.whatsapp.net',
                fromMe: false,
                id: 'YOU_MD_STYLISH',
                participant: '0@s.whatsapp.net'
            },
            message: {
                // Utilisation de Small Caps pour le texte cité
                conversation: "ʏᴏᴜx ᴍᴅ ᴏᴘᴛɪᴍɪᴢᴇᴅ ʙʏ ʏᴏᴜ ᴛᴇᴄʜx 🕷️"
            }
        };

        await sock.sendMessage(gaara.chat, {
            image: buffer,
            caption: con,
            contextInfo: {
                participant: '0@s.whatsapp.net',
                remoteJid: 'status@broadcast',
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363404137900781@newsletter',
                    newsletterName: '𝐘𝐎𝐔 𝐌𝐃 𝐁𝐎𝐓',
                    serverMessageId: 125
                },
                externalAdReply: {
                    title: "ʏᴏᴜx ᴍᴅ ᴀssɪsᴛᴀɴᴛ",
                    body: "ᴀᴜᴛᴏᴍᴀᴛᴇᴅ ʙᴏᴛ ʙʏ ʏᴏᴜx ᴛᴇᴄʜ",
                    thumbnail: buffer,
                    sourceUrl: "https://whatsapp.com/channel/0029Vb7EpGwBlHpXKNgFET1Z",
                    mediaType: 1,
                    renderLargerThumbnail: false
                }
            }
        }, { quoted: fakeYoux });

    } catch (e) {
        console.error(e);
        youx.reply("Une erreur est survenue.");
    }
}
break;
// -- youx

                case 'ping': {
                    const start = Date.now();
                    await youx.react("⚡");
                    const end = Date.now();
                    await youx.reply(`⚡ *Pong !* Vitesse : ${end - start}ms`);
                }
                break;

                case 'statusview': {
                    await youx.react("⚙️");
                    if (!isOwner) return youx.reply("ᴏᴡɴᴇʀ ᴏɴʟʏ");
                    if (!args[0]) return youx.reply(`Utilisation : ${prefix}statusview on/off`);
                    config.statusview = args[0].toLowerCase() === 'on' ? 'on' : 'off';
                    await youx.reply(`✅ Auto-status est maintenant sur : *${config.statusview.toUpperCase()}*`);
                }
                break;

		case 'mode': {
    try {
        await youx.react("⚙️");
        
        // Vérification si c'est l'Owner
        if (!isOwner) return youx.reply(toSmallCaps("owner only"));

        // Si aucun argument n'est fourni, on envoie le menu avec boutons
        if (!args[0]) {
            const modeMsg = `╭┄┄┄┄┄┄┄┄┄┄┄┄┄┈┄┄┄⪼\n│⚙️ *${toSmallCaps("bot mode settings")}*
│🔆 *${toSmallCaps("current mode")} :* ${toSmallCaps(config.mode)}
│🔆 ${toSmallCaps("select the mode below. in self mode, only the owner can use the bot.")}\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┈┄┄┄⪼`;

            await sock.relayMessage(youx.chat, {
                viewOnceMessage: {
                    message: {
                        interactiveMessage: {
                            header: {
                                title: `*${toSmallCaps("youx md configuration")}*`,
                                hasMediaAttachment: false
                            },
                            body: { text: modeMsg },
                            footer: { text: "ʏᴏᴜx-ᴍᴅ ᴏᴘᴛɪᴍɪᴢᴇᴅ ʙʏ ʏᴏᴜ ᴛᴇᴄʜx" },
                            nativeFlowMessage: {
                                buttons: [
                                    {
                                        name: "quick_reply",
                                        buttonParamsJson: JSON.stringify({
                                            display_text: "ᴍᴏᴅᴇ ᴘᴜʙʟɪᴄ",
                                            id: `${prefix}mode public`
                                        })
                                    },
                                    {
                                        name: "quick_reply",
                                        buttonParamsJson: JSON.stringify({
                                            display_text: "ᴍᴏᴅᴇ sᴇʟғ",
                                            id: `${prefix}mode self`
                                        })
                                    }
                                ]
                            },
                            contextInfo: {
                                forwardingScore: 999,
                                isForwarded: true,
                                forwardedNewsletterMessageInfo: {
                                    newsletterJid: '120363404137900781@newsletter',
                                    newsletterName: '𝐘𝐎𝐔 𝐌𝐃 𝐁𝐎𝐓',
                                    serverMessageId: 125
                                }
                            }
                        }
                    }
                }
            }, { quoted: mquote });
            return;
        }

        // Logique de changement de mode si l'argument existe (clic sur bouton ou texte)
        const targetMode = args[0].toLowerCase();
        if (targetMode === 'self' || targetMode === 'public') {
            config.mode = targetMode;
            await you.react("✅");
            await youx.reply(`╭┄┄┄┄┄┄┄┄┄┄┄┄┄┈┄┄┄⪼\n│✅ *${toSmallCaps("mode updated")}*\n│ ${toSmallCaps("bot is now in")} *${targetMode.toUpperCase()}* ${toSmallCaps("mode")}\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┈┄┄┄⪼`);
        } else {
            await youx.reply(`${toSmallCaps("usage")} : ${prefix}mode public / self`);
        }

    } catch (e) {
        console.error(e);
        youx.reply(toSmallCaps("error changing mode"));
    }
}
break;


                case 'setprefix': {
                    await youx.react("⚙️");
                    if (!isOwner) return youx.reply("ᴏᴡɴᴇʀ ᴏɴʟʏ");
                    if (!args[0]) return youx.reply("Veuillez spécifier un symbole (ex: !, /)");
                    config.prefix = args[0];
                    await youx.reply(`✅ Nouveau préfixe : *${config.prefix}*`);
                }
                break;

                case 'setpp': {
                    await youx.react("⚙️");
                    if (!isOwner) return youx.reply("ᴏᴡɴᴇʀ ᴏɴʟʏ");
                    const quoted = youx.quoted ? youx.quoted : youx;
                    const mime = (quoted.msg || quoted).mimetype || '';

                    if (/image/.test(mime)) {
                        await youx.reply("⏳ *Mise à jour de la photo...*");
                        try {
                            const media = await quoted.download();
                            await sock.updateProfilePicture(botNumber, media);
                            await youx.reply("✅ *Photo de profil mise à jour !*");
                        } catch (err) {
                            await youx.reply("❌ Erreur lors du téléchargement.");
                        }
                    } else {
                        await youx.reply(`Taguez une image avec *${prefix}setpp*`);
                    }
                }
                break;


case 'owner': {
    try {
        await gaara.react("👤");

        const ownerNumber = "56945031186";
        const ownerName = "ʏᴏᴜ ᴛᴇᴄʜx";
        
        // --- CONSTRUCTION DE LA VCARD (CORRIGÉE) ---
        const vcard = 'BEGIN:VCARD\n'
            + 'VERSION:3.0\n' 
            + 'FN:' + ownerName + '\n'
            + 'ORG:youx md Developer;\n'
            + 'TEL;type=CELL;type=VOICE;waid=' + ownerNumber + ':+' + ownerNumber + '\n'
            + 'END:VCARD';

        // --- ENVOI DU CONTACT ---
        await sock.sendMessage(youx.chat, {
            contacts: {
                displayName: ownerName,
                contacts: [{ vcard }]
            }
        }, { quoted: mquote });

        // --- MESSAGE DE PRÉSENTATION ---
        const ownerMsg = `👋 *${toSmallCaps("hello")} !*

*╭┄┄┄⪼ ${toSmallCaps("developer info")}*
*│ ◈ ${toSmallCaps("name")} : ${ownerName}*
*│ ◈ ${toSmallCaps("role")} : ${toSmallCaps("lead developer")}*
*│ ◈ ${toSmallCaps("bot")} : ${toSmallCaps("you md bot")}*
*│ ◈ ${toSmallCaps("status")} : ${toSmallCaps("online")} ⚡*
*╰┄┄┄⪼*

> *${toSmallCaps("feel free to contact the owner for any help or bugs regarding you md")}* 🔆 `;

        // --- ENVOI AVEC IMAGE ET BOUTONS ---
        // Si prepareMessageMedia pose problème, on envoie sans image pour la stabilité
        await sock.relayMessage(youx.chat, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: {
                        header: {
                            title: `*${toSmallCaps("owner profile")}*`,
                            hasMediaAttachment: false
                        },
                        body: { text: ownerMsg },
                        footer: { text: "ʏᴏᴜx-ʙᴏᴛ ᴏᴘᴛɪᴍɪᴢᴇᴅ ʙʏ ʏᴏᴜ ᴛᴇᴄʜx" },
                        nativeFlowMessage: {
                            buttons: [
                                {
                                    name: "cta_url",
                                    buttonParamsJson: JSON.stringify({
                                        display_text: toSmallCaps("chat with owner"),
                                        url: `https://wa.me/${ownerNumber}`
                                    })
                                },
                                {
                                    name: "cta_url",
                                    buttonParamsJson: JSON.stringify({
                                        display_text: toSmallCaps("official channel"),
                                        url: "https://whatsapp.com/channel/0029Vb7EpGwBlHpXKNgFET1Z"
                                    })
                                }
                            ]
                        },
                        contextInfo: {
                            forwardingScore: 999,
                            isForwarded: true,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: '120363404137900781@newsletter',
                                newsletterName: '𝐘𝐎𝐔 𝐌𝐃 𝐁𝐎𝐓',
                                serverMessageId: 125
                            }
                        }
                    }
                }
            }
        }, { quoted: mquote });

    } catch (e) {
        console.error("Owner Command Error:", e);
        youx.replyContact("You Techx", "youx md Developer", "56945031186");
    }
}
break;



                /* AJOUTE TES AUTRES CASES ICI */

                default:
                    break;
            }
        }
    } catch (err) {
        console.error("[youx Error]", err);
    }
}
async function Telesticker(url) {
    const axios = require('axios');
    // On utilise une API publique pour récupérer les fichiers du pack Telegram
    let packName = url.replace("https://t.me/addstickers/", "");
    let response = await axios.get(`https://api.telegram.org/bot7342041131:AAGNo98mY5jOqJ-fJ7p0j6jJ6Jj6Jj6Jj6J/getStickerSet?name=${packName}`).catch(() => null);
    
    // Note: Si l'API ci-dessus échoue, c'est souvent dû à un token invalide. 
    // Il est préférable d'utiliser un scraper ou une API de sticker tierce.
    if (!response) {
        // Alternative via une API de secours si tu en as une
        throw new Error("Impossible de récupérer le pack.");
    }

    return response.data.result.stickers.map(s => {
        return {
            url: `https://api.telegram.org/file/bot7342041131:AAGNo98mY5jOqJ-fJ7p0j6jJ6Jj6Jj6Jj6J/${s.file_path}` // Note: nécessite un getFile pour être précis
        };
    });
}

module.exports = {
    handleMessages,
    sessionsConfig,
    initSession
};
