const { 
    Client, 
    GatewayIntentBits, 
    ChannelType, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    ModalBuilder, 
    TextInputBuilder, 
    TextInputStyle, 
    EmbedBuilder, 
    PermissionFlagsBits 
} = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

client.once('clientReady', () => {
    console.log(`Bot BMRP online como: ${client.user.tag}`);
});

// 1. REGISTRO DE ENTRADA E SAÍDA DE MEMBROS
client.on('guildMemberAdd', async (member) => {
    const canalBoasVindas = member.guild.channels.cache.find(c => c.name.includes('boas-vindas') || c.name.includes('👋'));
    if (canalBoasVindas) {
        const embedBoasVindas = new EmbedBuilder()
            .setTitle(`🎉 BEM-VINDO(A) AO BMRP!`)
            .setDescription(`Olá ${member}! Seja muito bem-vindo(a) ao nosso servidor.\n\nAproveite a cidade e divirta-se!`)
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .setColor(0x00FF00)
            .setTimestamp();

        await canalBoasVindas.send({ content: `Bem-vindo(a) ${member}!`, embeds: [embedBoasVindas] });
    }

    const canalLogsGeral = member.guild.channels.cache.find(c => c.name === 'logs-geral' || c.name === 'logs-servidor' || c.name === 'entradas');
    if (canalLogsGeral) {
        await canalLogsGeral.send(`📥 **ENTRADA:** O usuário **${member.user.tag}** (\`${member.id}\`) entrou no servidor.`);
    }
});

client.on('guildMemberRemove', async (member) => {
    const canalSaida = member.guild.channels.cache.find(c => c.name.includes('saida') || c.name.includes('saídas') || c.name.includes('🚪'));
    if (canalSaida) {
        const embedSaida = new EmbedBuilder()
            .setTitle(`🚪 MEMBRO SAIU DO SERVIDOR`)
            .setDescription(`O usuário **${member.user.tag}** (\`${member.id}\`) deixou a cidade.`)
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .setColor(0xFF0000)
            .setTimestamp();

        await canalSaida.send({ embeds: [embedSaida] });
    }

    const canalLogsGeral = member.guild.channels.cache.find(c => c.name === 'logs-geral' || c.name === 'logs-servidor');
    if (canalLogsGeral) {
        await canalLogsGeral.send(`📤 **SAÍDA:** O usuário **${member.user.tag}** (\`${member.id}\`) saiu do servidor.`);
    }
});

