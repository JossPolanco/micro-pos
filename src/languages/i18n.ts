import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import translationEN from "./en/translation_en.json";
import translationES from "./es/translation_es.json";

// TRANSLATION RESOURCES FOR ENGLISH AND SPANISH
const resources = {
	en: {
		translation: translationEN,
	},
	es: {
		translation: translationES,
	},
};

// INITIALIZE I18NEXT WITH SPANISH AS DEFAULT LANGUAGE
i18n.use(initReactI18next).init({
	resources,
	lng: "es",
	fallbackLng: "es",
	interpolation: {
		escapeValue: false,
	},
});

export default i18n;

