# Book Data Generator

A web application to generate fake book information for testing purposes. Supports multiple languages, seeded random data generation, and dynamic updates.

## Features

- Language and Region Selection (English US, German DE, Japanese JP)
- Custom and Random Seed Values for reproducible data
- Adjustable Average Likes per Book (fractional)
- Adjustable Average Reviews per Book (fractional)
- Dynamic Table Updates on parameter change
- Infinite Scrolling (initial 20 records, then 10 per scroll)
- Expandable Rows for detailed book information (including a generated cover image and reviews)
- Server-Side Data Generation using Faker.js
- Export currently displayed data to CSV

## Project Structure

- `/public`: Contains frontend static assets (HTML, CSS, JS).
- `/server`: Contains the backend Node.js/Express application.
  - `/server/utils`: Helper functions for data generation.
  - `server.js`: Main server file.
  - `package.json`: Backend dependencies.
- `Procfile`: For deployment on platforms like Render.

## Setup and Running Locally

1.  **Clone the repository:**

2.  **Install backend dependencies:**

3.  **Run the application (starts the backend server):**

4.  Open your browser and navigate to `http://localhost:3000`. The port might vary if 3000 is in use (check server console output).

## Deployment to Render

1.  **Push your code to your GitHub repository (`https://github.com/Abdurahmanit/Book.git`).**

2.  **Connect your GitHub account to Render.**

3.  **Create a new "Web Service" on Render and connect it to your GitHub repository.**

4.  **Configuration:**
    -   **Environment:** `Node`
    -   **Root Directory:** `leave blank`
    -   **Build Command:** `npm install --prefix server` or `cd server && npm install`
    -   **Start Command:** `node server/server.js`
    -   **Health Check Path (Optional but recommended):** `/` (Render will check if your main page loads)

5.  **Deploy.** Render will build and deploy your application. The URL will be provided by Render.

## Using the Application

-   Select the desired language/region.
-   Enter a seed or generate a random one. The data will update.
-   Adjust the "Avg. Likes" and "Avg. Reviews" sliders/inputs. Data will update.
-   Scroll down the table to load more books.
-   Click on a book row to see detailed information, including a generated cover and reviews.
-   Click "Export Displayed to CSV" to download the books currently loaded in the table.

## Notes

-   The book cover images are generated dynamically on the server.
-   Japanese data generation via Faker.js might be less diverse than English or German unless more specific Japanese data sources/patterns are manually added to `dataGenerators.js`. The current implementation uses basic lorem ipsum and some common nouns for Japanese titles.
-   Ensure your `loading.gif` is placed in `public/assets/`.