// 2. COMANDOS DE TEXTO DA STAFF E ROTEAMENTO DE COMPROVANTES
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    // Redireciona comprovantes/prints enviados nas abas de empresas para o canal de logs correto
    if (message.attachments.size > 0 && message.channel.name.startsWith('empresa-')) {
        const canalNovasEmpresas = message.guild.channels.cache.find(c => c.name === 'logs-novas-empresas');
        if (canalNovasEmpresas) {
            const anexo = message.attachments.first();
            await canalNovasEmpresas.send({
                content: `📸 **COMPROVANTE / PRINT enviado no canal <#${message.channel.id}> por <@${message.author.id}>:**`,
                files: [anexo.url]
            });
        }
    }

    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return;

    // COMANDOS DE SETUP DE LOGS ESPECÍFICOS (Categoria Auditoria Staff)
    if (message.content === '!setup-logs-solicitacoes') {
        const guild = message.guild;
        let catStaff = guild.channels.cache.find(c => c.name === '🔒 AUDITORIA STAFF' && c.type === ChannelType.GuildCategory);
        if (!catStaff) {
            catStaff = await guild.channels.create({ name: '🔒 AUDITORIA STAFF', type: ChannelType.GuildCategory });
        }

        const canal = await guild.channels.create({
            name: 'logs-solicitacoes-empresas',
            type: ChannelType.GuildText,
            parent: catStaff.id,
            permissionOverwrites: [{ id: guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] }]
        });

        return message.reply({ content: `✅ Canal de solicitações criado com sucesso: ${canal}`, ephemeral: true });
    }

    if (message.content === '!setup-logs-novas-empresas') {
        const guild = message.guild;
        let catStaff = guild.channels.cache.find(c => c.name === '🔒 AUDITORIA STAFF' && c.type === ChannelType.GuildCategory);
        if (!catStaff) {
            catStaff = await guild.channels.create({ name: '🔒 AUDITORIA STAFF', type: ChannelType.GuildCategory });
        }

        const canal = await guild.channels.create({
            name: 'logs-novas-empresas',
            type: ChannelType.GuildText,
            parent: catStaff.id,
            permissionOverwrites: [{ id: guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] }]
        });

        return message.reply({ content: `✅ Canal de novas empresas criado com sucesso na categoria de auditoria: ${canal}`, ephemeral: true });
    }

    if (message.content === '!setup-logs-denuncias') {
        const guild = message.guild;
        let catStaff = guild.channels.cache.find(c => c.name === '🔒 AUDITORIA STAFF' && c.type === ChannelType.GuildCategory);
        if (!catStaff) {
            catStaff = await guild.channels.create({ name: '🔒 AUDITORIA STAFF', type: ChannelType.GuildCategory });
        }

        const canal = await guild.channels.create({
            name: 'logs-denuncias',
            type: ChannelType.GuildText,
            parent: catStaff.id,
            permissionOverwrites: [{ id: guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] }]
        });

        return message.reply({ content: `✅ Canal de logs de denúncias criado: ${canal}`, ephemeral: true });
    }

    if (message.content === '!setup-chat') {
        const guild = message.guild;
        let catChat = guild.channels.cache.find(c => c.name === '💬 BATE-PAPO' && c.type === ChannelType.GuildCategory);
        if (!catChat) {
            catChat = await guild.channels.create({ name: '💬 BATE-PAPO', type: ChannelType.GuildCategory });
        }

        const canalGeral = await guild.channels.create({
            name: 'geral-bate-papo',
            type: ChannelType.GuildText,
            parent: catChat.id
        });

        return message.reply(`✅ Categoria e canal de bate-papo criados com sucesso: ${canalGeral}`);
    }

    if (message.content.startsWith('!fechar-empresa ')) {
        const nomeAlvo = message.content.replace('!fechar-empresa ', '').trim().toLowerCase();
        const nomeCanalFormatado = `empresa-${nomeAlvo.replace(/ /g, '-')}`;

        const canalEmpresa = message.guild.channels.cache.find(c => c.name === nomeCanalFormatado);
        if (!canalEmpresa) {
            return message.reply(`❌ Não encontrei nenhum canal de empresa com o nome \`${nomeCanalFormatado}\`. Verifique o nome exato.`);
        }

        await message.reply(`⚠️ O canal **${canalEmpresa.name}** será excluído em 5 segundos...`);
        setTimeout(async () => {
            await canalEmpresa.delete().catch(() => {});
        }, 5000);
        return;
    }

    if (message.content.startsWith('!criar-cargo ')) {
        const nomeCargo = message.content.replace('!criar-cargo ', '');
        try {
            await message.guild.roles.create({
                name: nomeCargo,
                color: 'Random',
                reason: `Cargo criado por ${message.author.tag}`
            });
            return message.reply(`✅ Cargo **${nomeCargo}** criado com sucesso!`);
        } catch (error) {
            return message.reply('❌ Erro ao criar o cargo.');
        }
    }

    if (message.content === '!setup-cargos-geral') {
        const guild = message.guild;
        try {
            await guild.roles.create({ name: '🛡️ • Equipe Staff', color: '#ff0000', hoist: true });
            await guild.roles.create({ name: '💼 • Gerente', color: '#00ffff', hoist: true });
            await guild.roles.create({ name: '🔫 • Dono de Empresa', color: '#00ff00', hoist: true });
            await guild.roles.create({ name: '💎 • Servidor Booster', color: '#f47fff', hoist: true });

            return message.reply('✅ Cargos padrão do sistema criados com sucesso!');
        } catch (error) {
            return message.reply('❌ Erro ao criar os cargos.');
        }
    }

    if (message.content === '!setup-sorteio') {
        const guild = message.guild;
        let catSorteio = guild.channels.cache.find(c => c.name === '🎉 SORTEIOS EXCLUSIVOS' && c.type === ChannelType.GuildCategory);
        if (!catSorteio) {
            catSorteio = await guild.channels.create({ name: '🎉 SORTEIOS EXCLUSIVOS', type: ChannelType.GuildCategory });
        }

        const canalSorteio = await guild.channels.create({
            name: 'sorteios-boosters',
            type: ChannelType.GuildText,
            parent: catSorteio.id,
            permissionOverwrites: [
                { id: guild.roles.everyone.id, allow: [PermissionFlagsBits.ViewChannel], deny: [PermissionFlagsBits.SendMessages] }
            ]
        });

        return message.reply(`✅ Categoria e canal de sorteios criados: ${canalSorteio}`);
    }

    if (message.content.startsWith('!sortear ')) {
        const premio = message.content.replace('!sortear ', '');

        const embedSorteio = new EmbedBuilder()
            .setTitle('🎉 **SORTEIO EXCLUSIVO PARA BOOSTERS** 🎉')
            .setDescription(`Prêmio: **${premio}**\n\n🎁 Para participar, clique no botão abaixo!\n*⚠️ Apenas membros impulsionadores podem participar.*`)
            .setColor(0xf47fff)
            .setTimestamp();

        const btnParticipar = new ButtonBuilder()
            .setCustomId('btn_participar_sorteio')
            .setLabel('🎉 Participar do Sorteio')
            .setStyle(ButtonStyle.Success);

        const row = new ActionRowBuilder().addComponents(btnParticipar);
        const msgSorteio = await message.channel.send({ embeds: [embedSorteio], components: [row] });
        
        client.sorteios = client.sorteios || {};
        client.sorteios[msgSorteio.id] = { participantes: [], premio: premio };

        return message.delete().catch(() => {});
    }

    if (message.content === '!setup-painel') {
        const embed = new EmbedBuilder()
            .setTitle('🔫 CADASTRO DE EMPRESÁRIO DE ARMAS - BMRP')
            .setDescription('Se você é dono/gerente de uma empresa de armas, clique no botão abaixo para registrar a sua empresa.')
            .setColor(0x00FF00);

        const botao = new ButtonBuilder().setCustomId('btn_cadastrar_empresario').setLabel('📋 Cadastrar Minha Empresa').setStyle(ButtonStyle.Success);
        const row = new ActionRowBuilder().addComponents(botao);
        await message.channel.send({ embeds: [embed], components: [row] });
    }

    if (message.content === '!setup-categoria-denuncia') {
        const guild = message.guild;
        let catDenuncias = guild.channels.cache.find(c => c.name === '🚨 DENÚNCIAS DE EMPRESAS' && c.type === ChannelType.GuildCategory);
        if (!catDenuncias) {
            catDenuncias = await guild.channels.create({ name: '🚨 DENÚNCIAS DE EMPRESAS', type: ChannelType.GuildCategory });
        }

        const canalDenunciaPainel = await guild.channels.create({
            name: 'painel-denuncias',
            type: ChannelType.GuildText,
            parent: catDenuncias.id,
            permissionOverwrites: [
                { id: guild.roles.everyone.id, allow: [PermissionFlagsBits.ViewChannel], deny: [PermissionFlagsBits.SendMessages] }
            ]
        });

        const embedDenuncia = new EmbedBuilder()
            .setTitle('🏢 DENÚNCIAS DE EMPRESAS - BMRP')
            .setDescription('Caso precise registrar uma denúncia referente a outra empresa, clique no botão abaixo para abrir uma aba privada.')
            .setColor(0xFF0000);

        const btnDenuncia = new ButtonBuilder().setCustomId('btn_abrir_denuncia').setLabel('🚨 Abrir Denúncia de Empresa').setStyle(ButtonStyle.Danger);
        const row = new ActionRowBuilder().addComponents(btnDenuncia);
        await canalDenunciaPainel.send({ embeds: [embedDenuncia], components: [row] });

        await message.reply({ content: `✅ Painel de denúncias criado: ${canalDenunciaPainel}`, ephemeral: true });
    }

    if (message.content === '!setup-saida') {
        const guild = message.guild;
        const canalSaida = await guild.channels.create({
            name: '🚪-saidas',
            type: ChannelType.GuildText,
            permissionOverwrites: [
                { id: guild.roles.everyone.id, allow: [PermissionFlagsBits.ViewChannel], deny: [PermissionFlagsBits.SendMessages] }
            ]
        });

        await message.reply({ content: `✅ Canal de saída criado: ${canalSaida}`, ephemeral: true });
    }
});

