import { BOOKS_PER_PAGE, authors, genres, books } from './data.js'

//range counter
const range = books.length
if (!books || !Array.isArray(books)) {
    throw new Error('Source required')
}
if (!range || range.length < 2) {
    throw new Error('Range must be an array with two numbers')
}let page = 1;

// Day night mode

const ThemeHandler = {
  settings: document.querySelector('[data-header-settings]'),
  settingsForm: document.querySelector('[data-settings-form]'),
  settingsTheme: document.querySelector("[data-settings-theme]"),
  settingsOverlay: document.querySelector("[data-settings-overlay]"),
  settingsCancel: document.querySelector('[data-settings-cancel]'),

  modes: {
      day: ["255, 255, 255", "10, 10, 20"],
      night: ["10, 10, 20", "255, 255, 255"],
  },
  userPreferences: {
      theme: "day",
  },

  setTheme: function (theme) {
      document.documentElement.style.setProperty("--color-light", this.modes[theme][0]);
      document.documentElement.style.setProperty("--color-dark", this.modes[theme][1]);
  },

  setDefaultTheme: function () {
      if (window.matchMedia("(prefers-color-scheme: light)").matches) {
          this.userPreferences.theme = "day";
      } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
          this.userPreferences.theme = "night";
      }
      this.setTheme(this.userPreferences.theme);
      this.settingsTheme.value = this.userPreferences.theme;
  },

  handleFormSubmit: function (event) {
      event.preventDefault();

      const formSubmit = new FormData(event.target);
      const submit = Object.fromEntries(formSubmit);

      this.setTheme(submit.theme);
      this.settingsOverlay.close();
  },

  openSettingsOverlay: function () {
      this.settingsTheme.focus();
      this.settingsOverlay.showModal();
  },

  closeSettingsOverlay: function () {
      this.settingsOverlay.close();
      this.settingsForm.reset();
  },

  init: function () {
      if (window.matchMedia) {
          if (window.matchMedia("(prefers-color-scheme: light)").matches) {
              this.settingsTheme.value = "day";
          } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
              this.settingsTheme.value = "night";
          }
      } else {
          this.settingsTheme.value = "day";
      }

      this.setDefaultTheme();

      this.settingsForm.addEventListener("submit", (event) => this.handleFormSubmit(event));
      this.settings.addEventListener('click', () => this.openSettingsOverlay());
      this.settingsCancel.addEventListener('click', () => this.closeSettingsOverlay());
  },
};

//The ThemeHandler Initializer
ThemeHandler.init();

  
const dataListItems = document.querySelector('[data-list-items]');
const dataSearchGenres = document.querySelector('[data-search-genres]');
const dataSearchAuthors = document.querySelector('[data-search-authors]');
const dataListActive = document.querySelector('[data-list-active]');
// New Function for book display range
function createBookPreview({ author: authorId, id, image, title }) {
    const preview = document.createElement("button");
    preview.classList.add("preview");
    preview.setAttribute("data-preview", id);

    // HTML display info
    preview.innerHTML = `
        <img class="preview__image" src="${image}" />
        <div class="preview__info">
            <h3 class="preview__title">${title}</h3>
            <div class="preview__author">${authors[authorId]}</div>
        </div>`;

    return preview;
}

// Creates book display range and appends to dataListItems
const fragmentBooks = document.createDocumentFragment();
const bookList = books.slice(0, 36);

bookList.forEach(book => {
    const bookPreview = createBookPreview(book);
    fragmentBooks.appendChild(bookPreview);
});

dataListItems.appendChild(fragmentBooks);

