import storage from 'implementations/storage';

const MIN_ALLOWED_VERSION = 3;

let resultCache = null;

const checkQuestionnaire = async () => {
  if (resultCache) return resultCache;

  return fetch('https://id.flux3dp.com/api/questionnaire/1')
    .then((response) => {
      if (response.status !== 200) {
        throw new Error();
      }
      return response.json();
    })
    .then((myJson) => {
      const lastQuestionnaireVersion = storage.get('questionnaire-version') || 0;
      if (myJson.version > lastQuestionnaireVersion && myJson.version >= MIN_ALLOWED_VERSION) {
        resultCache = myJson;
        return myJson;
      }
      return null;
    })
    .catch(() => null);
};

export default checkQuestionnaire;
