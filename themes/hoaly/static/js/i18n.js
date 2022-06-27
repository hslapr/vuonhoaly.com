function setLanguage(lang) {
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

var radios = document.querySelectorAll('input[name=i18n-language]');
var formi18n = document.querySelector('#form-i18n');
let formi18ndata = new FormData(formi18n);
setLanguage(formi18ndata.get('i18n-language'));

for (let radio of radios) {
    radio.addEventListener('change', function (e) {
        let formi18ndata = new FormData(formi18n);
        setLanguage(formi18ndata.get('i18n-language'));
    });
}