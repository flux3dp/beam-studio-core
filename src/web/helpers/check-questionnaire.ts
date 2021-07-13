let resultCache = null;

const checkQuestionnaire = async () => {
  if (resultCache) return resultCache;

  return fetch('https://flux3dp.com/api_entry/?key=beam-studio-qustionnaire')
    .then((response) => {
      if (response.status !== 200) {
        throw new Error();
      }
      return response.json();
    })
    .then((myJson) => {
      resultCache = myJson;
      return myJson;
    })
    .catch(() => null);
};

export default checkQuestionnaire;
