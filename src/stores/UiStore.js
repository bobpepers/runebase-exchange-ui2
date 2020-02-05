import { observable, action, reaction } from 'mobx';
import moment from 'moment';
import { Routes } from 'constants';
import locales from '../languageProvider';


export default class UiStore {
  @observable location = Routes.EXCHANGE

  @observable locale = localStorage.getItem('lang') || this.defaultLocale

  @observable error = null

  get localeMessages() {
    return locales[this.locale].messages;
  }

  get defaultLocale() {
    let locale = navigator.language || navigator.userLanguage || '';
    if (locale.startsWith('nl')) {
      locale = 'nl-BE';
    } else if (locale.startsWith('be')) {
      locale = 'nl-BE';
    } else if (locale.startsWith('pt')) {
      locale = 'pt-BR';
    } else if (locale.startsWith('br')) {
      locale = 'pt-BR';
    } else { // Location Other than ko and zh will now return en-US
      locale = 'en-US';
    }
    return locale;
  }

  constructor() {
    reaction( // whenever the locale changes, update locale in local storage and moment
      () => this.locale,
      () => {
        moment.locale(locales[this.locale].momentlocale);
        localStorage.setItem('lang', this.locale);
      },
      { fireImmediately: true }
    );
  }

  @action // this setter is only here so we don't have to import `locales` into other files
  changeLocale = (newLocale) => {
    this.locale = locales[newLocale].locale;
  }

  @action
  setError = (message, route) => {
    this.error = { message, route };
  }

  @action
  clearError = () => {
    this.error = null;
  }
}
