const axios = require('axios');
const logger = require('../config/logger');
const path = require('path');

// Load env variables (in case they are not loaded yet)
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

// Define cooling down map: key -> expiration timestamp
const cooldowns = new Map();

// Helper to parse comma-separated keys from environment
function getKeys(envVal) {
  if (!envVal) return [];
  return envVal.split(',')
    .map(k => k.trim())
    .filter(k => k && k !== 'your_gemini_api_key_here' && k !== 'your_groq_api_key_here' && k !== 'your_nvidia_api_key_here');
}

// Cooldown duration defaults
const DEFAULT_COOLDOWN_MS = 5 * 60 * 1000;

function setKeyCooldown(key, providerName, durationMs = DEFAULT_COOLDOWN_MS) {
  const expiresAt = Date.now() + durationMs;
  // Mask key for logging safety
  const maskedKey = key.length > 8 ? `${key.substring(0, 4)}...${key.substring(key.length - 4)}` : '***';
  cooldowns.set(key, expiresAt);
  logger.warn(`AI Service: Cooldown active for ${providerName} key (${maskedKey}) for ${durationMs / 1000}s until ${new Date(expiresAt).toISOString()}`);
}

function isKeyOnCooldown(key) {
  if (!cooldowns.has(key)) return false;
  const expiresAt = cooldowns.get(key);
  if (Date.now() > expiresAt) {
    cooldowns.delete(key);
    return false;
  }
  return true;
}

// Clean markdown code blocks from string
function cleanAndParseJSON(str) {
  let cleaned = str.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  return JSON.parse(cleaned.trim());
}

/**
 * Call Gemini API
 */
async function callGemini(key, prompt, history = []) {
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
  
  logger.info(`AI Service: Attempting with Gemini model ${model}`);
  const contents = [];
  if (history && history.length > 0) {
    history.forEach(msg => {
      contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.text }]
      });
    });
  }
  contents.push({
    role: 'user',
    parts: [{ text: prompt }]
  });

  const response = await axios.post(
    url,
    {
      contents: contents,
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.0
      }
    },
    { timeout: 180000 }
  );

  if (!response.data || !response.data.candidates || !response.data.candidates[0]) {
    throw new Error('Invalid response structure from Gemini API');
  }
  return response.data.candidates[0].content.parts[0].text;
}

/**
 * Call Groq API (OpenAI Compatible)
 */
async function callGroq(key, prompt, history = []) {
  const model = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';
  const url = 'https://api.groq.com/openai/v1/chat/completions';
  
  const adjustedPrompt = prompt.toLowerCase().includes('json')
    ? prompt
    : `${prompt}\n\nReturn the output as a JSON object.`;

  logger.info(`AI Service: Attempting with Groq model ${model}`);
  const messages = [];
  if (history && history.length > 0) {
    history.forEach(msg => {
      messages.push({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.text
      });
    });
  }
  messages.push({ role: 'user', content: adjustedPrompt });

  const response = await axios.post(
    url,
    {
      model: model,
      messages: messages,
      response_format: { type: 'json_object' },
      temperature: 0.0
    },
    {
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      },
      timeout: 180000
    }
  );

  if (!response.data || !response.data.choices || !response.data.choices[0]) {
    throw new Error('Invalid response structure from Groq API');
  }
  return response.data.choices[0].message.content;
}

/**
 * Call Nvidia NIM API (OpenAI Compatible)
 */
async function callNvidia(key, prompt) {
  const model = process.env.NVIDIA_MODEL || 'meta/llama-3.1-70b-instruct';
  const url = 'https://integrate.api.nvidia.com/v1/chat/completions';
  
  logger.info(`AI Service: Attempting with Nvidia model ${model}`);
  const response = await axios.post(
    url,
    {
      model: model,
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.0
    },
    {
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      },
      timeout: 180000
    }
  );

  if (!response.data || !response.data.choices || !response.data.choices[0]) {
    throw new Error('Invalid response structure from Nvidia API');
  }
  return response.data.choices[0].message.content;
}

/**
 * Call NVIDIA Nemotron Ultra (reasoning model) — non-streaming, returns full response
 */
