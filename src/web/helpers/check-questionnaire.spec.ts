import fetchMock from 'jest-fetch-mock';

import checkQuestionnaire from './check-questionnaire';

describe('test check-questionnaire', () => {
  test('success', async () => {
    const fetchSpy = jest.spyOn(window, 'fetch');
    fetchMock.mockResponse(JSON.stringify({
      urls: {
        de: 'https://flux3dp.typeform.com/to/h9tsya8V',
        en: 'https://flux3dp.typeform.com/to/aXXs4ti8',
        es: 'https://flux3dp.typeform.com/to/HxcjJwCD',
        ja: 'https://flux3dp.typeform.com/to/XWMjFw46',
        'zh-cn': 'https://flux3dp.typeform.com/to/AgdFTk5k',
        'zh-tw': 'https://flux3dp.typeform.com/to/QptA0aXU',
      },
      version: 1,
    }));

    const result = await checkQuestionnaire();
    expect(result.version).toBe(1);
    expect(result.urls).toEqual({
      de: 'https://flux3dp.typeform.com/to/h9tsya8V',
      en: 'https://flux3dp.typeform.com/to/aXXs4ti8',
      es: 'https://flux3dp.typeform.com/to/HxcjJwCD',
      ja: 'https://flux3dp.typeform.com/to/XWMjFw46',
      'zh-cn': 'https://flux3dp.typeform.com/to/AgdFTk5k',
      'zh-tw': 'https://flux3dp.typeform.com/to/QptA0aXU',
    });
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy.mock.calls[0][0]).toBe('https://flux3dp.com/api_entry/?key=beam-studio-qustionnaire');

    fetchSpy.mockReset();
    await checkQuestionnaire();
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
