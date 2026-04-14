const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const OWNER_CHAT_ID = process.env.OWNER_CHAT_ID;

function fmtDisplay(dateStr) {
  const [y, m, d] = dateStr.split('-');
  const months = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
  return `${parseInt(d)} ${months[parseInt(m) - 1]} ${y}`;
}

app.post('/api/book', async (req, res) => {
  try {
    const b = req.body;

    if (!BOT_TOKEN || !OWNER_CHAT_ID) {
      return res.status(500).json({
        ok: false,
        error: 'Не заданы TELEGRAM_BOT_TOKEN или OWNER_CHAT_ID'
      });
    }

    if (!b || !b.name || !b.phone || !b.service || !b.date || !b.time) {
      return res.status(400).json({
        ok: false,
        error: 'Не хватает данных записи'
      });
    }

    const msg =
      `🌸 Новая запись!\n\n` +
      `👤 ${b.name}\n` +
      `📞 ${b.phone}\n` +
      `💅 ${b.service}` +
      `${b.extras ? `\n✨ Доп: ${b.extras}` : ''}` +
      `\n📅 ${fmtDisplay(b.date)} в ${b.time}` +
      `\n⏱ ${b.duration}` +
      `\n💰 ${Number(b.price).toLocaleString('ru-RU')} ₽` +
      `${b.comment ? `\n💬 ${b.comment}` : ''}`;

    const tgResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: OWNER_CHAT_ID,
        text: msg
      })
    });

    const tgData = await tgResponse.json();

    if (!tgResponse.ok || !tgData.ok) {
      return res.status(500).json({
        ok: false,
        telegram_error: tgData
      });
    }

    res.json({ ok: true });
  } catch (error) {
    console.error('Ошибка сервера:', error);
    res.status(500).json({
      ok: false,
      error: 'Внутренняя ошибка сервера'
    });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Сервер запущен: http://localhost:${PORT}`);
});