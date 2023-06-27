import axios from "../node_modules/axios/index";

const form = document.querySelector('form')! as HTMLFormElement;
const addressInput = document.getElementById('address')! as HTMLInputElement;
const API_KEY = 'asi asi';

function searchAddressHandler(event: Event) {
  event.preventDefault();
  const enteredValue = addressInput.value;
  
  axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURI(enteredValue)}&key=${API_KEY}`)
  .then(response => {
    console.log(response);
    
  })
  .catch(err => {
    console.log(err)
  });
  
}

form.addEventListener('submit', searchAddressHandler)