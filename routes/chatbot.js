const express = require("express");
const router = express.Router();
const axios = require("axios");
const Listing = require("../models/listing"); // MongoDB model

router.post("/", async (req, res) => {
  try {
    const message = req.body?.message?.toLowerCase();

    // 🔐 Safety check
    if (!message) {
      return res.json({ reply: "Please type a message 😊" });
    }

    /* =====================================================
       1️⃣ TRY OPENAI (OPTIONAL / PAID)
    ====================================================== */
    if (process.env.OPENAI_API_KEY) {
      try {
        const response = await axios.post(
          "https://api.openai.com/v1/chat/completions",
          {
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "system",
                content: "You are a helpful travel assistant for WanderLust."
              },
              {
                role: "user",
                content: message
              }
            ]
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
              "Content-Type": "application/json"
            }
          }
        );

        return res.json({
          reply: response.data.choices[0].message.content
        });

      } catch (aiError) {
        console.log("⚠️ OpenAI failed, switching to free mode");
        // fallback continues below
      }
    }

    /* =====================================================
       2️⃣ FREE DATABASE-DRIVEN CHATBOT (DEFAULT)
    ====================================================== */

    let reply =
  "I can help you find destinations, stays, and budget options ✈️";

// ================= GREETINGS =================
if (
  message.includes("hi") ||
  message.includes("hello") ||
  message.includes("hey")||
  message.includes("hy")
) {
  reply =
    "Hello 👋 I’m your WanderLust assistant. Ask me about places or stays 😊";
}

// ================= HELP =================
else if (message.includes("help")) {
  reply =
    "You can ask me:\n" +
    "• Stays in Goa\n" +
    "• Hotels in Manali\n" +
    "• Budget stays under 2000\n" +
    "• Mountain stays\n" +
    "• Rooms in any city";
}

// ================= MOUNTAIN / HILLS =================
// 🔥 MUST COME BEFORE `in` CHECK
else if (
  message.includes("mountain") ||
  message.includes("mountains") ||
  message.includes("hill") ||
  message.includes("hills") ||
  message.includes("snow")
) {
  let listings = await Listing.find({
    $or: [
      { category: /mountain/i },
      { location: /manali|shimla|mussoorie|nainital|darjeeling/i }
    ]
  }).limit(3);

  // fallback → always show something
  if (listings.length === 0) {
    listings = await Listing.find().limit(3);
  }

  reply = "🏔️ Recommended mountain stays:\n\n";
  listings.forEach((l, i) => {
    reply +=
      `${i + 1}. ${l.title}\n` +
      `📍 ${l.location}\n` +
      `💰 ₹${l.price} / night\n` +
      `👉 <a href="/listings/${l._id}">View Listing</a>\n\n`;
  });
}

// ================= BUDGET =================
else if (message.includes("budget") || message.includes("cheap")) {
  let listings = await Listing.find({ price: { $lt: 2000 } }).limit(3);

  if (listings.length === 0) {
    listings = await Listing.find().limit(3);
  }

  reply = "💸 Budget-friendly stays:\n\n";
  listings.forEach((l, i) => {
    reply +=
      `${i + 1}. ${l.title}\n` +
      `💰 ₹${l.price} / night\n` +
      `👉 <a href="/listings/${l._id}">View Listing</a>\n\n`;
  });
}

// ================= CITY SEARCH =================
// KEEP THIS AFTER CATEGORY LOGIC
else if (message.includes(" in ")) {
  const cityMatch = message.match(/in\s+([a-zA-Z\s]+)/);

  if (cityMatch) {
    const city = cityMatch[1].trim();

    let listings = await Listing.find({
      location: { $regex: city, $options: "i" }
    }).limit(3);

    if (listings.length === 0) {
      listings = await Listing.find().limit(3);
    }

    reply = `🏙️ Stays you might like:\n\n`;
    listings.forEach((l, i) => {
      reply +=
        `${i + 1}. ${l.title}\n` +
        `📍 ${l.location}\n` +
        `💰 ₹${l.price} / night\n` +
        `👉 <a href="/listings/${l._id}">View Listing</a>\n\n`;
    });
  }
}

// ================= DEFAULT =================
// ❌ NEVER says “No stays found”
else {
  const listings = await Listing.find().limit(3);

  reply = "✨ Popular stays you may like:\n\n";
  listings.forEach((l, i) => {
    reply +=
      `${i + 1}. ${l.title}\n` +
      `💰 ₹${l.price} / night\n` +
      `👉 <a href="/listings/${l._id}">View Listing</a>\n\n`;
  });
}

return res.json({ reply });


  } catch (err) {
    console.error("Chatbot error:", err);
    return res.json({
      reply: "⚠️ Something went wrong. Please try again later."
    });
  }
});

module.exports = router;
