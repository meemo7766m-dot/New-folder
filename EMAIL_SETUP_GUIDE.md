# دليل إعداد نظام الإشعارات بالبريد الإلكتروني

## الخطوة 1: تحديث قاعدة البيانات

1. افتح لوحة تحكم Supabase
2. اذهب إلى **SQL Editor**
3. نفذ الكود الموجود في ملف `add_owner_email.sql`:

```sql
ALTER TABLE cars ADD COLUMN IF NOT EXISTS owner_email TEXT;
CREATE INDEX IF NOT EXISTS idx_cars_owner_email ON cars(owner_email);
```

## الخطوة 2: إعداد Resend

1. سجل حساب مجاني في [resend.com](https://resend.com)
2. احصل على API Key من لوحة التحكم
3. تحقق من نطاقك (Domain) أو استخدم النطاق التجريبي

## الخطوة 3: نشر Edge Function

### تثبيت Supabase CLI

```bash
# Windows (PowerShell)
scoop install supabase

# أو استخدم npm
npm install -g supabase
```

### تسجيل الدخول وربط المشروع

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
```

### إعداد Environment Variables

```bash
supabase secrets set RESEND_API_KEY=your_resend_api_key_here
supabase secrets set SITE_URL=https://your-domain.com
```

### نشر الدالة

```bash
supabase functions deploy send-status-email
```

## الخطوة 4: اختبار النظام

1. سجل دخول كمشرف
2. أضف بلاغ جديد مع إدخال بريد إلكتروني صحيح
3. غير حالة البلاغ من "مفقود" إلى "تم العثور عليه"
4. تحقق من البريد الإلكتروني

## استكشاف الأخطاء

### إذا لم يصل البريد:

1. تحقق من Supabase Logs:
   ```bash
   supabase functions logs send-status-email
   ```

2. تحقق من Resend Dashboard للأخطاء

3. تأكد من صحة البريد الإلكتروني المدخل

4. تحقق من أن Edge Function منشورة بنجاح

### رسائل الخطأ الشائعة:

- **"Domain not verified"**: تحقق من نطاقك في Resend
- **"API key invalid"**: تأكد من صحة RESEND_API_KEY
- **"Function not found"**: نفذ `supabase functions deploy` مرة أخرى

## الملفات المعدلة

- ✅ `add_owner_email.sql` - إضافة حقل البريد
- ✅ `Dashboard.jsx` - إضافة حقل الإدخال وإرسال الإشعار
- ✅ `supabase/functions/send-status-email/index.ts` - Edge Function

## الميزات

- ✅ إشعار تلقائي عند تغيير الحالة
- ✅ قالب بريد احترافي بالعربية
- ✅ رابط مباشر لصفحة البلاغ
- ✅ تصميم responsive للبريد
- ✅ معالجة الأخطاء

## التكلفة

- Resend: مجاني حتى 3,000 بريد/شهر
- Supabase Edge Functions: مجاني حتى 500,000 طلب/شهر
