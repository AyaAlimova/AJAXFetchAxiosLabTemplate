import axios from "axios";
import { createCarouselItem, clear, appendCarousel, start } from './Carousel.js';


export async function imagesAlternative(event) {
  const breedId = event.target.value;
  const infoDump = document.getElementById('infoDump'); 

  if (!breedId) return; 

  try {
    const response = await axios.get(`https://api.thecatapi.com/v1/images/search`, {
      params: {
        breed_ids: breedId,
        limit: 5
      }
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
      <p><strong>Life Span:</strong> ${breed.life_span} years</p>
    `;
  } catch (error) {
    console.error(error);
  }
}

document.getElementById('breedSelect').addEventListener('change', imagesAlternative);