async function callNemotron(prompt) {
  const NEMOTRON_KEY = process.env.NVIDIA_NEMOTRON_KEY;
  if (!NEMOTRON_KEY) throw new Error('NVIDIA_NEMOTRON_KEY not set in environment');
  const url = 'https://integrate.api.nvidia.com/v1/chat/completions';

  logger.info('AI Service: Calling NVIDIA Nemotron Ultra reasoning model');
  const response = await axios.post(
    url,
    {
      model: 'nvidia/nemotron-3-ultra-550b-a55b',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.0,
      top_p: 0.95,
      max_tokens: 16384,
      extra_body: {
        chat_template_kwargs: { enable_thinking: true },
        reasoning_budget: 8192
      },
      stream: false
    },
    {
      headers: {
        Authorization: `Bearer ${NEMOTRON_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 120000
    }
  );

  if (!response.data?.choices?.[0]) throw new Error('Invalid Nemotron response');
  return response.data.choices[0].message.content;
}

/**
 * Generate structured JSON using Nemotron reasoning model.
 * Falls back to 10-model chain on failure.
 */
async function generateWithNemotron(prompt) {
  // 10-model Groq chain first for blazing fast < 1s responses
  const FALLBACK_GROQ_MODELS = [
    'llama-3.1-8b-instant',
    'llama-3.3-70b-versatile',
    'deepseek-r1-distill-llama-70b',
    'llama-3.1-70b-specdec',
    'llama-3.2-90b-vision-preview',
    'mixtral-8x7b-32768',
    'gemma2-9b-it',
    'llama-3.1-8b-instant',
  ];

  const groqKeys = getKeys(process.env.GROQ_API_KEY);
  for (const key of groqKeys) {
    if (isKeyOnCooldown(key)) continue;
    for (const model of FALLBACK_GROQ_MODELS) {
      try {
        logger.info(`Primary: trying Groq model ${model}`);
        const adjustedPrompt = prompt.toLowerCase().includes('json')
          ? prompt
          : `${prompt}\n\nReturn the output as a JSON object.`;
        const response = await axios.post(
          'https://api.groq.com/openai/v1/chat/completions',
          { model, messages: [{ role: 'user', content: adjustedPrompt }], response_format: { type: 'json_object' }, temperature: 0.0 },
          { headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }, timeout: 180000 }
        );
        if (response.data?.choices?.[0]?.message?.content) {
          return cleanAndParseJSON(response.data.choices[0].message.content);
        }
      } catch (e) {
        logger.warn(`Primary Groq model ${model} failed: ${e.message}`);
      }
    }
  }

  // Try Nemotron as fallback
  try {
    const raw = await callNemotron(prompt);
    return cleanAndParseJSON(raw);
  } catch (err) {
    logger.warn(`Nemotron fallback failed (${err.message}), cycling through general JSON generator`);
  }

  // Final fallback: standard provider chain
  return generateContentJSON(prompt);
}

/**
 * Main function to generate content and parse it as JSON.
 * It will try available keys in order, falling back dynamically.
 */
async function generateContentJSON(prompt) {
  // Retrieve keys
  const geminiKeys = getKeys(process.env.GEMINI_API_KEY);
  const groqKeys = getKeys(process.env.GROQ_API_KEY);
  const nvidiaKeys = getKeys(process.env.NVIDIA_API_KEY);

  // Group candidates to try: { provider, key, callFn }
  const candidates = [];

  groqKeys.forEach(key => {
    if (!isKeyOnCooldown(key)) {
      candidates.push({ provider: 'Groq', key, callFn: callGroq });
    }
  });

  geminiKeys.forEach(key => {
    if (!isKeyOnCooldown(key)) {
      candidates.push({ provider: 'Gemini', key, callFn: callGemini });
    }
  });

  nvidiaKeys.forEach(key => {
    if (!isKeyOnCooldown(key)) {
      candidates.push({ provider: 'Nvidia', key, callFn: callNvidia });
    }
  });

  if (candidates.length === 0) {
    throw new Error('AI Service: No active API keys are available (all are missing or on cooldown).');
  }

  // Iterate over candidates and try them
  for (const candidate of candidates) {
    try {
      const responseText = await candidate.callFn(candidate.key, prompt);
      const parsed = cleanAndParseJSON(responseText);
      return parsed;
    } catch (err) {
      const errMsg = err.response && err.response.data && err.response.data.error 
        ? JSON.stringify(err.response.data.error)
        : err.message;
      
      logger.error(`AI Service: Error with ${candidate.provider} API call: ${errMsg}`);
      
      // If rate limited or standard server errors, put the key on cooldown with dynamic duration
      const status = err.response ? err.response.status : null;
      const isTimeout = !err.response || err.message.toLowerCase().includes('timeout');

      if (status === 400 || status === 413) {
        // Request-specific errors, don't cool down the key
        continue;
      }

      if (status || isTimeout) {
        let duration = 5 * 60 * 1000; // default 5 minutes
        if (status === 429) {
          duration = 10 * 1000; // 10s for rate limit
        } else if (status === 503) {
          duration = 15 * 1000; // 15s for service unavailable
        } else if (isTimeout) {
          duration = 30 * 1000; // 30s for timeout
        } else if (status === 401 || status === 403) {
          duration = 5 * 60 * 1000; // 5 mins for auth/quota errors
        }
        setKeyCooldown(candidate.key, candidate.provider, duration);
      }
    }
  }

  throw new Error('AI Service: All configured API providers failed or reached their quota limit.');
}

/**
 * Call Gemini Multimodal API with Base64 image
 */
async function callGeminiMultimodal(key, prompt, imageBase64, mimeType, history = []) {
  const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  const actualModel = model.includes('3.5') ? 'gemini-1.5-flash' : model;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${actualModel}:generateContent?key=${key}`;
  
  logger.info(`AI Service: Attempting Multimodal with Gemini model ${actualModel}`);
  const contents = [];
  if (history && history.length > 0) {
    history.forEach(msg => {
      contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.text }]
      });
    });
  }
  contents.push({
    role: 'user',
    parts: [
      { text: prompt },
      {
        inlineData: {
          mimeType: mimeType || 'image/png',
          data: imageBase64
        }
      }
    ]
  });

  const response = await axios.post(
    url,
    {
      contents: contents
    },
    { timeout: 30000 }
  );

  if (!response.data || !response.data.candidates || !response.data.candidates[0]) {
    throw new Error('Invalid response structure from Gemini API');
  }
  return response.data.candidates[0].content.parts[0].text;
}

