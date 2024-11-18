# TriviaBot

A Discord bot that manages trivia quizzes using the Open Trivia Database API. Users can start quizzes, submit answers, and track their scores through intuitive slash commands.

## Prerequisites

- **Node.js** v16.6.0 or higher. [Download Node.js](https://nodejs.org/)
- **Discord Account** with permissions to add bots to your server.
- **Discord Bot Token**, **Client ID**, and **Guild ID** from the [Discord Developer Portal](https://discord.com/developers/applications).

## Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/MrTroxy/TriviaBot.git
   cd trivia-bot
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

## Configuration

Create a `config.json` file in the root directory with the following structure:

```json
{
  "token": "YOUR_DISCORD_BOT_TOKEN",
  "clientId": "YOUR_CLIENT_ID",
  "guildId": "YOUR_GUILD_ID",
  "trivia_api_url": "https://opentdb.com/api.php",
  "question_timer": 30
}
```

- **token:** Your Discord bot token.
- **clientId:** Your Discord application's Client ID.
- **guildId:** The ID of your Discord server (guild).
- **trivia_api_url:** Base URL for the Open Trivia Database API.
- **question_timer:** Time (in seconds) for each quiz question.

## Deploying Slash Commands

Run the following command to register the slash commands with Discord:

```bash
npm run deploy-commands
```

## Running the Bot

Start the bot with:

```bash
npm start
```

You should see a message like:

```
Logged in as YourBotName#1234!
```

## Usage

### Start a Quiz

```
/quiz start [category] [difficulty] [number]
```

- **category (optional):** Choose a category (e.g., General Knowledge, Science & Nature).
- **difficulty (optional):** Select difficulty (`easy`, `medium`, `hard`).
- **number (optional):** Number of questions (1-50).

**Example:**

```
/quiz start category: Science & Nature difficulty: medium number: 10
```

### Submit an Answer

```
/quiz answer number: <your_answer_number>
```

- **number (required):** The number corresponding to your chosen answer (1-4).

**Example:**

```
/quiz answer number: 2
```

### Check Your Score

```
/quiz score
```

Displays your current score and progress in the ongoing quiz.

## Troubleshooting

- **Commands Not Appearing:** Ensure you ran `npm run deploy-commands` and wait a few minutes for Discord to update.
- **Bot Not Responding:** Verify the bot is running (`npm start`) and has the necessary permissions in your Discord server.
- **Errors in Terminal:** Check `config.json` for correct values and ensure all dependencies are installed.

## License

This project is licensed under the [MIT License](LICENSE).

---

**Note:** Keep your Discord bot token secure. Do not share it or commit it to public repositories.
