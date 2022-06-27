function i18nSetLanguage(lang) {
    for (let id in i18n) {
        if (lang in i18n[id]) {
            let es = document.querySelectorAll('.i18n.' + id);
            for (const e of es) {
                e.innerText = i18n[id][lang];
                e.lang = lang;
            }
        }
    }
}

var i18nLanguageSelect = document.querySelector('#form-languages select');
var i18nFormLanguages = document.querySelector('#form-languages');
let i18nFormLanguagesData = new FormData(i18nFormLanguages);
i18nSetLanguage(i18nFormLanguagesData.get('language'));


i18nLanguageSelect.addEventListener('change', function (e) {
    let formLanguagesData = new FormData(i18nFormLanguages);
    i18nSetLanguage(formLanguagesData.get('language'));
});