document.addEventListener('DOMContentLoaded', () => {
    const languageSelect = document.getElementById('language-select');
    const seedInput = document.getElementById('seed-input');
    const randomSeedBtn = document.getElementById('random-seed-btn');
    const likesSlider = document.getElementById('likes-slider');
    const likesValueDisplay = document.getElementById('likes-value');
    const reviewsInput = document.getElementById('reviews-input');
    const booksTableBody = document.getElementById('books-table-body');
    const loadingIndicator = document.getElementById('loading-indicator');
    const exportCsvBtn = document.getElementById('export-csv-btn');

    let currentPage = 0;
    const booksPerPage = 20;
    const booksPerScroll = 10;
    let isLoading = false;
    let currentBooksData = []; // To store all loaded books for CSV export

    const API_BASE_URL = '/api'; // Relative for same-origin deployment

    function generateRandomSeed() {
        return Math.floor(Math.random() * 1000000000).toString();
    }

    async function fetchBooks(page, count, isNewQuery = false) {
        if (isLoading) return;
        isLoading = true;
        loadingIndicator.style.display = 'block';

        const lang = languageSelect.value;
        const seed = seedInput.value;
        const likes = likesSlider.value;
        const reviews = reviewsInput.value;

        if (!seed) {
            alert("Seed value cannot be empty.");
            isLoading = false;
            loadingIndicator.style.display = 'none';
            return;
        }
        
        const url = `${API_BASE_URL}/books?language=${lang}&seed=${seed}&likes=${likes}&reviews=${reviews}&page=${page}&count=${count}`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.details || `HTTP error! status: ${response.status}`);
            }
            const books = await response.json();
            if (isNewQuery) {
                booksTableBody.innerHTML = ''; // Clear existing books for new query
                currentBooksData = [];
            }
            appendBooksToTable(books);
            currentBooksData.push(...books); // Add to overall data
            currentPage = page;
        } catch (error) {
            console.error('Error fetching books:', error);
            alert(`Failed to fetch books: ${error.message}`);
            if (isNewQuery) booksTableBody.innerHTML = '<tr><td colspan="6">Error loading data.</td></tr>';
        } finally {
            isLoading = false;
            loadingIndicator.style.display = 'none';
        }
    }

    function appendBooksToTable(books) {
        books.forEach(book => {
            const row = booksTableBody.insertRow();
            row.insertCell().textContent = book.index;
            row.insertCell().textContent = book.isbn;
            row.insertCell().textContent = book.title;
            row.insertCell().textContent = book.authors.join(', ');
            row.insertCell().textContent = book.publisher;
            row.insertCell().textContent = `${book.likes} 👍`; // Display likes

            row.addEventListener('click', () => toggleBookDetails(row, book));
        });
    }

    function toggleBookDetails(row, book) {
        const existingDetailRow = row.nextElementSibling;
        if (existingDetailRow && existingDetailRow.classList.contains('details-row')) {
            existingDetailRow.remove();
            row.classList.remove('expanded-row');
        } else {
            const detailRow = booksTableBody.insertRow(row.rowIndex); // Insert after current row
            detailRow.classList.add('details-row');
            const detailCell = detailRow.insertCell();
            detailCell.colSpan = 6; // Span all columns

            const coverUrl = `${API_BASE_URL}/cover?title=${encodeURIComponent(book.title)}&author=${encodeURIComponent(book.authors[0])}&seed=${encodeURIComponent(book.coverSeed)}`;

            let reviewsHtml = '<h4>Reviews</h4>';
            if (book.reviews && book.reviews.length > 0) {
                book.reviews.forEach(review => {
                    reviewsHtml += `
                        <div class="review">
                            <p><strong>${review.author}:</strong></p>
                            <p>${review.text}</p>
                        </div>
                    `;
                });
            } else {
                reviewsHtml += '<p>No reviews yet.</p>';
            }

            detailCell.innerHTML = `
                <div class="book-details-content">
                    <div class="book-cover-container">
                        <img src="${coverUrl}" alt="Book Cover for ${book.title}">
                    </div>
                    <div class="book-info">
                        <h3>${book.title}</h3>
                        <p><strong>Author(s):</strong> ${book.authors.join(', ')}</p>
                        <p><strong>Publisher:</strong> ${book.publisher}</p>
                        <p><strong>ISBN:</strong> ${book.isbn}</p>
                        <p><strong>Likes:</strong> ${book.likes}</p>
                        <div class="reviews-section">
                            ${reviewsHtml}
                        </div>
                    </div>
                </div>
            `;
            row.classList.add('expanded-row');
        }
    }

    function handleControlsChange() {
        currentPage = 0; // Reset page for new query
        fetchBooks(currentPage, booksPerPage, true);
    }

    // Event Listeners
    languageSelect.addEventListener('change', handleControlsChange);
    seedInput.addEventListener('change', handleControlsChange);
    likesSlider.addEventListener('input', () => {
        likesValueDisplay.textContent = likesSlider.value;
    });
    likesSlider.addEventListener('change', handleControlsChange); // Fetch on release
    reviewsInput.addEventListener('change', handleControlsChange);

    randomSeedBtn.addEventListener('click', () => {
        seedInput.value = generateRandomSeed();
        handleControlsChange();
    });
    
    exportCsvBtn.addEventListener('click', exportToCsv);

    // Infinite Scrolling
    window.addEventListener('scroll', () => {
        if (isLoading) return;
        // Check if scrolled to near bottom
        if ((window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 200) {
            fetchBooks(currentPage + 1, booksPerScroll, false);
        }
    });

    // Initial Load
    if (!seedInput.value) seedInput.value = generateRandomSeed(); // Ensure seed is present on first load
    likesValueDisplay.textContent = likesSlider.value;
    fetchBooks(currentPage, booksPerPage, true);


    // CSV Export Functionality
    function exportToCsv() {
        if (currentBooksData.length === 0) {
            alert("No data to export.");
            return;
        }

        const headers = ["Index", "ISBN", "Title", "Authors", "Publisher", "Likes", "ReviewCount"];
        const rows = currentBooksData.map(book => [
            book.index,
            book.isbn,
            `"${book.title.replace(/"/g, '""')}"`, // Handle quotes in title
            `"${book.authors.join(', ').replace(/"/g, '""')}"`,
            `"${book.publisher.replace(/"/g, '""')}"`,
            book.likes,
            book.reviews ? book.reviews.length : 0
        ]);

        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += headers.join(",") + "\r\n";
        rows.forEach(rowArray => {
            let row = rowArray.join(",");
            csvContent += row + "\r\n";
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "books_export.csv");
        document.body.appendChild(link); // Required for FF
        link.click();
        document.body.removeChild(link);
    }

});