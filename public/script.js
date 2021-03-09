const auth = firebase.auth();
const db = firebase.firestore();

const library = document.querySelector('.library');
const signInBtn = document.querySelector('.sign-in-btn');
const userStatus = document.querySelector('.user-status');
const userImage = userStatus.querySelector('.user-img');
const userName = document.querySelector('.user-name');
const addBookBtn = document.querySelector('.add-book');
const popUp = document.querySelector('.add-pop-up');
const closeAddBook = document.querySelector('.close-pop-up')
const addBookFormButton = document.querySelector('.add-this');
const titleInput = document.getElementById('title-input');
const authorInput = document.getElementById('author-input');
const pagesInput = document.getElementById('pages-input');
const readInput = document.getElementById('checkmark-pop-up');

class Book {
  constructor(name = name, author = author, pages = 0, read = false) {
    this.name = name
    this.author = author
    this.pages = pages
    this.read = read
  }

  info() {
    let status = '' 
     if (this.read === 'true') {
       status = 'already read';
     } else {
       status = 'not read yet';
     } 
    return infoString = `${name} by ${author}, ${pages} pages, ${status}`
  }

  addToLibrary(library = myLibrary) {
    library.push(this)
  }
}

function signIn() {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider)
    .then(() => handleUserDisplay())
    .then(() => loadBooksFromFirebase())
    .catch((err) => console.log(err));
}

function handleUserDisplay() {
  userName.textContent = firebase.auth().currentUser.displayName;
  userImage.style.backgroundImage = `url(${firebase.auth().currentUser.photoURL})`;
}

function loadBooksFromFirebase() {
  const user = auth.currentUser;
  db.collection("users").doc(user.uid).get().then(doc => {
    const loadedLibrary = JSON.parse(doc.data().library)
    myLibrary = loadedLibrary;
  }).then(() => populateLibrary(myLibrary, library));
}

function populateLibrary(myArray = [], populatedPlace = {}) {
  const heading = `<tr class="headings">
            <th class="head-title">Title</th>
            <th class="head-author">Author</th>
            <th class="head-pages">Pages</th>
            <th class="head-status">Finished</th>
            <th>  </th>
            </tr>`
  populatedPlace.innerHTML = heading + myArray.map((book, i) => {
    return `<tr class="book-book">    
             <td class="book-title"><span> ${book.name} </span> </td>
             <td class="book-author">${book.author}</td>
             <td class="book-pages">${book.pages}</td> 
             <td class="book-status"> <input type="checkbox" class="checkmark-read table-mark" id="book${i}" ${book.read === true ? 'checked' : ''} >
              <label for="book${i}" class="check-mark"></label> </td>
             <td> <button class="sp-book-delete" id="del-button${i}"> ✗ </button> </td>
          </tr>
              `; }).join('');
          makeRemovable();
          toggleStatus();
}

function makeRemovable() {
const deleteBookButton = Array.from(document.querySelectorAll('button.sp-book-delete'));
deleteBookButton.map(button => button.addEventListener('click', function(e) {
  id = (e.target.id).slice(10);
  myLibrary.splice(id, 1);
  populateLibrary(myLibrary, library);
  if (!!firebase.auth().currentUser) writeBooksToFirebase();
  // localStorage.setItem('myLibrary', JSON.stringify(myLibrary));
}));
};

function toggleStatus() {
  const checkBoxes = Array.from(document.querySelectorAll('input.table-mark'));
  checkBoxes.map(checkbox => checkbox.addEventListener('click', function(e) {
    let id = checkbox.id.slice(4);
        myLibrary[id].read = !myLibrary[id].read;
        populateLibrary(myLibrary, library);
        if (!!firebase.auth().currentUser) writeBooksToFirebase();
        // localStorage.setItem('myLibrary', JSON.stringify(myLibrary));
    }));
  };

  function addBook() {
    const bookTitle = titleInput.value || 'The Book Title';
    const bookAuthor = authorInput.value || 'Anonymous';
    const bookPages = pagesInput.value || '123';
    const bookRead = pagesInput.value;
    const bookToAdd = new Book(bookTitle, bookAuthor, bookPages, bookRead)
    bookToAdd.addToLibrary();
    titleInput.value = '';
    authorInput.value = '';
    pagesInput.value = '';
    readInput.checked = false;
    populateLibrary(myLibrary, library);
    if (!!firebase.auth().currentUser) writeBooksToFirebase();
    // localStorage.setItem('myLibrary', JSON.stringify(myLibrary));
    popUp.classList.remove('active');
  }
  
  
function writeBooksToFirebase(library = myLibrary) {
  const user = auth.currentUser;
  // console.log(user, user.uid);
  const booksData = JSON.stringify(library);
  db.collection("users").doc(user.uid).set({library: booksData})
    .then(() => {
    console.log("Books successfully written!");
})
.catch((error) => {
    console.error("Error writing books: ", error);
});
}

function getDemoLibrary() {
  const theHobbit = new Book('Hobbit', 'J.R.R. Tolkien', '295', true);
  const theWitcher = new Book('The Witcher', 'A. Sapkowski', '420', true);
  const theAncient = new Book('The Ancient', 'R. A. Salvatore', '552', false);
  const demoLibrary = [theHobbit, theAncient, theWitcher]
  return demoLibrary
}

signInBtn.addEventListener('click', () => {signIn()})
addBookFormButton.addEventListener('click', addBook);
addBookBtn.addEventListener('click', function(e) {
  popUp.classList.add('active');
});
closeAddBook.addEventListener('click', function(e) {
  popUp.classList.remove('active');
});

let myLibrary = getDemoLibrary();
populateLibrary(myLibrary, library);
