const { Client, GatewayIntentBits, Collection, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const { decode } = require('html-entities');
const config = require('./config.json');

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

client.quizzes = new Collection();
let categoryMap = {};

async function fetchCategories() {
    try {
        const response = await axios.get('https://opentdb.com/api_category.php');
        const categories = response.data.trivia_categories;
        categories.forEach(cat => {
            categoryMap[cat.name.toLowerCase()] = cat.id;
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
    }
}

fetchCategories();

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName, options, user } = interaction;

    if (commandName === 'quiz') {
        const subcommand = options.getSubcommand();

        if (subcommand === 'start') {
            await startQuiz(interaction);
        } else if (subcommand === 'answer') {
            await submitAnswer(interaction);
        } else if (subcommand === 'score') {
            await showScore(interaction);
        }
    }
});

async function startQuiz(interaction) {
    if (client.quizzes.has(interaction.user.id)) {
        return interaction.reply({ content: 'You already have an active quiz! Complete it first.', ephemeral: true });
    }

    const categoryOption = interaction.options.getString('category');
    const difficulty = interaction.options.getString('difficulty') || '';
    const numberOfQuestions = interaction.options.getInteger('number') || 5;

    let categoryId = categoryOption;
    if (categoryOption && isNaN(categoryOption)) {
        categoryId = categoryMap[categoryOption.toLowerCase()];
        if (!categoryId) {
            return interaction.reply({ content: 'Invalid category name. Please enter a valid category.', ephemeral: true });
        }
    }

    const apiUrl = `${config.trivia_api_url}?amount=${numberOfQuestions}${categoryId ? `&category=${categoryId}` : ''}${difficulty ? `&difficulty=${difficulty}` : ''}&type=multiple`;

    try {
        const response = await axios.get(apiUrl);
        const data = response.data;

        if (data.response_code !== 0) {
            return interaction.reply({ content: 'Error fetching questions. Check your parameters and try again.', ephemeral: true });
        }

        const quiz = {
            questions: data.results,
            currentQuestion: 0,
            score: 0,
            correctAnswer: null
        };

        client.quizzes.set(interaction.user.id, quiz);
        await sendQuestion(interaction, quiz, false);
    } catch (error) {
        console.error(error);
        interaction.reply({ content: 'An error occurred while starting the quiz.', ephemeral: true });
    }
}

async function sendQuestion(interaction, quiz, isFollowUp) {
    const questionData = quiz.questions[quiz.currentQuestion];
    const answers = [...questionData.incorrect_answers, questionData.correct_answer].sort(() => Math.random() - 0.5);
    quiz.correctAnswer = answers.indexOf(questionData.correct_answer) + 1;

    const embed = new EmbedBuilder()
        .setTitle(`Question ${quiz.currentQuestion + 1}/${quiz.questions.length}`)
        .setDescription(decode(questionData.question))
        .addFields(
            { name: '1️⃣', value: decode(answers[0]), inline: true },
            { name: '2️⃣', value: decode(answers[1]), inline: true },
            { name: '3️⃣', value: decode(answers[2]), inline: true },
            { name: '4️⃣', value: decode(answers[3]), inline: true }
        )
        .setFooter({ text: `You have ${config.question_timer} seconds to answer.` });

    if (!isFollowUp) {
        await interaction.reply({ embeds: [embed] });
    } else {
        await interaction.followUp({ embeds: [embed] });
    }

    // Create a collector for the answer timeout
    setTimeout(async () => {
        const currentQuiz = client.quizzes.get(interaction.user.id);
        if (currentQuiz && currentQuiz.currentQuestion === quiz.currentQuestion) {
            await interaction.followUp({ content: 'Time is up for this question!' });
            quiz.currentQuestion++;
            if (quiz.currentQuestion < quiz.questions.length) {
                await sendQuestion(interaction, quiz, true);
            } else {
                endQuiz(interaction, quiz);
            }
        }
    }, config.question_timer * 1000);
}

async function submitAnswer(interaction) {
    const quiz = client.quizzes.get(interaction.user.id);
    if (!quiz) {
        return interaction.reply({ content: 'You do not have an active quiz. Start one with `/quiz start`.', ephemeral: true });
    }

    const answer = interaction.options.getInteger('number');

    if (isNaN(answer) || answer < 1 || answer > 4) {
        return interaction.reply({ content: 'Invalid answer. Please select a valid option number (1-4).', ephemeral: true });
    }

    if (quiz.currentQuestion >= quiz.questions.length) {
        return interaction.reply({ content: 'Your quiz has already ended. Start a new one with `/quiz start`.', ephemeral: true });
    }

    const isCorrect = answer === quiz.correctAnswer;

    if (isCorrect) {
        quiz.score++;
        await interaction.reply({ content: 'Correct! 🎉' });
    } else {
        await interaction.reply({ content: `Incorrect. The correct answer was option **${quiz.correctAnswer}**.` });
    }

    quiz.currentQuestion++;

    if (quiz.currentQuestion < quiz.questions.length) {
        await sendQuestion(interaction, quiz, true);
    } else {
        endQuiz(interaction, quiz);
    }
}

function endQuiz(interaction, quiz) {
    interaction.followUp({ content: `Quiz over! Your final score is **${quiz.score}/${quiz.questions.length}**.` });
    client.quizzes.delete(interaction.user.id);
}

async function showScore(interaction) {
    const quiz = client.quizzes.get(interaction.user.id);
    if (!quiz) {
        return interaction.reply({ content: 'You do not have an active quiz.', ephemeral: true });
    }

    interaction.reply({ content: `Your current score is **${quiz.score}/${quiz.currentQuestion}**.` });
}

client.login(config.token);