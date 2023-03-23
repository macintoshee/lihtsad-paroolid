const words = [];
let separator = ".";
let addSpecial = false;

function loadDictionary(callback) {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", "dictionary.txt", true);
  xhr.onload = function() {
    if (xhr.readyState === 4 && xhr.status === 200) {
      words.push(...xhr.responseText.trim().split("\n"));
      callback();
    }
  }
  xhr.send();
}

function generatePassword() {
  const password = [
    capitalizeFirstLetter(getRandomWord()), 
    getRandomWord(), 
    getRandomWord(), 
    getRandomNumber(), 
    addSpecial ? getRandomSpecial() : ''
  ].join(separator);
  
  document.querySelector(".password").textContent = password;
}

function getRandomWord() {
  const word = words[Math.floor(Math.random() * words.length)];
  return capitalizeFirstLetter(word) === word ? word.toLowerCase() : word;
}

function getRandomNumber() {
  return Math.floor(Math.random() * 99) + 1;
}

function getRandomSpecial() {
  const specials = '!#$%&()*+,-/:;<=>?@\\_~';
  return specials[Math.floor(Math.random() * specials.length)];
}

function capitalizeFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function copyPassword() {
  const password = document.querySelector(".password").textContent;
  const textarea = document.createElement("textarea");
  textarea.value = password;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

function updateSeparator() {
  separator = document.querySelector("#separator").value;
  generatePassword();
  localStorage.setItem("separator", separator);
}

function updateAddSpecial() {
  addSpecial = document.querySelector("#addSpecial").checked;
  generatePassword();
  localStorage.setItem("addSpecial", addSpecial);
}

loadDictionary(function() {
  generatePassword();
  const savedSeparator = localStorage.getItem("separator");
  if (savedSeparator) {
    separator = savedSeparator;
    document.querySelector("#separator").value = separator;
    generatePassword();
  }
  const savedAddSpecial = localStorage.getItem("addSpecial");
  if (savedAddSpecial) {
    addSpecial = savedAddSpecial === "true";
    document.querySelector("#addSpecial").checked = addSpecial;
    generatePassword();
  }
});

document.querySelector("#separator").addEventListener("change", updateSeparator);
document.querySelector("#addSpecial").addEventListener("change", updateAddSpecial);
