#!/usr/bin/env python3
import os

file_path = 'src/components/ChatBot.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

old_code = """            } else {
                botResponse = generateResponse(intent);
                
                if (action === 'report') {
                botResponse = {
                    ...botResponse,
                    text: 'يمكنك الإبلاغ عن سيارة مفقودة من خلال الضغط على زر "إضافة سيارة" في الصفحة الرئيسية',
                    suggestions: [
                        { text: 'اذهب للصفحة الرئيسية', action: 'home' },
                        { text: 'هل تحتاج مساعدة أخرى؟', action: 'help' }
                    ]
                };
            } else if (action === 'investigator') {
                botResponse = {
                    ...botResponse,
                    text: 'يمكنك عرض قائمة المحققين المتخصصين والحجز معهم مباشرة',
                    suggestions: [
                        { text: 'عرض المحققين', action: 'investigators' },
                        { text: 'معلومات عن الخدمة', action: 'help' }
                    ]
                };
            } else if (action === 'faq_search') {
                botResponse = {
                    ...botResponse,
                    text: 'للبحث عن سيارة: استخدم شريط البحث العلوي، أدخل اسم الماركة أو الموديل أو رقم اللوحة، وسيظهر لك جميع السيارات المطابقة.'
                };
            }"""

new_code = """            } else {
                botResponse = generateResponse(intent);
                
                if (action === 'report') {
                    botResponse = {
                        ...botResponse,
                        text: 'يمكنك الإبلاغ عن سيارة مفقودة من خلال الضغط على زر "إضافة سيارة" في الصفحة الرئيسية',
                        suggestions: [
                            { text: 'اذهب للصفحة الرئيسية', action: 'home' },
                            { text: 'هل تحتاج مساعدة أخرى؟', action: 'help' }
                        ]
                    };
                } else if (action === 'investigator') {
                    botResponse = {
                        ...botResponse,
                        text: 'يمكنك عرض قائمة المحققين المتخصصين والحجز معهم مباشرة',
                        suggestions: [
                            { text: 'عرض المحققين', action: 'investigators' },
                            { text: 'معلومات عن الخدمة', action: 'help' }
                        ]
                    };
                } else if (action === 'faq_search') {
                    botResponse = {
                        ...botResponse,
                        text: 'للبحث عن سيارة: استخدم شريط البحث العلوي، أدخل اسم الماركة أو الموديل أو رقم اللوحة، وسيظهر لك جميع السيارات المطابقة.'
                    };
                }
            }"""

if old_code in content:
    content = content.replace(old_code, new_code)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("ChatBot.jsx fixed successfully")
else:
    print("Could not find the section to fix")
