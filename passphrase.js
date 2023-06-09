// Define an empty array to hold the dictionary words
const words = [];

// Function to load the dictionary from a file and populate the words array
function loadDictionary(callback) {
  // Create a new XMLHttpRequest object
  const xhr = new XMLHttpRequest();

  // Open a GET request to the dictionary file
  xhr.open("GET", "dictionary.txt", true);

  // When the request loads, check that it's ready and successful, then populate the words array
  xhr.onload = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      words.push(...xhr.responseText.trim().split("\n"));
      callback();
    }
  };

  // Send the request
  xhr.send();
}

// Function to generate a password
function generatePassword() {
  // Get the separator character and "add special character" checkbox value from the HTML
  const separator = document.querySelector("#separator").value;
  const addSpecial = document.querySelector("#addSpecial").checked;

  let password;
  let wordLength;

  // Keep generating password until the combined word length is less than or equal to 22 characters
    do {
    password = [
      getRandomWord(true),
      getRandomWord(),
      getRandomWord(),
      getRandomNumber(),
    ].join(separator);

    // Calculate the total word length without the separators and other characters
    wordLength = password
      .split(separator)
      .slice(0, 3)
      .join("").length;

  } while (wordLength > 22);

  // If the "add special character" checkbox is checked, add a random special character to the end of the password
  if (addSpecial) {
    password += getRandomSpecialCharacter();
  }

  // Display the generated password in the HTML
  document.querySelector(".password").textContent = password;
}

// Function to get a random word, with optional capitalization of the first letter
function getRandomWord(capitalize = false) {
  const word = words[Math.floor(Math.random() * words.length)];
  if (capitalize) {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }
  return word.toLowerCase();
}

// Function to generate a random number between 1 and 99
function getRandomNumber() {
  return Math.floor(Math.random() * 99) + 1;
}

// Function to generate a random special character from the list of special characters
function getRandomSpecialCharacter() {
  const specialCharacters = "!#$%&()*+,-/:;<=>?@\\_~";
  return specialCharacters.charAt(
    Math.floor(Math.random() * specialCharacters.length)
  );
}

// Function to copy the generated password to the clipboard
function copyPassword() {
  const password = document.querySelector(".password").textContent;
  const textarea = document.createElement("textarea");
  textarea.value = password;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

// Call the loadDictionary function to populate the words array, then generate and display an initial password
loadDictionary(function () {
  const separator = localStorage.getItem("separator") || ".";
  document.querySelector("#separator").value = separator;
  generatePassword();
});

// Add an event listener to the separator select box to update the local storage and generate a new password when the separator is changed
document.querySelector("#separator").addEventListener("change", function () {
  localStorage.setItem("separator", this.value);
  generatePassword();
});

// Add an event listener to the "add special character" checkbox to generate a new password when the checkbox is changed
document.querySelector("#addSpecial").addEventListener("change", function () {
  generatePassword();
});