/**
 * Generate responses for the multimodal copilot chat (markdown output)
 */
async function generateCopilotResponse(prompt, imageBase64 = null, mimeType = null, history = []) {
  const geminiKeys = getKeys(process.env.GEMINI_API_KEY);
  const groqKeys = getKeys(process.env.GROQ_API_KEY);

  const candidates = [];

  if (!imageBase64) {
    groqKeys.forEach(key => {
      if (!isKeyOnCooldown(key)) {
        candidates.push({ provider: 'Groq', key, callFn: (k, p, hist) => callGroq(k, p, hist) });
      }
    });
  }

  geminiKeys.forEach(key => {
    if (!isKeyOnCooldown(key)) {
      if (imageBase64) {
        candidates.push({
          provider: 'Gemini',
          key,
          callFn: (k, p, hist) => callGeminiMultimodal(k, p, imageBase64, mimeType, hist)
        });
      } else {
        candidates.push({ provider: 'Gemini', key, callFn: (k, p, hist) => callGemini(k, p, hist) });
      }
    }
  });

  if (candidates.length === 0) {
    throw new Error('AI Service: No active API keys are available (all are missing or on cooldown).');
  }

  for (const candidate of candidates) {
    try {
      const responseText = await candidate.callFn(candidate.key, prompt, history);
      if (typeof responseText === 'string') {
        const trimmed = responseText.trim();
        if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
          try {
            const parsed = JSON.parse(trimmed);
            return parsed.reply || parsed.response || parsed.text || parsed.message || parsed.content || responseText;
          } catch (e) {
            // Not valid JSON, return raw responseText
          }
        }
      }
      return responseText;
    } catch (err) {
      const errMsg = err.response && err.response.data && err.response.data.error 
        ? JSON.stringify(err.response.data.error)
        : err.message;
      
      logger.error(`AI Service Copilot: Error with ${candidate.provider} API call: ${errMsg}`);
      
      const status = err.response ? err.response.status : null;
      const isTimeout = !err.response || err.message.toLowerCase().includes('timeout');

      if (status === 400 || status === 413) {
        // Request-specific errors, don't cool down the key
        continue;
      }

      if (status || isTimeout) {
        let duration = 5 * 60 * 1000;
        if (status === 429) {
          duration = 10 * 1000;
        } else if (status === 401 || status === 403) {
          duration = 5 * 60 * 1000;
        }
        setKeyCooldown(candidate.key, candidate.provider, duration);
      }
    }
  }

  throw new Error('AI Service: All configured API providers failed or reached their quota limit.');
}

module.exports = {
  generateContentJSON,
  generateWithNemotron,
  generateCopilotResponse,
  isKeyOnCooldown,
  cooldowns
};
