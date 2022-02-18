var en2ja = {
  "estradiol": "エストラジオール",
  "conjugated estrogen": "結合型エストロゲン",
  "estradiol valerate": "エストラジオール吉草酸エステル",
  "medroxyprogesterone acetate": "メドロキシプロゲステロン酢酸エステル"
}

var i18nElements = document.querySelectorAll(".i18n");
for (let element of i18nElements) {
  element.en = element.textContent;
}

var language = "en";
var languageForm = document.querySelector("#language-form");
var radios = document.querySelectorAll("#language-form input[type=radio]");
for (let radio of radios) {
  radio.addEventListener('change', function(e) {
    language = this.value;
    i18n();
  });
}


function i18n() {
  let dict = null;
  if (language == "ja") {
    dict = en2ja;
  } else if (language == "en") {
    for (const e of i18nElements) {
      e.textContent = e.en;
    }
    return;
  }
  for (const e of i18nElements) {
    let t = e.textContent.toLowerCase();
    if (t in en2ja) {
      e.textContent = dict[t];
    }
  }
}