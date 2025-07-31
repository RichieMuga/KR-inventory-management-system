# Mobile Inventory App

This is a mobile-first inventory management application built with Next.js and shadcn/ui.

## Features

- **Asset Tracking**: Manage and track various ICT assets.
- **Bulk vs. Unique Assets**: Distinguish between bulk consumables and individually tracked items using the `is_bulk` field.
- **Responsive Design**: Optimized for both mobile and desktop views.
- **Search Functionality**: Easily search for assets by name or serial number.
- **Create Asset**: Add new assets to the inventory with dynamic form fields based on asset type.

## Getting Started

1.  **Clone the repository**:
    \`\`\`bash
    git clone <repository-url>
    cd mobile-inventory-app
    \`\`\`
2.  **Install dependencies**:
    \`\`\`bash
    npm install
    # or
    yarn install
    \`\`\`
3.  **Run the development server**:
    \`\`\`bash
    npm run dev
    # or
    yarn dev
    \`\`\`
    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

-   `app/`: Next.js App Router pages and layouts.
-   `components/`: Reusable React components, including shadcn/ui components.
-   `public/`: Static assets like images.
-   `hooks/`: Custom React hooks.
-   `lib/`: Utility functions.
-   `styles/`: Global CSS.

## Customization

-   **Theming**: Customize the application's theme by modifying `tailwind.config.ts` and `app/globals.css`.
-   **Data**: The application currently uses mock data. You can integrate with a backend API for real data.

## Learn More

To learn more about Next.js, take a look at the following resources:

-   [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
-   [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!
\`\`\`
