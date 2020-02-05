import { addLocaleData } from 'react-intl';
import Enlang from './entries/en-US';
import Ptlang from './entries/pt-BR';
import Nllang from './entries/nl-BE';

addLocaleData(Enlang.data);
addLocaleData(Ptlang.data);
addLocaleData(Nllang.data);

export default {
  [Enlang.locale]: Enlang,
  [Ptlang.locale]: Ptlang,
  [Nllang.locale]: Nllang,
};
