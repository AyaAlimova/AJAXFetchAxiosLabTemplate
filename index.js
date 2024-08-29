import { error } from "jquery";
//import * as Carousel from "./Carousel.js";
import { createCarouselItem, clear, appendCarousel, start } from './Carousel.js';
import axios from "axios";

// The breed selection input element.
const breedSelect = document.getElementById("breedSelect");
// The information section div element.
const infoDump = document.getElementById("infoDump");
// The progress bar div element.
const progressBar = document.getElementById("progressBar");
// The get favourites button element.
const getFavouritesBtn = document.getElementById("getFavouritesBtn");

// Step 0: Store your API key here for reference and easy access.
const API_KEY = "live_Q5hqhaXUDUK2zbR70EELarM0IJEPFoFNm7KTuHjRB6SFMaHhOO8OYxVIl7m0eWQ4";


// Create an async function "initialLoad" that does the following:
async function initialLoad() {
  const url = await fetch('https://api.thecatapi.com/v1/breeds')
  const data = await url.json();
  data.forEach(breed => {
    const option = document.createElement('option');
    option.value = breed.id;
    option.textContent = breed.name;
    breedSelect.appendChild(option);
  });
}
initialLoad();

/*
 Create an event handler for breedSelect that does the following:


async function handleBreedSelect(event) {
  const breedId = event.target.value;
  if (!breedId) return; 
  try {
    const response = await fetch(`https://api.thecatapi.com/v1/images/search?breed_ids=${breedId}&limit=5`);
    const images = await response.json();

    clear();

    images.forEach(image => {
      const carouselItem = createCarouselItem(image.url,`Image of breed ${breedId}`, image.id)
      appendCarousel(carouselItem)
    });

    start();

    const breedResponse = await fetch(`https://api.thecatapi.com/v1/breeds/${breedId}`);
    const breed = await breedResponse.json();

    infoDump.innerHTML = `
      <h2>${breed.name}</h2>
      <p>${breed.description}</p>
      <p><strong>Origin:</strong> ${breed.origin}</p>
      <p><strong>Temperament:</strong> ${breed.temperament}</p>
      <p><strong>Life Span:</strong> ${breed.life_span} years</p>
    `;
  } catch (error) {
    console.error(error);
  }
}

breedSelect.addEventListener('change', handleBreedSelect);
*/

//Within this additional file, change all of your fetch() functions to Axios!

export async function handleBreedSelect(event) {
  const breedId = event.target.value;

  if (!breedId) return;

  try {
    const response = await axios.get(`https://api.thecatapi.com/v1/images/search`, {
      params: {
        breed_ids: breedId,
        limit: 5
      },
      onDownloadProgress: updateProgressBar()
    });
    const images = response.data;

    clear();

    images.forEach(image => {
      const carouselItem = createCarouselItem(image.url, `Image of breed ${breedId}`, image.id);
      appendCarousel(carouselItem);
    });

    start();

    const breedResponse = await axios.get(`https://api.thecatapi.com/v1/breeds/${breedId}`);
    const breed = breedResponse.data;

    infoDump.innerHTML = `
      <h2>${breed.name}</h2>
      <p>${breed.description}</p>
      <p><strong>Origin:</strong> ${breed.origin}</p>
      <p><strong>Temperament:</strong> ${breed.temperament}</p>
      <p><strong>Life Span:</strong> ${breed.life_span} years</p> `;
  } catch (error) {
    console.error(error);
  }
}

document.getElementById('breedSelect').addEventListener('change', handleBreedSelect);


//  Add axios interceptors to log the time between request and response to the console.

axios.interceptors.request.use(request => {
  progressBar.style.width = '0%'
  request.meta = { startTime: new Date() };
  document.body.style.cursor = 'progress'
  return request;
}, error => {
  return Promise.reject(error)
});

axios.interceptors.response.use(
  (response) => {
    updateProgressBar(100)

    const endTime = new Date();
    const duration = endTime - response.config.meta.startTime;
    console.log(`Request to ${response.config.url} took ${duration}ms`);
    document.body.style.cursor = 'default';
    return response;
  },
  (error) => {
    const endTime = new Date();
    const duration = endTime - error.config.meta.startTime;
    console.log(`Request to ${error.config.url} failed after ${duration}ms`)
    return Promise.reject(error)
  });

function updateProgressBar(percentage) {
  progressBar.style.width = `${percentage}%`
}

//Create a system to "favourite" certain images.

export async function favourite(imgId) {
  try {
    const response = await axios.get('https://api.thecatapi.com/v1/favourites', {
      headers: {
        'x-api-key': API_KEY
      }
    });

    const favourites = response.data;
    const favourite = favourites.find(fav => fav.image_id === imgId);

    if (favourite) {
      await axios.delete(`https://api.thecatapi.com/v1/favourites/${favourite.id}`, {
        headers: {
          'x-api-key': API_KEY
        }
      });
      console.log(`Image ${imgId} has been unfavourited.`);
    }

    else {
      await axios.post('https://api.thecatapi.com/v1/favourites', {
        image_id: imgId
      }, {
        headers: {
          'x-api-key': API_KEY
        }
      });
      console.log(`Image ${imgId} has been favourited`);
    }
  }
  catch (error) {
    console.error('Error adding favourite:', error)
  }

}

//Test your favourite() function by creating a getFavourites() function.

export async function getFavourites() {
  try {
    const response = await axios.get('https://api.thecatapi.com/v1/favourites', {
      headers: {
        'x-api-key': API_KEY
      }
    });
    const favourites = response.data;
    clear();
    console.log('Your favourites are:', favourites)
    favourites.forEach(favourite => {
      const carouselItem = createCarouselItem(favourite.image.url, 'Favorite Cat Image', favourite.id);
      appendCarousel(carouselItem)
    });
    start();
  }
  catch (error) {
    console.error('Error getting favourites', error)
  }

}
getFavouritesBtn.addEventListener('click', async () => {
  const favourites = await getFavourites();
})

