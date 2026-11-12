export async function onRequestPost({ request, env }) {
  try {
    const { name, phone, date, time, guests } = await request.json();

    if (!name || !phone) {
      return new Response(JSON.stringify({ error: 'Missing fields' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const BOT_TOKEN = env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = env.TELEGRAM_CHAT_ID;

    // Формируем красивое сообщение для администратора
    const text = `🔔 *Новая заявка на бронирование!*\n\n` +
                 `👤 *Имя:* ${name}\n` +
                 `📞 *Телефон:* ${phone}\n` +
                 (date ? `📅 *Дата:* ${date}\n` : '') +
                 (time ? `⏰ *Время:* ${time}\n` : '') +
                 (guests ? `👥 *Гостей:* ${guests}\n` : '');

    // Отправляем в Telegram
    const tgResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: text,
        parse_mode: 'Markdown'
      })
    });

    if (!tgResponse.ok) {
      throw new Error('Telegram API error');
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}