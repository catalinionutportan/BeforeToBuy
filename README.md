# BeforeToBuy.com

## Project Description

BeforeToBuy.com is a powerful, GPS-driven, multi-country price comparison engine designed to help users find the best deals locally and online. It allows users to compare product prices from various merchants, check local stock availability, apply detailed filters, and view price history. The platform supports multiple countries (Switzerland, Germany, France, Romania, UK, and USA) with independent UI language selection.

## Technologies Used

*   **Framework**: Next.js (v15+)
*   **UI Library**: React (v19+)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS
*   **Database/Cache**: Vercel KV (for price history)
*   **Icons**: Lucide React
*   **Testing**: `tsx` (for unit tests), Playwright (for E2E tests)

## Setup and Installation

To get the project up and running locally, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/beforetobuy.com.git
    cd beforetobuy.com
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    # or yarn install
    # or pnpm install
    ```
3.  **Environment Variables:**
    Create a `.env.local` file in the root directory and add the following environment variables:
    ```
    # Datadog RUM (Real User Monitoring)
    NEXT_PUBLIC_DATADOG_APPLICATION_ID="your_datadog_application_id"
    NEXT_PUBLIC_DATADOG_CLIENT_TOKEN="your_datadog_client_token"
    NEXT_PUBLIC_DATADOG_SERVICE="beforetobuy-frontend"
    NEXT_PUBLIC_DATADOG_ENV="development" # or 'production', 'staging'
    # DATADOG_SITE (e.g., datadoghq.eu if in Europe. Default is datadoghq.com, set in instrumentation.ts)
    ```
    Consult with the project owner for specific variables like Vercel KV connection strings and Datadog credentials.

## Available Scripts

In the project directory, you can run the following commands:

*   ### `npm run dev`
    Runs the application in development mode.
    Open [http://localhost:3000](http://localhost:3000) to view it in the browser.
    The page will reload if you make edits.
    You will also see any lint errors in the console.

*   ### `npm run build`
    Builds the application for production to the `.next` folder.
    It correctly bundles React in production mode and optimizes the build for the best performance.

*   ### `npm run start`
    Starts the production server after the application has been built.
    Run `npm run build` first to create the production build.

*   ### `npm run lint`
    Runs ESLint to check for code style and potential errors.

*   ### `npm run typecheck`
    Runs TypeScript compiler to check for type errors without emitting any files.

*   ### `npm run test:unit`
    Runs unit tests using `tsx`.

*   ### `npm run test:e2e`
    Runs end-to-end tests using Playwright.

*   ### `npm run smoke:prod`
    Executes a production smoke test script.

## Project Structure (Key Directories)

*   `src/app/`: Next.js App Router root, containing page routes and API routes (`/api`).
*   `src/components/`: Reusable React components (e.g., `Header`, `ProductCard`, `OfferFilters`).
*   `src/lib/`: Core application logic, utilities, data fetching, internationalization, and business rules.
*   `src/data/`: Static data files, such as `demo-gtin-map.json`.
*   `public/`: Static assets (images, fonts, etc.).

## Contribution

(Add guidelines for contributing, pull requests, and coding standards here.)

---

## Audit Notes & Enhancements

This project has recently undergone a comprehensive audit. Key enhancements and policies include:
*   **Swiss-First Policy**: Default display of domestic Swiss offers, with cross-border options available via a specific collection.
*   **Refined Taxonomy**: Migration to a canonical, comparison-first category tree, with backward compatibility for legacy URLs.
*   **Localized UI**: Full internationalization (i18n) for UI labels (DE/FR/IT/EN for CH), independent of the shopping country, with preference persistence.
*   **Robust Product Identity**: Prioritization of GTIN/EAN for product matching, with fallback to brand + title.
*   **Dynamic Offer Display**: Product cards display only available offers, with localized "Compare X prices" messaging.
*   **Updated Merchant List**: Accurate listing of Swiss electronics retailers, including new integrations like Nettoshop and Conrad.
