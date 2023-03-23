const words = [];
let separator = localStorage.getItem('separator') || '.';

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
  const password = [capitalizeFirstLetter(getRandomWord()), getRandomWord(), getRandomWord(), getRandomNumber()].join(separator);
  if (document.querySelector("#addSpecial").checked) {
    password += getRandomSpecialCharacter();
  }
  document.querySelector(".password").textContent = password;
}

function getRandomWord() {
  const word = words[Math.floor(Math.random() * words.length)];
  return capitalizeFirstLetter(word) === word ? word.toLowerCase() : word;
}

function getRandomNumber() {
  return Math.floor(Math.random() * 99) + 1;
}

function getRandomSpecialCharacter() {
  const specialCharacters = "!#$%&()*+,-/:;<=>?@\\_~";
  return specialCharacters.charAt(Math.floor(Math.random() * specialCharacters.length));
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

function changeSeparator() {
  separator = document.querySelector("#separator").value;
  localStorage.setItem('separator', separator);
  generatePassword();
}

function loadSeparator() {
  const separatorSelect = document.querySelector("#separator");
  separatorSelect.value = separator;
  separatorSelect.addEventListener("change", changeSeparator);
}

loadDictionary(function() {
  loadSeparator();
  generatePassword();
});

document.querySelector("#addSpecial").addEventListener("change", generatePassword);
