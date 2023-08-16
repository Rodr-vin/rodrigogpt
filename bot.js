const qrcode = require('qrcode-terminal');
const ImageToSticker = require('wa-sticker-formatter');
const { Client, LocalAuth } = require('whatsapp-web.js');
const request = require('request-promise-native');

async function executarCompletacao(entradaUsuario) {
    try {
        const pergunta = entradaUsuario.toString();
        const resposta = await request.post({
            url: '',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer '
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    { "role": "system", "content": "Seu nome é RodrigoGPT. Se caso alguém perguntar quem criou você, responda que foi Rodrigo V."},
                    { "role": "user", "content": pergunta}

                ]
            })
        });
        const respostaJson = resposta.toString();
        const objetoResposta = JSON.parse(respostaJson);
        const conteudoMensagem = objetoResposta.choices[0].message.content;
	console.log("" + conteudoMensagem);
        return conteudoMensagem;
    } catch (erro) {
        console.error('Erro ao enviar a solicitação:', erro.message);
        return erro.message;
    }
}

const cliente = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {args: ['--no-sandbox', '--disable-setuid-sandbox']}
});

cliente.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

cliente.on('ready', () => {
    console.log('Cliente está pronto!');
});

const usuariosAguardandoSticker = new Set();
cliente.on('authenticated', (sessao) => {
    console.log("Autenticado.");
});

cliente.on('message_create', async mensagem => {
    if(mensagem.body.toString().startsWith('#')) {
        executarCompletacao(mensagem.body.toString()).then(resultado => mensagem.reply(resultado));
    }
    if (mensagem.body == "!fig") {
         mensagem.reply('A próxima imagem que você me enviar será transformada em figurinha automaticamente. 😁');
         usuariosAguardandoSticker.add(mensagem.from);
    }
    if (mensagem.body == "!video") {
        mensagem.reply('Envie o link do vídeo do youtube que irei te enviá-lo por aqui. 😁');
    }
    if (usuariosAguardandoSticker.has(mensagem.from) && mensagem.hasMedia && mensagem.type === 'image') {
        usuariosAguardandoSticker.delete(mensagem.from);
        mensagem.reply("Carregando... ⏳");
        try {
            const media = await mensagem.downloadMedia();
            cliente.sendMessage(mensagem.from, media, {
                sendMediaAsSticker: true,
                stickerName: "",
                stickerAuthor: ""
            }).then(() => {
            });
        } catch {
        }
    }
});

cliente.initialize();