//New show more button code 
const ShowMoreHandler = {
  dataListButton: document.querySelector("[data-list-button]"),
  page: 1,
  BOOKS_PER_PAGE: 36,

  initializeShowMoreButton: function () {
      this.dataListButton.innerHTML = this.generateButtonHTML();
      this.dataListButton.addEventListener("click", () => this.handleShowMoreClick());
  },

  generateButtonHTML: function () {
      const remainingBooks = Math.max(books.length - this.page * this.BOOKS_PER_PAGE, 0);
      return /* HTML */ `
          <span>Load More</span>
          <span class="rest of books">(${remainingBooks})</span>
      `;
  },

  handleShowMoreClick: function () {
    const beginning = this.page * this.BOOKS_PER_PAGE;
    const end = beginning + this.BOOKS_PER_PAGE;
    const displayedBookIds = Array.from(dataListItems.children).map(book => book.dataset.preview);

    const additionalBooks = books.slice(beginning, end).filter(book => !displayedBookIds.includes(book.id));

    const addFragment = document.createDocumentFragment();
    for (const loadMore of additionalBooks) {
        const preview = this.loadPreview(loadMore);
        addFragment.appendChild(preview);
    }

    dataListItems.appendChild(addFragment);

    this.page += 1;

    const remainingBooks = Math.max(books.length - this.page * this.BOOKS_PER_PAGE, 0);
    this.dataListButton.innerHTML = this.generateButtonHTML();
    this.dataListButton.disabled = remainingBooks === 0;
},

  loadPreview: function (preview) {
      const { author: authorId, id, image, title } = preview;

      const showMore = document.createElement("button");
      showMore.classList = "preview";
      showMore.setAttribute("data-preview", id);

      showMore.innerHTML = /* html */ `
          <img class="preview__image" src="${image}"/>
          <div class="preview__info">
              <h3 class="preview__title">${title}</h3>
              <div class="preview__author">${authors[authorId]}</div>
          </div>
      `;

      return showMore;
  }
};

// Initialize the ShowMoreHandler
ShowMoreHandler.initializeShowMoreButton();

//Search button
const dataHeaderSearch = document.querySelector("[data-header-search]")
const dataSearchOverlay = document.querySelector("[data-search-overlay]")
const dataSearchCancel = document.querySelector("[data-search-cancel]")
const dataSearchTitle = document.querySelector("[data-search-title]")
const dataSearchForm = document.querySelector("[data-search-form]")
// opens search bars
dataHeaderSearch.addEventListener('click', function() {
dataSearchOverlay.showModal()
dataSearchTitle.focus()
})
dataSearchCancel.addEventListener('click', function(){
    dataSearchOverlay.close()
    dataSearchForm.reset()
})
dataSearchForm.addEventListener("submit", (event) => {
    //user selects seach criteria searchbar, click on "search" to retrive data
    event.preventDefault();
    const dataListMessage = document.querySelector("[data-list-message]")
  
    const formData = new FormData(event.target);
    const filters = Object.fromEntries(formData);
    const result = [];
    const booksSearch = books;
  
    for (let i = 0; i < booksSearch.length; i++) {
      const book = booksSearch[i]
  
      let titleSearch = filters.title.trim() !== "" && book.title.toLowerCase().includes(filters.title.toLowerCase());
      let authorSearch = filters.author !== "any" && book.author.includes(filters.author);
      let genreSearch = filters.genre !== "any" && book.genres.includes(filters.genre);
            
      if (titleSearch  || authorSearch ||genreSearch) {
        result.push(book);
      }
    }
  
    if (result.length > 0) {
      dataListMessage.classList.remove("list__message_show");
      dataListButton.disabled = true
      dataListItems.innerHTML = ""
  
      const searchFragment = document.createDocumentFragment();
      //returns search results
      for (let i = 0; i < result.length; i++) {
        const book = result[i];
        const bookPreview = loadPreview(book)
        searchFragment.appendChild(bookPreview)
      }
      dataListItems.appendChild(searchFragment)
    } else {
      dataListMessage.classList.add("list__message_show") 
      listButton.disabled = true
      listItems.innerHTML = ""
    }
    window.scrollTo({ top: 0, behavior: "smooth" })
    dataSearchOverlay.close()
    dataSearchForm.reset()
  });


