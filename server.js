// استدعاء المكتبات التي ثبتناها
const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');

// إنشاء تطبيق الخادم
const app = express();
app.use(cors()); // السماح بالاتصال من أي مكان
app.use(express.json()); // السماح باستقبال بيانات JSON

// إنشاء نقطة النهاية (Endpoint) التي سيطلبها تطبيقك
// عندما يأتيك طلب POST على مسار /get-link، نفذ هذه الدالة
app.post('/get-link', async (req, res) => {
  // استخراج رابط الفيديو من الطلب القادم من تطبيق فلاتر
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'No URL provided' });
  }

  console.log(`Processing URL: ${url}`); // لطباعة الرابط في سجل الخادم

  // تشغيل متصفح كروم في الخلفية
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();

  try {
    // 1. اذهب إلى موقع التحميل
    await page.goto('https://en1.savefrom.net/13RZ/', { waitUntil: 'networkidle2' });

    // 2. اكتب رابط الفيديو في حقل الإدخال
    await page.type('input[type="text"]', url);

    // 3. اضغط على زر التحميل
    await page.click('button[type="submit"]');

    // 4. انتظر حتى يظهر رابط التحميل النهائي (حتى 20 ثانية)
    await page.waitForSelector('.def-btn-box a', { timeout: 20000 });

    // 5. استخرج الرابط من الصفحة
    const downloadLink = await page.$eval('.def-btn-box a', el => el.href);

    // 6. أغلق المتصفح
    await browser.close();

    // 7. أرسل الرابط النهائي إلى تطبيق فلاتر
    console.log(`Found link: ${downloadLink}`);
    return res.json({ downloadLink: downloadLink });

  } catch (err) {
    // في حال حدوث خطأ (مثل انتهاء الوقت أو عدم العثور على رابط)
    console.error('Error:', err.message);
    await browser.close(); // تأكد من إغلاق المتصفح دائمًا
    return res.status(500).json({ error: 'Failed to get download link' });
  }
});

// تشغيل الخادم على المنفذ (Port) الذي تحدده الاستضافة أو 3000 محليًا
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 