/**
 * Преобразует григорианскую дату в хиджрийскую и отображает результат.
 * @param {Object} options - Настройки отображения.
 * @param {boolean} options.showWeekDay - Показывать ли день недели (по умолчанию: true).
 * @param {boolean} options.showGregDate - Показывать ли григорианскую дату (по умолчанию: false).
 * @param {string} options.separator - Разделитель между частями даты (по умолчанию: "-").
 * @param {string} options.weekDayLang - Язык дня недели: "ar", "ru" и т.д. (по умолчанию: "ar").
 * @param {string} options.hijriLang - Язык названий месяцев хиджры (по умолчанию: "ar").
 * @param {string} options.gregLang - Язык григорианской даты (не используется в текущем коде).
 * @param {number} options.correction - Коррекция в днях (по умолчанию: 0).
 */
function hijriDate(options = {}) {
    // Настройки по умолчанию
    const config = {
        showWeekDay: options.showWeekDay !== false,
        showGregDate: !!options.showGregDate,
        separator: typeof options.separator === "string" ? options.separator : " - ",
        weekDayLang: typeof options.weekDayLang === "string" ? options.weekDayLang : "ar",
        hijriLang: typeof options.hijriLang === "string" ? options.hijriLang : "ar",
        gregLang: typeof options.gregLang === "string" ? options.gregLang : "ar",
        correction: typeof options.correction === "number" ? options.correction : 0,
    };

    // Названия месяцев хиджры
    const HIJRI_MONTHS = {
        ar: ["المحرم", "صفر", "ربيع الأول", "ربيع الآخر", "جمادى الأولى", "جمادى الآخرة", "رجب", "شعبان", "رمضان", "شوال", "ذو القعدة", "ذو الحجة"],
        ru: ["Мухаррам", "Сафар", "Раби-уль-авваль", "Раби-уль-ахир", "Джумад-уль-ула", "Джумад-уль-ахир", "Раджаб", "Шаъбан", "Рамадан", "Шавваль", "Зуль-каъда", "Зуль-хиджа"]
    };

    // Класс для хиджрийской даты
    class HijriDate {
        constructor(year, month, day) {
            this.year = year;
            this.month = month;
            this.day = day;
        }

        /**
         * Переводит хиджрийскую дату в фиксированный юлианский день (Rata Die).
         * @returns {number} Фиксированный день.
         */
        toFixed() {
            return this.day +
                Math.ceil(29.5 * (this.month - 1)) +
                354 * (this.year - 1) +
                Math.floor((11 * this.year + 3) / 30) +
                227015 - 1;
        }

        /**
         * Возвращает строковое представление хиджрийской даты.
         * @returns {string}
         */
        toString() {
            const monthName = HIJRI_MONTHS[config.hijriLang]?.[this.month - 1] || HIJRI_MONTHS.ar[this.month - 1];
            return `${this.day} ${monthName} ${this.year}`;
        }
    }

    /**
     * Переводит григорианскую дату в фиксированный юлианский день (Rata Die).
     * @param {number} year
     * @param {number} month - Месяц (1–12)
     * @param {number} day
     * @param {number} correction - Коррекция в днях
     * @returns {number}
     */
    function gregorianToFixed(year, month, day, correction = 0) {
        const s = month <= 2 ? 0 : (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0) ? -1 : -2;
        return 365 * (year - 1) +
            Math.floor((year - 1) / 4) -
            Math.floor((year - 1) / 100) +
            Math.floor((year - 1) / 400) +
            Math.floor((367 * month - 362) / 12) +
            s + day + correction;
    }

    /**
     * Переводит фиксированный день в хиджрийскую дату.
     * @param {number} fixedDay
     * @returns {HijriDate}
     */
    function fixedToHijri(fixedDay) {
        const start = new HijriDate(1100, 1, 1);
        start.year = Math.floor((30 * (fixedDay - 227015) + 10646) / 10631);

        const tempDate = new HijriDate(start.year, 1, 1);
        const month = Math.min(
            Math.ceil((fixedDay - 29 - tempDate.toFixed()) / 29.5) + 1,
            12
        );

        start.month = month;
        tempDate.year = start.year;
        tempDate.month = month;
        tempDate.day = 1;

        start.day = fixedDay - tempDate.toFixed() + 1;

        return start;
    }

    // Текущая григорианская дата
    const now = new Date();
    const gregYear = now.getFullYear();
    const gregMonth = now.getMonth() + 1; // Месяцы в JS — от 0
    const gregDay = now.getDate();

    // Переводим в фиксированный день с коррекцией
    const fixedGregorian = gregorianToFixed(gregYear, gregMonth, gregDay, config.correction);

    // Переводим в хиджрийскую дату
    const hijri = fixedToHijri(fixedGregorian);

    // Обновляем DOM
    const dayEl = document.getElementById("ar-day");
    const monthEl = document.getElementById("ar-mounth");
    const yearEl = document.getElementById("ar-year");

    if (dayEl) dayEl.innerHTML = hijri.day;
    if (monthEl) monthEl.innerHTML = HIJRI_MONTHS[config.hijriLang]?.[hijri.month - 1] || HIJRI_MONTHS.ar[hijri.month - 1];
    if (yearEl) yearEl.innerHTML = hijri.year;
}

// Вызов функции с настройками
hijriDate({
    showGregDate: false,
    showWeekDay: false,
    separator: "  |  ",
    weekDayLang: "ru",
    gregLang: "ru",
    hijriLang: "ru",
    correction: -0
});