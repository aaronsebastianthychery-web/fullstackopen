import { useState, useEffect } from 'react'
import axios from 'axios'

const Country = ({ country }) => {
  const langKeys = Object.keys(country.languages || {})
  const api_key = import.meta.env.VITE_WEATHER_API_KEY

  const [weather, setWeather] = useState(null)

  useEffect(() => {
    if (!api_key || !country.capital) return

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${country.capital}&units=metric&appid=${api_key}`
    
    axios.get(url)
      .then(response => setWeather(response.data))
      .catch(err => console.error('Weather fetch failed', err))
  }, [country.capital, api_key])

  return (
    <div>
      <h1>{country.name.common}</h1>
      <p>capital {country.capital}</p>
      <p>area {country.area} km²</p>

      <h3>languages:</h3>
      <ul>
        {langKeys.map(key => (
          <li key={key}>{country.languages[key]}</li>
        ))}
      </ul>

      <img 
        src={country.flags.png} 
        alt={`flag of ${country.name.common}`} 
        width="160" 
      />

      {weather && (
        <div>
          <h3>Weather in {country.capital}</h3>
          <p>temperature {weather.main.temp} °C</p>
          <img 
            src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`} 
            alt={weather.weather[0].description} 
          />
          <p>wind {weather.wind.speed} m/s</p>
        </div>
      )}
    </div>
  )
}

const CountryListItem = ({ country, showCountry }) => (
  <p>
    {country.name.common} 
    <button onClick={() => showCountry(country)}>show</button>
  </p>
)

const App = () => {
  const [search, setSearch] = useState('')
  const [countries, setCountries] = useState([])
  const [error, setError] = useState(null)
  const [selectedCountry, setSelectedCountry] = useState(null)

  useEffect(() => {
    console.log('Fetching countries...')
    axios
      .get('https://studies.cs.helsinki.fi/restcountries/api/all')
      .then(response => {
        console.log('Countries loaded:', response.data.length, 'countries')
        setCountries(response.data)
        setError(null)
      })
      .catch(err => {
        console.error('Failed to load countries', err)
        setError('Failed to load countries. Check console for details.')
      })
  }, [])

  const handleSearch = e => {
    setSearch(e.target.value)
    setSelectedCountry(null)
  }

  const filteredCountries = countries.filter(c =>
    c.name.common.toLowerCase().includes(search.toLowerCase())
  )

  const showCountry = country => {
    setSelectedCountry(country)
    setSearch('')
  }

  let content

  if (error) {
    content = <p style={{ color: 'red' }}>{error}</p>
  } else if (selectedCountry) {
    content = <Country country={selectedCountry} />
  } else if (filteredCountries.length > 10) {
    content = <p>Too many matches, specify another filter</p>
  } else if (filteredCountries.length > 1) {
    content = (
      <div>
        {filteredCountries.map(c => (
          <CountryListItem key={c.cca3} country={c} showCountry={showCountry} />
        ))}
      </div>
    )
  } else if (filteredCountries.length === 1) {
    content = <Country country={filteredCountries[0]} />
  } else if (search) {
    content = <p>No countries found</p>
  } else {
    content = <p>Start typing to search countries</p>
  }

  return (
    <div>
      <h1>Countries</h1>
      find countries <input value={search} onChange={handleSearch} />
      {content}
    </div>
  )
}

export default App