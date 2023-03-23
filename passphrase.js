const words = [];

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
  const separator = document.querySelector("#separator").value;
  const addSpecial = document.querySelector("#addSpecial").checked;
  let password = [capitalizeFirstLetter(getRandomWord()), getRandomWord(), getRandomWord(), getRandomNumber()].join(separator);
  
  if (addSpecial) {
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

loadDictionary(function() {
  const separator = localStorage.getItem("separator") || ".";
  document.querySelector("#separator").value = separator;
  generatePassword();
});

document.querySelector("#separator").addEventListener("change", function() {
  localStorage.setItem("separator", this.value);
  generatePassword();
});

document.querySelector("#addSpecial").addEventListener("change", function() {
  generatePassword();
});
