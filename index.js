const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const config = require('./config.json');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });

const commands = [
    {
        name: 'userinfo',
        description: 'Obtenir des informations sur un utilisateur',
        options: [
            {
                name: 'utilisateur',
                type: 6, // 6 est le type pour USER
                description: "L'utilisateur dont vous voulez obtenir des informations",
                required: true,
            },
        ],
    },
];

const rest = new REST({ version: '10' }).setToken(config.token);

client.once('ready', async () => {
    console.log(`Connecté en tant que ${client.user.tag}!`);

    try {
        await rest.put(
            Routes.applicationGuildCommands(client.user.id, config.guildId),
            { body: commands }
        );
        console.log('Commandes d\'application enregistrées avec succès.');
    } catch (error) {
        console.error(error);
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName, options } = interaction;

    if (commandName === 'userinfo') {
        const user = options.getUser('utilisateur');
        const member = await interaction.guild.members.fetch(user.id);

        const userInfo = {
            username: user.username,
            id: user.id,
            avatar: user.displayAvatarURL({ dynamic: true }),
            createdAt: user.createdAt,
            joinedAt: member.joinedAt,
            roles: member.roles.cache.map(role => role.name).join(', '),
        };

        const userInfoEmbed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle(`Informations sur l'utilisateur ${user.username}`)
            .setThumbnail(userInfo.avatar)
            .addFields(
                { name: 'ID', value: userInfo.id, inline: true },
                { name: 'Nom d\'utilisateur', value: userInfo.username, inline: true },
                { name: 'Avatar', value: `[Lien](${userInfo.avatar})`, inline: true },
                { name: 'Compte créé le', value: userInfo.createdAt.toDateString(), inline: true },
                { name: 'A rejoint le serveur le', value: userInfo.joinedAt.toDateString(), inline: true },
                { name: 'Rôles', value: userInfo.roles, inline: true },
            )
            .setTimestamp()
            .setFooter({ text: 'Informations utilisateur', iconURL: client.user.displayAvatarURL() });

        await interaction.reply({ embeds: [userInfoEmbed] });
    }
});

client.login(config.token);
