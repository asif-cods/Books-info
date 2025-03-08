// Global variables for tracking book updates
let updatingBook = false;
let editingIsbn = null;

// Book constructor 
class Book{
    constructor(name, author, isbn){
        this.name = name;
        this.author = author;
        this.isbn = isbn;
    }
}

// UI Constructor 
class UI{
    ClearButtonVisibility(){
        const list = document.querySelector("#book-list");
        const clearBtn = document.querySelector(".clear");
    
        if (list.children.length === 0) {
            clearBtn.style.display = "none";
        } else {
            clearBtn.style.display = "block";
        }
    }

    addBookList(book){
        console.log(book);
        const list = document.querySelector("#book-list");
        const row = document.createElement("tr");
        console.log(row);
        
        row.innerHTML = `
            <td>${book.name}</td>
            <td>${book.author}</td>
            <td>${book.isbn}</td>
            <td class="d-flex gap-2">
                <span class="btn btn-warning edit">E</span>
                <span class="btn btn-danger delete">D</span>
            </td>
        `;
        list.appendChild(row);
        }

    clearField(){
        document.querySelector("#name").value = "";
        document.querySelector("#author").value = "";
        document.querySelector("#isbn").value = "";

    }

    populateForm(book){
        document.querySelector("#name").value = book.name;
        document.querySelector("#author").value = book.author;
        document.querySelector("#isbn").value = book.isbn;
    }

    clearAll(){
        document.querySelector("#book-list").innerHTML = '';

    }

    showAlert(message, className){
        const displayAlert = document.querySelector(".show-alert");
        displayAlert.innerHTML = `
                <div class="show-alert mb-5">
                <div class="alert ${className}" role="alert">
                    ${message}
                </div>
                </div>
                `;
        setTimeout(()=> {
            displayAlert.innerHTML = "";
        }, 4000);
    }
}

// Storage constructor
class Storage{
    getBooks(){
        let books;
        if(localStorage.getItem("BooksInfo")=== null){
            books = [];
        }
        else{
            books = JSON.parse(localStorage.getItem("BooksInfo"));
        }
        return books
    }

    addBooks(book){
        const books = this.getBooks();
        books.push(book)
        localStorage.setItem("BooksInfo",JSON.stringify(books));
        console.log(books);
    }

    displayBooks(){
        const books = this.getBooks();
        const ui = new UI();
        books.forEach(function(book){
            ui.addBookList(book);
        });
    }

    deleteBooks(isbn){
        console.log(isbn);
        const book = this.getBooks();
        book.forEach(function(books, index)
        {
            console.log(books.isbn, index);
            if(books.isbn === isbn){
                book.splice(index, 1);
            }
        } 
    );
        localStorage.setItem("BooksInfo", JSON.stringify(book));
    }

    clearBooks(){
        localStorage.removeItem("BooksInfo");
    }

    updatedBook(updatedBook, oldIsbn) {
        let books = storage.getBooks();
        const ui = new UI();
        
        // Ensure uniqueness
        const duplicateExists = books.some(book =>
            (book.isbn === updatedBook.isbn && book.isbn !== oldIsbn) ||
            (book.name === updatedBook.name && book.isbn !== oldIsbn)
        );

        if (duplicateExists) {
            document.querySelector("#btn-submit").innerText = "Add Book";
            console.log("aaaaa");
            ui.showAlert("Book Name or ISBN already exists!", "alert-danger");
            return false;
        }

        books = books.map(book => book.isbn === oldIsbn ? updatedBook : book);
        localStorage.setItem("BooksInfo", JSON.stringify(books));
        return true;
    }
   
}

const storage = new Storage();

//Event list for DOM loaded
document.addEventListener("DOMContentLoaded", function(){
    // const ui = new UI();
    storage.displayBooks();
})

// Event Listener for submit
document.querySelector("#book-form").addEventListener("submit", function(e){
    e.preventDefault();
    const name = document.querySelector("#name").value;
    const author = document.querySelector("#author").value;
    const isbn = document.querySelector("#isbn").value;
    const book = new Book(name, author, isbn);
    const ui = new UI(book);  // istance set


    if(name === "" || author === "" || isbn === ""){
        ui.showAlert("Please fill all field", "alert-warning");
    }
    else{
        let bookExist = false;
        const booksLists = document.querySelectorAll("#book-list tr");
        for(const eachBooks of booksLists){
            const existingBookName = eachBooks.querySelector("td:nth-child(1)").innerText;
            const existingBookIsbn = eachBooks.querySelector("td:nth-child(3)").innerText;
            if(existingBookName === name || existingBookIsbn === isbn){
                bookExist = true;
                break;
            }
        }

        if(bookExist){
            ui.showAlert("Book Name or ISBN is Existed !", "alert-warning");
        }
        else{

            ui.addBookList(book); 
            ui.showAlert("Successfully Added Book", "alert-success");
            storage.addBooks(book); // DD BOOKS INFO IN LOCAL STORAGE
            ui.clearField();
            ui.ClearButtonVisibility();
        }

    }

})


