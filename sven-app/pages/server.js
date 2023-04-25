const express = require('express');
const bodyParser = require('body-parser');
const openai = require('openai');
const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

openai.apiKey = process.env.OPENAI_API_KEY;

app.post('/api/generate-summary', async (req, res) => {
  const { tasks } = req.body;

  const prompt = `Task Summary\n\n${tasks.map((task) => `${task.name}\n`).join('')}`;

  const completions = await openai.completions.create({
    engine: 'text-davinci-002',
    prompt: prompt,
    maxTokens: 128,
    temperature: 0,
    n: 1,
    stop: '\n',
  });

  const summary = completions.choices[0].text.trim();

  res.send({ summary });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
