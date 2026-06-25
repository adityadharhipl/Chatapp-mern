import OpenAI from "openai";

let openai = null;

const fallbackResponses = {
  greetings: [
    "👋 Hello!",
    "Hi there!",
    "Hey! Great to see you.",
    "Welcome to the chat!",
    "How's your day going?"
  ],

  morning: [
    "🌞 Good morning! Have a wonderful day ahead.",
    "Morning! Hope you're feeling great today.",
    "Rise and shine! ✨",
    "Have a fantastic start to your day!"
  ],

  evening: [
    "🌆 Good evening!",
    "Hope you had a great day.",
    "Good evening! Time to relax.",
    "Wishing you a peaceful evening."
  ],

  thanks: [
    "You're welcome! 😊",
    "Happy to help!",
    "My pleasure!",
    "Anytime!"
  ],

  coding: [
    "💻 Debugging is detective work in disguise.",
    "Practice makes programming easier every day.",
    "Every expert programmer was once a beginner.",
    "Break big problems into smaller ones."
  ],

  jokes: [
    "😄 Why do programmers prefer dark mode? Because light attracts bugs.",
    "I would tell you a UDP joke, but you might not get it.",
    "Why did the computer get cold? It left its Windows open."
  ],

  general: [
    "That's interesting!",
    "Tell me more.",
    "I'd love to hear your thoughts.",
    "What do you think?",
    "That sounds exciting.",
    "Thanks for sharing.",
    "Interesting perspective.",
    "Can you elaborate?",
    "I'm listening 👂",
    "That's worth thinking about."
  ]
};

function random(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getFallbackResponse(prompt) {
  const text = prompt.toLowerCase().trim();

  if (
    text.includes("good morning") ||
    text.includes("morning")
  ) {
    return random(fallbackResponses.morning);
  }

  if (
    text.includes("good evening") ||
    text.includes("evening")
  ) {
    return random(fallbackResponses.evening);
  }

  if (
    text === "hi" ||
    text === "hello" ||
    text === "hey" ||
    text.includes("hi ")
  ) {
    return random(fallbackResponses.greetings);
  }

  if (
    text.includes("thank")
  ) {
    return random(fallbackResponses.thanks);
  }

  if (
    text.includes("react") ||
    text.includes("javascript") ||
    text.includes("node") ||
    text.includes("coding") ||
    text.includes("programming")
  ) {
    return random(fallbackResponses.coding);
  }

  if (
    text.includes("joke")
  ) {
    return random(fallbackResponses.jokes);
  }

  return random(fallbackResponses.general);
}

export const getAIResponse = async (prompt) => {
  try {
    // No API key → use smart fallback bot
    if (!process.env.OPENAI_API_KEY) {
      return getFallbackResponse(prompt);
    }

    if (!openai) {
      openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a friendly AI assistant in a public global chat room. Keep replies short and conversational."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 150
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("OpenAI API Error:", error.message);

    // Quota exceeded or API failed
    return getFallbackResponse(prompt);
  }
};




// import OpenAI from 'openai';

// let openai = null;

// const fallbackResponses = [
//   "Hello there! How are you doing today?",
//   "I'm currently resting my AI brain, but how can I help you?",
//   "That's interesting! Tell me more.",
//   "I'm just a simple bot right now, but I hope you are having a great day!",
//   "Nice to meet you! What's on your mind?",
//   "I see! How is the weather where you are?",
//   "Oh wow, that sounds cool!",
//   "I'm here, just hanging out in the chat.",
//   "Good to see you! Anything exciting happening today?",
//   "My circuits are a bit tired today, but I'm still listening!",
//   "I'm saving my energy, but I'm always happy to chat.",
//   "What are your plans for the weekend?",
//   "I'm currently running on backup battery, but hello!",
//   "If I were a human, I'd probably need a coffee right now ☕",
//   "That makes sense. What else is going on?",
//   "I'm always learning new things, just like you!",
//   "Sometimes it's nice to just relax and chat.",
//   "I don't have all the answers right now, but I enjoy the conversation.",
//   "Fascinating! I'd love to hear more about that.",
//   "Hope you're having a wonderful day!",
//   "I'm doing great, thanks for chatting with me!"
// ];

// const getRandomFallback = () => {
//   const randomIndex = Math.floor(Math.random() * fallbackResponses.length);
//   return fallbackResponses[randomIndex] + " 🤖";
// };

// export const getAIResponse = async (prompt) => {
//   try {
//     // Lazily initialize to prevent server crash on startup if API key is missing
//     if (!openai) {
//       if (!process.env.OPENAI_API_KEY) {
//         return getRandomFallback();
//       }
//       openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
//     }

//     const response = await openai.chat.completions.create({
//       model: "gpt-4o-mini",
//       messages: [
//         { role: "system", content: "You are a helpful and friendly AI assistant participating in a global chat room." },
//         { role: "user", content: prompt }
//       ],
//       max_tokens: 250, // Keep responses relatively brief for chat
//     });

//     return response.choices[0].message.content;
//   } catch (error) {
//     console.error("OpenAI API Error:", error.message || error);
//     return getRandomFallback();
//   }
// };
