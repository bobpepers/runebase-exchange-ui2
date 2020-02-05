import appLocaleData from 'react-intl/locale-data/pt';
import ptMessages from '../locales/pt_BR.json';

const PtLang = {
  messages: {
    ...ptMessages,
  },
  locale: 'pt-BR',
  data: appLocaleData,
  momentlocale: 'pt',
};
export default PtLang;
