'use client';

import { useState } from 'react';
import Image from 'next/image';
import { WeatherData, CityImage } from '@/types/weather';

export default function Home() {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [cityImage, setCityImage] = useState<CityImage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchWeatherAndImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!city.trim()) return;

    setLoading(true);
    setError('');
    
    try {
      // Fetch weather data
      const weatherRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${process.env.NEXT_PUBLIC_WEATHER_API_KEY}`
      );
      
      if (!weatherRes.ok) throw new Error('City not found');
      const weatherData: WeatherData = await weatherRes.json();
      
      // Fetch city image
      const imageRes = await fetch(
        `https://api.unsplash.com/search/photos?query=${city} city&client_id=${process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY}&per_page=1`
      );
      
      const imageData = await imageRes.json();
      if (imageData.results.length > 0) {
        setCityImage(imageData.results[0]);
      }
      
      setWeatherData(weatherData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-white text-center mb-8">
          Weather Lookup
        </h1>
        
        <form onSubmit={fetchWeatherAndImage} className="mb-8">
          <div className="flex gap-2">
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Enter city name..."
              className="flex-1 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-800 font-medium"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-600 
                       disabled:bg-blue-400 transition-colors font-semibold"
            >
              {loading ? 'Loading...' : 'Search'}
            </button>
          </div>
        </form>

        {error && (
          <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg font-medium">
            {error}
          </div>
        )}

        {weatherData && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="grid md:grid-cols-2 gap-4">
              {cityImage && (
                <div className="relative h-64 md:h-full">
                  <Image
                    src={cityImage.urls.regular}
                    alt={cityImage.alt_description || city}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">{weatherData.name}</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Image
                      src={`http://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`}
                      alt={weatherData.weather[0].description}
                      width={50}
                      height={50}
                    />
                    <span className="text-xl font-bold text-gray-800">
                      {Math.round(weatherData.main.temp)}°C
                    </span>
                  </div>
                  
                  <p className="capitalize font-medium text-gray-700">
                    {weatherData.weather[0].description}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-700 font-medium">Feels like</p>
                      <p className="font-bold text-gray-800">
                        {Math.round(weatherData.main.feels_like)}°C
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-700 font-medium">Humidity</p>
                      <p className="font-bold text-gray-800">{weatherData.main.humidity}%</p>
                    </div>
                    <div>
                      <p className="text-gray-700 font-medium">Wind Speed</p>
                      <p className="font-bold text-gray-800">{weatherData.wind.speed} m/s</p>
                    </div>
                    <div>
                      <p className="text-gray-700 font-medium">Pressure</p>
                      <p className="font-bold text-gray-800">
                        {weatherData.main.pressure} hPa
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}