//Genres 
const genresFragment = document.createDocumentFragment()
const genreSelectDefault = document.createElement('option')
genreSelectDefault.value = 'genre' 

// Set default display text as 'Genre'
genreSelectDefault.textContent = 'Genre'
genresFragment.appendChild(genreSelectDefault)

// Iterate through the genres and create options for each genre
Object.entries(genres).forEach(([id, name]) => {
    const genreSelect = document.createElement('option')
    genreSelect.value = id
    genreSelect.textContent = name
    genresFragment.appendChild(genreSelect)
});

// Append the genres to the HTML element
dataSearchGenres.appendChild(genresFragment)

//Authors 
const authorsFragment = document.createDocumentFragment()
const authorSelectDefault = document.createElement('option')
authorSelectDefault.value = 'author'

// Set default display text as 'Authors' 
authorSelectDefault.textContent = 'Authors' 
authorsFragment.appendChild(authorSelectDefault)

// Iterate through the authors and create options for each author
Object.entries(authors).forEach(([id, name]) => {
    const authorSelect = document.createElement('option')
    authorSelect.value = id;
    authorSelect.textContent = name;
    authorsFragment.appendChild(authorSelect)
});

// Append the authors to the HTML element
dataSearchAuthors.appendChild(authorsFragment)

const dataListImage = document.querySelector("[data-list-image]");
const dataListTitle = document.querySelector("[data-list-title]");
const dataListBlur = document.querySelector("[data-list-blur]");
const dataListSubtitle = document.querySelector("[data-list-subtitle]");
const dataListDescription = document.querySelector("[data-list-description]");
const dataListClose = document.querySelector("[data-list-close]");

//New function to check book id
function createBookPreviewFactory(books, dataListImage, dataListActive, dataListTitle, dataListBlur, dataListSubtitle, dataListDescription) {
    return {
      showBookSummary: function(bookId) {
        const active = books.find(book => book.id === bookId);
  
        if (!active) {
          return;
        }
  
        dataListImage.src = active.image;
        dataListActive.open = true;
        dataListTitle.textContent = active.title;
        dataListBlur.src = active.image;
        dataListSubtitle.textContent = `${authors[active.author]} (${new Date(active.published).getFullYear()})`;
        dataListDescription.textContent = active.description;
      }
    };
  }
  
  const bookPreviewFactory = createBookPreviewFactory(
    books, 
    dataListImage, 
    dataListActive, 
    dataListTitle, 
    dataListBlur, 
    dataListSubtitle, 
    dataListDescription
  );
  
  dataListItems.addEventListener("click", (event) => {
    const pathArray = Array.from(event.path || event.composedPath());
    let previewIdNum = null;
  
    for (let i = 0; i < pathArray.length; i++) {
      const node = pathArray[i];
      previewIdNum = node?.dataset?.preview;
  
      if (previewIdNum) {
        break;
      }
    }
  
    bookPreviewFactory.showBookSummary(previewIdNum);
  });
  
  dataListClose.addEventListener("click", function() {
    dataListActive.close();
  });
  
/*function showBookSummary(bookId) {
  const active = books.find(book => book.id === bookId);

  if (!active) {
    return;
  }

  dataListImage.src = active.image;
  dataListActive.open = true;
  dataListTitle.textContent = active.title;
  dataListBlur.src = active.image;
  dataListSubtitle.textContent = `${authors[active.author]} (${new Date(active.published).getFullYear()})`;
  dataListDescription.textContent = active.description;
}

dataListItems.addEventListener("click", (event) => {
  const pathArray = Array.from(event.path || event.composedPath());
  let previewIdNum = null;

  for (let i = 0; i < pathArray.length; i++) {
    const node = pathArray[i];
    previewIdNum = node?.dataset?.preview;

    if (previewIdNum) {
      break;
    }
  }

  showBookSummary(previewIdNum);
});

dataListClose.addEventListener("click", function() {
  dataListActive.close();
});*/
