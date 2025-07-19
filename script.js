document.addEventListener('DOMContentLoaded', async () => {
    const languageSelect = document.getElementById('language-select');
    const htmlElement = document.documentElement;

    let translations = {}; // ประกาศตัวแปร translations ไว้ข้างนอก เพื่อรอรับข้อมูลจาก JSON

    try {
        const response = await fetch('translations.json'); // โหลดไฟล์ JSON
        if (!response.ok) { // ตรวจสอบว่าการโหลดสำเร็จหรือไม่
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        translations = await response.json(); // แปลง response เป็น JSON
    } catch (error) {
        console.error('Error loading translations:', error); // แสดงข้อผิดพลาดหากโหลดไม่ได้
        // หากโหลด translations ไม่ได้ อาจจะต้องการแจ้งผู้ใช้ หรือใช้ภาษาเริ่มต้น
        alert('Failed to load translations. Please try again later.');
        return; // หยุดการทำงานหากโหลดไฟล์แปลไม่ได้
    }

    // Function to apply translations
    const applyTranslations = (lang) => {
        const currentTranslations = translations[lang];
        if (!currentTranslations) {
            console.warn(`No translations found for language: ${lang}`);
            return;
        }

        // ตั้งค่า attribute 'lang' บนแท็ก <html> เพื่อประโยชน์ด้านการเข้าถึงและ SEO
        htmlElement.lang = lang;

        // อัปเดต title ของเอกสาร
        const docTitleElement = document.querySelector('title');
        if (docTitleElement) {
            const key = docTitleElement.getAttribute('data-translate-key');
            if (key && currentTranslations[key]) {
                docTitleElement.textContent = currentTranslations[key];
            }
        }

        // อัปเดตข้อความในทุกองค์ประกอบที่มี attribute 'data-translate-key'
        document.querySelectorAll('[data-translate-key]').forEach(element => {
            const key = element.getAttribute('data-translate-key');
            if (currentTranslations[key]) {
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    // สำหรับ input/textarea ให้อัปเดต placeholder หรือ value ตามความเหมาะสม
                    if (element.hasAttribute('placeholder')) {
                        element.placeholder = currentTranslations[key];
                    }
                    // หากต้องการแปลค่าเริ่มต้น (value) ของ input เช่น "American", "15/07/2025"
                    // ที่เป็นส่วนหนึ่งของข้อมูลเริ่มต้นในฟอร์ม
                    // คุณสามารถเปิดใช้งานบรรทัดนี้ได้
                    // element.value = currentTranslations[key];
                } else if (element.tagName === 'OPTGROUP' || element.tagName === 'OPTION') {
                    // สำหรับตัวเลือกใน select (option)
                    element.textContent = currentTranslations[key];
                } else {
                    // สำหรับองค์ประกอบอื่นๆ (p, label, h1, span, div, เป็นต้น)
                    element.textContent = currentTranslations[key];
                }
            }
        });
    };

    // เริ่มต้น: กำหนดภาษาที่เลือกจาก localStorage หรือใช้ 'en' เป็นค่าเริ่มต้น
    const savedLang = localStorage.getItem('selectedLanguage') || 'en';
    languageSelect.value = savedLang;
    applyTranslations(savedLang); // เรียกใช้ฟังก์ชันแปลภาษาครั้งแรกเมื่อหน้าโหลด

    // Event listener สำหรับเมื่อผู้ใช้เปลี่ยนภาษาใน dropdown
    languageSelect.addEventListener('change', (event) => {
        const selectedLang = event.target.value;
        localStorage.setItem('selectedLanguage', selectedLang); // บันทึกภาษาที่เลือกไว้ใน localStorage
        applyTranslations(selectedLang); // แปลภาษาทันทีเมื่อมีการเปลี่ยนแปลง
    });
});