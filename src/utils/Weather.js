export default {
  getWeather: async (lat, lng, units = 'metric') => {
    const API_KEY = '0767154632f1094875e115c23fd8b8c9';
    const url = `http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=${units}&appid=${API_KEY}`;
    const res = await fetch(url);
    const resJson = await res.json();
    return resJson.main;
  },
};
