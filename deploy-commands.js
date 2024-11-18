const { REST, Routes, SlashCommandBuilder } = require('discord.js');
const config = require('./config.json');

const commands = [
    new SlashCommandBuilder()
        .setName('quiz')
        .setDescription('Manage trivia quizzes')
        .addSubcommand(subcommand =>
            subcommand
                .setName('start')
                .setDescription('Start a new trivia quiz')
                .addStringOption(option =>
                    option.setName('category')
                        .setDescription('Select a category')
                        .setRequired(false)
                        .addChoices(
                            { name: 'General Knowledge', value: '9' },
                            { name: 'Entertainment: Books', value: '10' },
                            { name: 'Entertainment: Film', value: '11' },
                            { name: 'Science & Nature', value: '17' },
                            { name: 'Sports', value: '21' },
                            { name: 'Geography', value: '22' },
                            { name: 'History', value: '23' },
                            { name: 'Art', value: '25' },
                            { name: 'Animals', value: '27' }
                        ))
                .addStringOption(option =>
                    option.setName('difficulty')
                        .setDescription('Select difficulty')
                        .setRequired(false)
                        .addChoices(
                            { name: 'Easy', value: 'easy' },
                            { name: 'Medium', value: 'medium' },
                            { name: 'Hard', value: 'hard' }
                        ))
                .addIntegerOption(option =>
                    option.setName('number')
                        .setDescription('Number of questions')
                        .setRequired(false)
                        .setMinValue(1)
                        .setMaxValue(50)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('answer')
                .setDescription('Submit an answer for the current question')
                .addIntegerOption(option =>
                    option.setName('number')
                        .setDescription('Your answer number')
                        .setRequired(true)
                        .setMinValue(1)
                        .setMaxValue(4)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('score')
                .setDescription('Display your current score'))
        .toJSON()
];

const rest = new REST({ version: '10' }).setToken(config.token);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationGuildCommands(config.clientId, config.guildId),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();