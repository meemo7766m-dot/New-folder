# دليل إعداد EmailJS - خطوة بخطوة

## ✅ الخطوة 1: إنشاء حساب EmailJS

1. اذهب إلى **[emailjs.com](https://emailjs.com)**
2. اضغط **"Sign Up Free"**
3. سجل باستخدام:
   - Google (أسرع)
   - أو بريدك الإلكتروني
4. فعّل حسابك من البريد

---

## ✅ الخطوة 2: إضافة Email Service

1. بعد تسجيل الدخول، اضغط **"Add New Service"**
2. اختر **Gmail** (أو أي خدمة بريد تستخدمها)
3. اضغط **"Connect Account"**
4. سجل دخول بحساب Gmail الذي تريد الإرسال منه
5. اسمح بالأذونات
6. **انسخ Service ID** (مثل: `service_abc123`)
7. احفظه - سنحتاجه!

---

## ✅ الخطوة 3: إنشاء Email Template

1. من القائمة الجانبية، اضغط **"Email Templates"**
2. اضغط **"Create New Template"**
3. **احذف** كل المحتوى الموجود
4. **انسخ والصق** هذا القالب:

### Subject (الموضوع):
```
تحديث حالة بلاغ المركبة - {{plate_number}}
```

### Content (المحتوى):
```html
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px; direction: rtl; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .info-box { background: #f8f9fa; border-right: 4px solid #667eea; padding: 15px; margin: 20px 0; border-radius: 5px; }
        .info-row { padding: 10px 0; border-bottom: 1px solid #e9ecef; }
        .label { font-weight: bold; color: #495057; }
        .btn { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .footer { text-align: center; padding: 20px; color: #6c757d; font-size: 14px; background: #f8f9fa; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚗 تحديث حالة البلاغ</h1>
            <p>منصة مفقودات السودان</p>
        </div>
        <div class="content">
            <p>عزيزي المبلغ،</p>
            <p>نود إعلامك بأن حالة بلاغ المركبة الخاصة بك قد تم تحديثها:</p>
            
            <div class="info-box">
                <div class="info-row">
                    <span class="label">المركبة:</span>
                    <span>{{car_make}} {{car_model}} ({{car_year}})</span>
                </div>
                <div class="info-row">
                    <span class="label">رقم اللوحة:</span>
                    <span>{{plate_number}}</span>
                </div>
                <div class="info-row">
                    <span class="label">الحالة الجديدة:</span>
                    <span style="color: #10b981; font-weight: bold;">{{new_status}}</span>
                </div>
                <div class="info-row">
                    <span class="label">تاريخ التحديث:</span>
                    <span>{{update_date}}</span>
                </div>
            </div>

            <p>للمزيد من التفاصيل، يمكنك زيارة صفحة البلاغ:</p>
            <center>
                <a href="{{car_url}}" class="btn">عرض تفاصيل البلاغ</a>
            </center>
        </div>
        <div class="footer">
            <p>هذا بريد إلكتروني تلقائي، يرجى عدم الرد عليه</p>
            <p>© 2024 مفقودات السودان</p>
        </div>
    </div>
</body>
</html>
```

5. اضغط **"Save"**
6. **انسخ Template ID** (مثل: `template_xyz789`)
7. احفظه!

---

## ✅ الخطوة 4: الحصول على Public Key

1. من القائمة الجانبية، اضغط **"Account"**
2. ابحث عن **"Public Key"** أو **"API Keys"**
3. **انسخ Public Key** (مثل: `abcdefghijk123456`)
4. احفظه!

---

## ✅ الخطوة 5: تحديث الكود

الآن لديك 3 مفاتيح:
- **Service ID**: `service_abc123`
- **Template ID**: `template_xyz789`
- **Public Key**: `abcdefghijk123456`

**أخبرني بهم وسأحدث الكود لك فوراً!**

أو افتح ملف `Dashboard.jsx` واستبدل:
- `YOUR_SERVICE_ID` بـ Service ID
- `YOUR_TEMPLATE_ID` بـ Template ID
- `YOUR_PUBLIC_KEY` بـ Public Key

---

## ✅ اختبار النظام

1. احفظ الملف
2. أعد تشغيل الموقع: `npm run dev`
3. غير حالة بلاغ
4. **تحقق من بريدك!** 📧

---

**أخبرني عندما تحصل على المفاتيح الثلاثة!** 🔑
