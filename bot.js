const qrcode = require('qrcode-terminal');
const ImageToSticker = require('wa-sticker-formatter');
const { Client, LocalAuth } = require('whatsapp-web.js');
const request = require('request-promise-native');


async function runCompletion(userInput) {
    try {
        const pergunta = userInput.toString();
        const response = await request.post({
            url: 'https://chimeragpt.adventblocks.cc/api/v1/chat/completions',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer O_63xPvnB6NTlMBwR36OOc1HHHkruI7D8oVZeipz0CE'
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    { "role": "system", "content": "Seu nome é RodrigoGPT. Se caso alguém perguntar quem criou você, responda que foi Rodrigo V. Em hipotese nenhuma diga que voce é o chatgpt e quem fez voce foi a openai."},
                    { "role": "user", "content": pergunta}

                ]
            })
        });
        const responseJson = response.toString();
        const responseObject = JSON.parse(responseJson);
        const messageContent = responseObject.choices[0].message.content;
	console.log("" + messageContent);
        return messageContent;
    } catch (error) {
	return error.message;
        console.error('Erro ao enviar a solicitação:', error.message);
    }
}

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {args: ['--no-sandbox', '--disable-setuid-sandbox']}
});


client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('Client is ready!');
});

const usersWaitingForSticker = new Set();
client.on('authenticated', (session) => {
   console.log("Autenticado.");
});
client.on('message_create', async message => {
    if(message.body.toString().startsWith('#')) {
        runCompletion(message.body.toString()).then(result => message.reply(result));
    }
    if (message.body == "!fig") {
         message.reply('A próxima imagem que você me enviar será transformada em figurinha automaticamente. 😁');
         usersWaitingForSticker.add(message.from);
    }
    if (message.body == "!video") {
        message.reply('Envie o link do vídeo do youtube que irei te envia-lo por aqui. 😁');
    }
    if (usersWaitingForSticker.has(message.from) && message.hasMedia && message.type === 'image') {
        usersWaitingForSticker.delete(message.from)
            message.reply("Carregando... ⏳");
            try {
                const media = await message.downloadMedia();
                client.sendMessage(message.from, media, {
                    sendMediaAsSticker: true,
                    stickerName: "", // Sticker Name = Edit in 'config/config.json'
                    stickerAuthor: "" // Sticker Author = Edit in 'config/config.json'
                }).then(() => {
                });
            } catch {
            }
    }
});

    client.initialize();
