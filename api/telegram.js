// api/telegram.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const testData = req.body;
    
    // Your Telegram bot configuration
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
    
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      console.error('Telegram credentials not configured');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Create the message for Telegram
    const message = createTelegramMessage(testData);
    
    // Send to Telegram
    const telegramResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML'
      })
    });

    if (!telegramResponse.ok) {
      throw new Error('Failed to send message to Telegram');
    }

    // If you also want to send the PDF, you can handle it here
    // This would require additional setup for file uploads

    res.status(200).json({ success: true, message: 'Test data sent to Telegram' });
  } catch (error) {
    console.error('Error sending to Telegram:', error);
    res.status(500).json({ error: 'Failed to send data to Telegram' });
  }
}

function createTelegramMessage(testData) {
  const violations = testData.violations;
  
  let message = `<b>📝 IELTS WRITING TEST SUBMISSION</b>\n\n`;
  message += `<b>👤 Student:</b> ${escapeHtml(testData.studentName)}\n`;
  message += `<b>⏰ Duration:</b> ${testData.duration}\n`;
  message += `<b>📊 Submission Type:</b> ${testData.submissionType}\n`;
  message += `<b>🕒 Timestamp:</b> ${new Date(testData.timestamp).toLocaleString()}\n\n`;
  
  message += `<b>🚨 VIOLATION REPORT</b>\n`;
  message += `<b>• Total Violations:</b> ${violations.totalViolations}\n`;
  message += `<b>• Final Warning Count:</b> ${violations.warningCount}/2\n\n`;
  
  message += `<b>📋 Violation Details:</b>\n`;
  message += `<code>• Tab Switching:</code> ${violations.detailed.tabSwitching}\n`;
  message += `<code>• App Switching:</code> ${violations.detailed.appSwitching}\n`;
  message += `<code>• High Typing Speed:</code> ${violations.detailed.highTypingSpeed}\n`;
  message += `<code>• Paste Detected:</code> ${violations.detailed.pasteDetected}\n`;
  message += `<code>• Rapid Keystrokes:</code> ${violations.detailed.rapidKeystrokes}\n\n`;
  
  message += `<b>⌨️ Typing Analysis:</b>\n`;
  message += `<code>• Task 1:</code> ${violations.typingData.task1.maxSpeed} WPM, Violations: ${violations.typingData.task1.speedViolations}, Pastes: ${violations.typingData.task1.pasteEvents}\n`;
  message += `<code>• Task 2:</code> ${violations.typingData.task2.maxSpeed} WPM, Violations: ${violations.typingData.task2.speedViolations}, Pastes: ${violations.typingData.task2.pasteEvents}\n\n`;
  
  message += `<b>📖 Word Counts:</b>\n`;
  message += `<code>• Task 1:</code> ${testData.task1.wordCount}\n`;
  message += `<code>• Task 2:</code> ${testData.task2.wordCount}\n\n`;
  
  message += `<b>📄 Task 1 Answer Preview:</b>\n`;
  message += `<code>${escapeHtml(testData.task1.answer.substring(0, 200))}${testData.task1.answer.length > 200 ? '...' : ''}</code>\n\n`;
  
  message += `<b>📄 Task 2 Answer Preview:</b>\n`;
  message += `<code>${escapeHtml(testData.task2.answer.substring(0, 200))}${testData.task2.answer.length > 200 ? '...' : ''}</code>`;

  return message;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