// 3. GERENCIAMENTO DE INTERAÇÕES (BOTÕES E MODAIS)
client.on('interactionCreate', async (interaction) => {

    if (interaction.isButton() && interaction.customId === 'btn_participar_sorteio') {
        const member = interaction.member;
        const isBooster = member.premiumSince !== null || member.roles.cache.some(r => r.name.toLowerCase().includes('booster') || r.name.toLowerCase().includes('boost'));

        if (!isBooster) {
            return interaction.reply({ content: '❌ **Acesso negado!** Apenas membros **Nitro Boost** podem participar. 💎', ephemeral: true });
        }

        client.sorteios = client.sorteios || {};
        const sorteio = client.sorteios[interaction.message.id];

        if (!sorteio) return interaction.reply({ content: '❌ Sorteio encerrado.', ephemeral: true });
        if (sorteio.participantes.includes(interaction.user.id)) return interaction.reply({ content: '⚠️ Você já está participando!', ephemeral: true });

        sorteio.participantes.push(interaction.user.id);
        return interaction.reply({ content: `✅ Você está participando do sorteio de **${sorteio.premio}**! 🍀`, ephemeral: true });
    }

    if (interaction.isButton() && interaction.customId === 'btn_abrir_denuncia') {
        const guild = interaction.guild;
        const user = interaction.user;

        let catDenuncias = guild.channels.cache.find(c => c.name === '🚨 DENÚNCIAS DE EMPRESAS' && c.type === ChannelType.GuildCategory);
        if (!catDenuncias) {
            catDenuncias = await guild.channels.create({ name: '🚨 DENÚNCIAS DE EMPRESAS', type: ChannelType.GuildCategory });
        }

        const nomeCanalDenuncia = `denuncia-${user.username.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
        let canalExistente = guild.channels.cache.find(c => c.name === nomeCanalDenuncia);
        if (canalExistente) {
            return interaction.reply({ content: `Você já possui uma aba de denúncia aberta: ${canalExistente}`, ephemeral: true });
        }

        const abaDenuncia = await guild.channels.create({
            name: nomeCanalDenuncia,
            type: ChannelType.GuildText,
            parent: catDenuncias.id,
            permissionOverwrites: [
                { id: guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
                { id: user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles] }
            ]
        });

        const embedPainelDenuncia = new EmbedBuilder()
            .setTitle(`💼 Central de Denúncias de Empresas`)
            .setDescription(`Olá ${user}, clique no botão abaixo para preencher os dados da denúncia.`)
            .setColor(0xFF0000);

        const btnFormDenuncia = new ButtonBuilder().setCustomId('btn_preencher_denuncia').setLabel('📝 Preencher Form. Denúncia').setStyle(ButtonStyle.Danger);
        const row = new ActionRowBuilder().addComponents(btnFormDenuncia);
        await abaDenuncia.send({ embeds: [embedPainelDenuncia], components: [row] });

        await interaction.reply({ content: `✅ Sua aba de denúncia foi criada: ${abaDenuncia}`, ephemeral: true });
    }

    if (interaction.isButton() && interaction.customId === 'btn_preencher_denuncia') {
        const modalDenuncia = new ModalBuilder().setCustomId('modal_enviar_denuncia').setTitle('Denúncia de Empresa');

        const inputEmpresaDenunciada = new TextInputBuilder().setCustomId('empresa_denunciada').setLabel('Nome da Empresa / Denunciado').setStyle(TextInputStyle.Short).setRequired(true);
        const inputMotivo = new TextInputBuilder().setCustomId('motivo').setLabel('Infração / Motivo').setStyle(TextInputStyle.Short).setRequired(true);
        const inputDetalhes = new TextInputBuilder().setCustomId('detalhes').setLabel('Detalhes do Ocorrido').setStyle(TextInputStyle.Paragraph).setRequired(true);

        modalDenuncia.addComponents(
            new ActionRowBuilder().addComponents(inputEmpresaDenunciada),
            new ActionRowBuilder().addComponents(inputMotivo),
            new ActionRowBuilder().addComponents(inputDetalhes)
        );

        await interaction.showModal(modalDenuncia);
    }

    if (interaction.isModalSubmit() && interaction.customId === 'modal_enviar_denuncia') {
        const empresaDenunciada = interaction.fields.getTextInputValue('empresa_denunciada');
        const motivo = interaction.fields.getTextInputValue('motivo');
        const detalhes = interaction.fields.getTextInputValue('detalhes');
        const autorId = interaction.user.id;

        const embedDenunciaResultado = new EmbedBuilder()
            .setTitle(`🚨 REGISTRO DE DENÚNCIA DE EMPRESA`)
            .addFields(
                { name: '👤 Denunciante', value: `<@${autorId}>`, inline: true },
                { name: '🏢 Denunciado', value: empresaDenunciada, inline: true },
                { name: '⚠️ Motivo', value: motivo, inline: false },
                { name: '📄 Detalhes', value: detalhes, inline: false }
            )
            .setColor(0xFF0000)
            .setTimestamp();

        const btnAceitar = new ButtonBuilder()
            .setCustomId(`denuncia_aceitar_${interaction.channel.id}_${autorId}`)
            .setLabel('✅ Aceitar Denúncia')
            .setStyle(ButtonStyle.Success);

        const btnRecusar = new ButtonBuilder()
            .setCustomId(`denuncia_recusar_${interaction.channel.id}_${autorId}`)
            .setLabel('❌ Recusar Denúncia')
            .setStyle(ButtonStyle.Danger);

        const rowStaff = new ActionRowBuilder().addComponents(btnAceitar, btnRecusar);

        await interaction.reply({
            content: '✅ **Denúncia enviada com sucesso!** A Equipe Staff irá analisar o caso em breve.',
            ephemeral: true
        });

        await interaction.channel.send({
            content: `⏳ **Sua denúncia foi registrada e encaminhada para a análise da Equipe Staff.**`,
            embeds: [embedDenunciaResultado]
        });

        // Encaminha estritamente para o canal logs-denuncias
        const canalLogDenuncias = interaction.guild.channels.cache.find(c => c.name === 'logs-denuncias');
        if (canalLogDenuncias) {
            await canalLogDenuncias.send({
                content: `🚨 **Nova Denúncia de Empresa (Aba do canal: <#${interaction.channel.id}>):**`,
                embeds: [embedDenunciaResultado],
                components: [rowStaff]
            });
        }
    }

    if (interaction.isButton() && (interaction.customId.startsWith('denuncia_aceitar_') || interaction.customId.startsWith('denuncia_recusar_'))) {
        
        const temCargoStaff = interaction.member.roles.cache.some(r => r.name.toLowerCase().includes('staff') || r.name.toLowerCase().includes('equipe staff')) || interaction.member.permissions.has(PermissionFlagsBits.Administrator);

        if (!temCargoStaff) {
            return interaction.reply({ 
                content: '❌ **Acesso negado!** Apenas membros da **Equipe Staff** podem aprovar ou recusar denúncias.', 
                ephemeral: true 
            });
        }

        const isAceito = interaction.customId.startsWith('denuncia_aceitar_');
        const partes = interaction.customId.split('_');
        const channelIdAlvo = partes[2];
        const autorId = partes[3];
        
        const statusTexto = isAceito ? '✅ **DENÚNCIA ACEITA**' : '❌ **DENÚNCIA RECUSADA**';
        const corEmbed = isAceito ? 0x00FF00 : 0xFF0000;

        const embedAtualizado = EmbedBuilder.from(interaction.message.embeds[0])
            .setColor(corEmbed)
            .addFields({ name: '🛠️ Veredito da Staff', value: `${statusTexto} por <@${interaction.user.id}>`, inline: false });

        await interaction.update({
            content: `${statusTexto} por <@${interaction.user.id}>.`,
            embeds: [embedAtualizado],
            components: []
        });

        try {
            const usuarioDenunciante = await client.users.fetch(autorId);
            if (usuarioDenunciante) {
                const embedPrivado = new EmbedBuilder()
                    .setTitle(`📢 RESULTADO DA SUA DENÚNCIA - BMRP`)
                    .setDescription(`Olá! Sua denúncia referente à empresa foi analisada pela Equipe Staff.`)
                    .addFields(
                        { name: '📌 Veredito', value: statusTexto, inline: false },
                        { name: '🛡️ Analisado por', value: `<@${interaction.user.id}>`, inline: false }
                    )
                    .setColor(corEmbed)
                    .setTimestamp();

                await usuarioDenunciante.send({ embeds: [embedPrivado] });
            }
        } catch (error) {
            console.log('Não foi possível enviar mensagem privada para o usuário.');
        }

        const canalDenuncia = interaction.guild.channels.cache.get(channelIdAlvo);
        if (canalDenuncia) {
            await canalDenuncia.send(`🔒 **Este atendimento foi finalizado por <@${interaction.user.id}> (Veredito: ${isAceito ? 'Aceito' : 'Recusado'}).** Esta aba será excluída em 5 segundos...`);
            setTimeout(async () => {
                await canalDenuncia.delete().catch(() => {});
            }, 5000);
        }
    }

    if (interaction.isButton() && interaction.customId === 'btn_cadastrar_empresario') {
        const modal = new ModalBuilder().setCustomId('modal_cadastro_empresa').setTitle('Cadastro de Empresa de Armas');

        const inputNomeDono = new TextInputBuilder().setCustomId('nome_dono').setLabel('Nome do Empresário').setStyle(TextInputStyle.Short).setRequired(true);
        const inputNomeEmpresa = new TextInputBuilder().setCustomId('nome_empresa').setLabel('Nome da Empresa').setStyle(TextInputStyle.Short).setRequired(true);
        const inputIdEmpresa = new TextInputBuilder().setCustomId('id_empresa').setLabel('ID da Empresa').setStyle(TextInputStyle.Short).setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(inputNomeDono),
            new ActionRowBuilder().addComponents(inputNomeEmpresa),
            new ActionRowBuilder().addComponents(inputIdEmpresa)
        );

        await interaction.showModal(modal);
    }

    if (interaction.isModalSubmit() && interaction.customId === 'modal_cadastro_empresa') {
        const nomeDono = interaction.fields.getTextInputValue('nome_dono');
        const nomeEmpresa = interaction.fields.getTextInputValue('nome_empresa');
        const idEmpresa = interaction.fields.getTextInputValue('id_empresa');
        const guild = interaction.guild;
        const member = interaction.member;

        const embedSolicitacao = new EmbedBuilder()
            .setTitle(`📋 SOLICITAÇÃO DE CADASTRO DE EMPRESA`)
            .setDescription(`Um empresário solicitou o registro de uma nova empresa. Aguardando aprovação da Staff.`)
            .addFields(
                { name: '🏢 Nome da Empresa', value: nomeEmpresa, inline: true },
                { name: '🆔 ID da Empresa', value: idEmpresa, inline: true },
                { name: '👤 Nome do Empresário', value: nomeDono, inline: true },
                { name: '🎮 Discord do Dono', value: `<@${member.id}>`, inline: false }
            )
            .setColor(0xFFA500)
            .setTimestamp();

        const btnAprovarEmpresa = new ButtonBuilder()
            .setCustomId(`empresa_aprovar_${member.id}_${nomeEmpresa}_${idEmpresa}_${nomeDono}`)
            .setLabel('✅ Aprovar Empresa')
            .setStyle(ButtonStyle.Success);

        const btnRecusarEmpresa = new ButtonBuilder()
            .setCustomId(`empresa_recusar_${member.id}_${nomeEmpresa}`)
            .setLabel('❌ Recusar Empresa')
            .setStyle(ButtonStyle.Danger);

        const rowStaffEmpresa = new ActionRowBuilder().addComponents(btnAprovarEmpresa, btnRecusarEmpresa);

        // Encaminha estritamente para o canal logs-solicitacoes-empresas
        const canalSolicitacoes = guild.channels.cache.find(c => c.name === 'logs-solicitacoes-empresas');
        if (canalSolicitacoes) {
            await canalSolicitacoes.send({ embeds: [embedSolicitacao], components: [rowStaffEmpresa] });
        }

        await interaction.reply({ 
            content: `⏳ **Seu pedido de cadastro foi enviado para a Equipe Staff!** Assim que for aprovado, seu canal de gerenciamento será criado automaticamente.`, 
            ephemeral: true 
        });
    }

    if (interaction.isButton() && (interaction.customId.startsWith('empresa_aprovar_') || interaction.customId.startsWith('empresa_recusar_'))) {
        
        const temCargoStaff = interaction.member.roles.cache.some(r => r.name.toLowerCase().includes('staff') || r.name.toLowerCase().includes('equipe staff')) || interaction.member.permissions.has(PermissionFlagsBits.Administrator);

        if (!temCargoStaff) {
            return interaction.reply({ 
                content: '❌ **Acesso negado!** Apenas membros da **Equipe Staff** podem aprovar empresas.', 
                ephemeral: true 
            });
        }

        const isAprovado = interaction.customId.startsWith('empresa_aprovar_');
        const partes = interaction.customId.split('_');
        const donoId = partes[2];
        const nomeEmpresa = partes[3];

        if (!isAprovado) {
            const embedAtualizado = EmbedBuilder.from(interaction.message.embeds[0])
                .setColor(0xFF0000)
                .addFields({ name: '🛠️ Veredito', value: `❌ **Recusado** por <@${interaction.user.id}>`, inline: false });

            await interaction.update({ embeds: [embedAtualizado], components: [] });

            try {
                const donoUser = await client.users.fetch(donoId);
                await donoUser.send(`❌ Olá! Seu pedido de registro para a empresa **${nomeEmpresa}** foi **recusado** pela Equipe Staff.`);
            } catch (e) {}

            return;
        }

        const idEmpresa = partes[4];
        const nomeDono = partes.slice(5).join('_');
        const guild = interaction.guild;

        // Atribui o cargo de Dono de Empresa automaticamente
        try {
            const membroDono = await guild.members.fetch(donoId);
            const cargoDonoEmpresa = guild.roles.cache.find(r => r.name.toLowerCase().includes('dono de empresa') || r.name.toLowerCase().includes('empresário'));
            if (membroDono && cargoDonoEmpresa) {
                await membroDono.roles.add(cargoDonoEmpresa);
            }
        } catch (err) {
            console.log('Não foi possível atribuir o cargo automaticamente ao dono da empresa.');
        }

        let catEmpresarios = guild.channels.cache.find(c => c.name === '💼 ABAS DE EMPRESÁRIOS' && c.type === ChannelType.GuildCategory);
        if (!catEmpresarios) {
            catEmpresarios = await guild.channels.create({ name: '💼 ABAS DE EMPRESÁRIOS', type: ChannelType.GuildCategory });
        }

        const nomeCanal = `empresa-${nomeEmpresa.toLowerCase().replace(/ /g, '-')}`;
        let canalExistente = guild.channels.cache.find(c => c.name === nomeCanal);
        if (canalExistente) {
            return interaction.update({ content: `⚠️ Já existe um canal com esse nome (${canalExistente}).`, embeds: [], components: [] });
        }

        const abaEmpresario = await guild.channels.create({
            name: nomeCanal,
            type: ChannelType.GuildText,
            parent: catEmpresarios.id,
            permissionOverwrites: [
                { id: guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
                { id: donoId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles] }
            ]
        });

        const embedPainelAba = new EmbedBuilder()
            .setTitle(`🏢 Painel da Empresa: ${nomeEmpresa}`)
            .setDescription(`**Empresário:** ${nomeDono}\n**ID da Empresa:** ${idEmpresa}\n\nEscolha uma das opções abaixo para gerenciar sua empresa:`)
            .setColor(0x2B2D31);

        const btnNovoAluguel = new ButtonBuilder().setCustomId(`btn_novo_aluguel_${nomeEmpresa}`).setLabel('➕ Registrar Aluguel').setStyle(ButtonStyle.Primary);
        const btnOpcaoAluguel = new ButtonBuilder().setCustomId(`btn_opcao_aluguel_${nomeEmpresa}`).setLabel('💰 Opção de Aluguel').setStyle(ButtonStyle.Secondary);
        const btnContratar = new ButtonBuilder().setCustomId(`btn_contratar_${nomeEmpresa}`).setLabel('➕ Adicionar Funcionário').setStyle(ButtonStyle.Success);
        const btnDemitir = new ButtonBuilder().setCustomId(`btn_demitir_${nomeEmpresa}`).setLabel('🗑️ Demitir Funcionário').setStyle(ButtonStyle.Danger);

        const row1 = new ActionRowBuilder().addComponents(btnNovoAluguel, btnOpcaoAluguel);
        const row2 = new ActionRowBuilder().addComponents(btnContratar, btnDemitir);

        await abaEmpresario.send({ embeds: [embedPainelAba], components: [row1, row2] });

        // Encaminha estritamente para o canal logs-novas-empresas
        const canalLogNovasEmpresas = guild.channels.cache.find(c => c.name === 'logs-novas-empresas');
        if (canalLogNovasEmpresas) {
            await canalLogNovasEmpresas.send(`🚀 **NOVA EMPRESA APROVADA:** A empresa **${nomeEmpresa}** teve sua aba criada com sucesso: <#${abaEmpresario.id}> (Dono: <@${donoId}>, Aprovado por: <@${interaction.user.id}>)`);
        }

        const embedAtualizado = EmbedBuilder.from(interaction.message.embeds[0])
            .setColor(0x00FF00)
            .addFields(
                { name: '🛠️ Veredito', value: `✅ **Aprovado** por <@${interaction.user.id}>`, inline: false },
                { name: '💬 Canal Criado', value: `<#${abaEmpresario.id}>`, inline: false }
            );

        await interaction.update({ embeds: [embedAtualizado], components: [] });

        try {
            const donoUser = await client.users.fetch(donoId);
            await donoUser.send(`✅ Olá! Seu pedido de registro para a empresa **${nomeEmpresa}** foi **aprovado**! O cargo de Dono de Empresa foi setado e seu canal de gerenciamento foi criado: <#${abaEmpresario.id}>`);
        } catch (e) {}
    }

    if (interaction.isButton() && interaction.customId.startsWith('btn_novo_aluguel_')) {
        const nomeEmpresa = interaction.customId.replace('btn_novo_aluguel_', '');

        const modalAluguel = new ModalBuilder().setCustomId(`modal_salvar_aluguel_${nomeEmpresa}`).setTitle('Registrar Aluguel de Armamento');

        const inputCliente = new TextInputBuilder().setCustomId('cliente').setLabel('Cliente / ID').setStyle(TextInputStyle.Short).setRequired(true);
        const inputArmas = new TextInputBuilder().setCustomId('armas').setLabel('Armas / Munições').setStyle(TextInputStyle.Short).setRequired(true);
        const inputDias = new TextInputBuilder().setCustomId('dias').setLabel('Dias').setStyle(TextInputStyle.Short).setRequired(true);
        const inputValor = new TextInputBuilder().setCustomId('valor').setLabel('Valor (R$)').setStyle(TextInputStyle.Short).setRequired(true);
        const inputPrint = new TextInputBuilder().setCustomId('print_info').setLabel('Obs / Info').setStyle(TextInputStyle.Short).setRequired(false);

        modalAluguel.addComponents(
            new ActionRowBuilder().addComponents(inputCliente),
            new ActionRowBuilder().addComponents(inputArmas),
            new ActionRowBuilder().addComponents(inputDias),
            new ActionRowBuilder().addComponents(inputValor),
            new ActionRowBuilder().addComponents(inputPrint)
        );

        await interaction.showModal(modalAluguel);
    }

    if (interaction.isModalSubmit() && interaction.customId.startsWith('modal_salvar_aluguel_')) {
        const nomeEmpresa = interaction.customId.replace('modal_salvar_aluguel_', '');
        const cliente = interaction.fields.getTextInputValue('cliente');
        const armas = interaction.fields.getTextInputValue('armas');
        const dias = interaction.fields.getTextInputValue('dias');
        const valor = interaction.fields.getTextInputValue('valor');
        const printInfo = interaction.fields.getTextInputValue('print_info') || 'Não informado';

        const embedRegistro = new EmbedBuilder()
            .setTitle(`💥 NOVO ALUGUEL - ${nomeEmpresa.toUpperCase()}`)
            .addFields(
                { name: '👤 Cliente', value: cliente, inline: true },
                { name: '🔫 Equipamentos', value: armas, inline: true },
                { name: '⏱️ Duração', value: dias, inline: true },
                { name: '💰 Valor', value: valor, inline: true },
                { name: '📸 Info', value: printInfo, inline: false },
                { name: '💼 Registrado Por', value: `<@${interaction.user.id}>`, inline: false }
            )
            .setColor(0xFF8C00)
            .setTimestamp();

        await interaction.reply({ content: '✅ **Aluguel registrado com sucesso!** Envie o print do comprovante neste canal.', embeds: [embedRegistro] });

        // Encaminha estritamente para o canal logs-novas-empresas
        const canalNovasEmpresas = interaction.guild.channels.cache.find(c => c.name === 'logs-novas-empresas');
        if (canalNovasEmpresas) {
            await canalNovasEmpresas.send({ content: `🔔 **Novo aluguel registrado pela empresa ${nomeEmpresa} (Aba: <#${interaction.channel.id}>):**`, embeds: [embedRegistro] });
        }
    }

    if (interaction.isButton() && interaction.customId.startsWith('btn_opcao_aluguel_')) {
        const nomeEmpresa = interaction.customId.replace('btn_opcao_aluguel_', '');
        return interaction.reply({ content: `💰 **Opções de Aluguel:** Gerenciamento da empresa **${nomeEmpresa}**.`, ephemeral: true });
    }

    if (interaction.isButton() && interaction.customId.startsWith('btn_contratar_')) {
        const nomeEmpresa = interaction.customId.replace('btn_contratar_', '');

        const modalContratar = new ModalBuilder().setCustomId(`modal_enviar_contratacao_${nomeEmpresa}`).setTitle('Adicionar Funcionário');

        const inputNomeFuncionario = new TextInputBuilder().setCustomId('nome_funcionario').setLabel('Nome e ID do Funcionário').setStyle(TextInputStyle.Short).setRequired(true);
        const inputCargoFuncao = new TextInputBuilder().setCustomId('cargo_funcao').setLabel('Cargo / Função').setStyle(TextInputStyle.Short).setRequired(true);

        modalContratar.addComponents(
            new ActionRowBuilder().addComponents(inputNomeFuncionario),
            new ActionRowBuilder().addComponents(inputCargoFuncao)
        );

        return await interaction.showModal(modalContratar);
    }

    if (interaction.isModalSubmit() && interaction.customId.startsWith('modal_enviar_contratacao_')) {
        const nomeEmpresa = interaction.customId.replace('modal_enviar_contratacao_', '');
        const funcionario = interaction.fields.getTextInputValue('nome_funcionario');
        const cargo = interaction.fields.getTextInputValue('cargo_funcao');

        const embedContratacao = new EmbedBuilder()
            .setTitle(`👥 NOVA CONTRATAÇÃO - ${nomeEmpresa.toUpperCase()}`)
            .addFields(
                { name: '👤 Funcionário / ID', value: funcionario, inline: true },
                { name: '🏷️ Cargo', value: cargo, inline: true },
                { name: '💼 Contratado por', value: `<@${interaction.user.id}>`, inline: false }
            )
            .setColor(0x00FF00)
            .setTimestamp();

        await interaction.reply({ content: `✅ Funcionário **${funcionario}** adicionado com sucesso à empresa **${nomeEmpresa}**!`, embeds: [embedContratacao] });

        // Encaminha estritamente para o canal logs-novas-empresas
        const canalNovasEmpresas = interaction.guild.channels.cache.find(c => c.name === 'logs-novas-empresas');
        if (canalNovasEmpresas) {
            await canalNovasEmpresas.send({ content: `🔔 **Nova contratação na empresa ${nomeEmpresa} (Aba: <#${interaction.channel.id}>):**`, embeds: [embedContratacao] });
        }
    }

    if (interaction.isButton() && interaction.customId.startsWith('btn_demitir_')) {
        const nomeEmpresa = interaction.customId.replace('btn_demitir_', '');

        const modalDemitir = new ModalBuilder().setCustomId(`modal_enviar_demissao_${nomeEmpresa}`).setTitle('Demitir Funcionário');

        const inputNomeFuncionarioDemitido = new TextInputBuilder().setCustomId('nome_funcionario_demitido').setLabel('Nome / ID do Funcionário').setStyle(TextInputStyle.Short).setRequired(true);
        const inputMotivoDemissao = new TextInputBuilder().setCustomId('motivo_demissao').setLabel('Motivo do Desligamento').setStyle(TextInputStyle.Short).setRequired(true);

        modalDemitir.addComponents(
            new ActionRowBuilder().addComponents(inputNomeFuncionarioDemitido),
            new ActionRowBuilder().addComponents(inputMotivoDemissao)
        );

        return await interaction.showModal(modalDemitir);
    }

    if (interaction.isModalSubmit() && interaction.customId.startsWith('modal_enviar_demissao_')) {
        const nomeEmpresa = interaction.customId.replace('modal_enviar_demissao_', '');
        const funcionario = interaction.fields.getTextInputValue('nome_funcionario_demitido');
        const motivo = interaction.fields.getTextInputValue('motivo_demissao');

        const embedDemissao = new EmbedBuilder()
            .setTitle(`🗑️ DESLIGAMENTO / DEMISSÃO - ${nomeEmpresa.toUpperCase()}`)
            .addFields(
                { name: '👤 Funcionário / ID', value: funcionario, inline: true },
                { name: '⚠️ Motivo', value: motivo, inline: true },
                { name: '💼 Demitido por', value: `<@${interaction.user.id}>`, inline: false }
            )
            .setColor(0xFF0000)
            .setTimestamp();

        await interaction.reply({ content: `⚠️ O funcionário **${funcionario}** foi desligado da empresa **${nomeEmpresa}**.`, embeds: [embedDemissao] });

        // Encaminha estritamente para o canal logs-novas-empresas
        const canalNovasEmpresas = interaction.guild.channels.cache.find(c => c.name === 'logs-novas-empresas');
        if (canalNovasEmpresas) {
            await canalNovasEmpresas.send({ content: `🔔 **Nova demissão na empresa ${nomeEmpresa} (Aba: <#${interaction.channel.id}>):**`, embeds: [embedDemissao] });
        }
    }
});

// LOGIN COM TOKEN DO BOT
client.login(process.env.DISCORD_TOKEN);