// Event listener to check Clear all button visibility  
document.addEventListener("DOMContentLoaded", function(){
    const ui = new UI();
    ui.ClearButtonVisibility();
})

// Event listener for Clear all 
document.querySelector(".clear").addEventListener("click", function(e){
    const ui = new UI();
    // const listLength = document.querySelector("#book-list");
    // if(listLength.innerHTML === ""){
    //     ui.showAlert("Please fill all field", "alert-warning");
    // }
    // else{
    //     ui.clearAll();
    //     ui.showAlert("Cleared Books List", "alert-info");
    // }
    ui.clearAll();
    ui.showAlert("Cleared Books List", "alert-info");
    document.querySelector("#btn-submit").innerText = "Add Book";
    storage.clearBooks();
    ui.ClearButtonVisibility();

})

// Event listener for Delete selected list (here used Event delegation)
document.querySelector("#book-list").addEventListener("click", function(e){
    console.log(e.target);
    const ui = new UI();
    if(e.target.classList.contains("delete")){
        e.target.parentElement.parentElement.remove();
        const isbn = e.target.parentElement.previousElementSibling.innerText;
        storage.deleteBooks(isbn);
        console.log(isbn);
        ui.showAlert("Book Info Removed", "alert-danger");
        ui.ClearButtonVisibility();

    }
})

// Event listener for Edit 
document.querySelector("#book-list").addEventListener("click", function(e){
    // console.log(e.target);
    const ui = new UI();
    if(e.target.classList.contains("edit")){
        const row = e.target.parentElement.parentElement;
        const name = row.children[0].innerText;
        const author = row.children[1].innerText;
        const isbn = row.children[2].innerText;
        ui.populateForm({ name, author, isbn });
        updatingBook = true;
        editingIsbn = isbn;
        document.querySelector("#btn-submit").innerText = "Update";
        }

    }
)

// Form Submit Event Listener (Handles Adding & Updating Books)
document.querySelector("#book-form").addEventListener("submit", function (e) {
    e.preventDefault();
    const ui = new UI();
    const name = document.querySelector("#name").value.trim();
    const author = document.querySelector("#author").value.trim();
    const isbn = document.querySelector("#isbn").value.trim();
    // passing a single book to (updatedBook) 
    const book = new Book(name, author, isbn);
    // const book = storage.getBooks();

    // if (!name || !author || !isbn) {
    //     UI.showAlert("Please fill all fields", "alert-warning");
    //     return;
    // }

    if (updatingBook) {
        // Handle Book Update
        const updateSuccess = storage.updatedBook(book, editingIsbn);
        if (updateSuccess) {
            ui.showAlert("Book Updated Successfully", "alert-success");
            document.querySelector("#btn-submit").innerText = "Add Book";
            updatingBook = false;
            editingIsbn = null;
        }
    } 

    // Refresh the UI
    document.querySelector("#book-list").innerHTML = "";
    storage.displayBooks();
    ui.clearField();
    ui.ClearButtonVisibility();
});

// // Event Listener for Delete & Edit
// document.querySelector("#book-list").addEventListener("click", function (e) {
//     if (e.target.classList.contains("delete")) {
//         const isbn = e.target.parentElement.previousElementSibling.innerText;
//         e.target.parentElement.parentElement.remove();
//         Storage.deleteBooks(isbn);
//         UI.showAlert("Book Removed", "alert-danger");
//         UI.ClearButtonVisibility();
//     } else if (e.target.classList.contains("edit")) {
//         const row = e.target.parentElement.parentElement;
//         const name = row.children[0].innerText;
//         const author = row.children[1].innerText;
//         const isbn = row.children[2].innerText;

//         UI.populateForm({ name, author, isbn });
//         updatingBook = true;
//         editingIsbn = isbn;
//         document.querySelector("#submit-btn").innerText = "Update";
//     }
