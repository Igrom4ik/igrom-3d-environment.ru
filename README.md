# MagMc Portfolio

This is a modern, customizable portfolio built with Next.js 16, Keystatic (CMS), and Once UI.

## Features

- **Next.js 16 (App Router)** with Turbopack for fast builds.
- **Keystatic CMS**: Manage content (projects, blog posts, gallery) locally or via GitHub.
- **Marmoset Viewer**: Support for 3D model previews (`.mview`).
- **Telegram Integration**: Publish blog posts directly to Telegram.
- **Supabase Integration**: Comments and Likes (with email verification).
- **Internationalization**: Support for multiple languages.

## Getting Started

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/your-repo.git
    cd your-repo
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) to view the site.
    Open [http://localhost:3000/keystatic](http://localhost:3000/keystatic) to access the CMS.

## Configuration

- **Content**: Managed via `src/content/` (JSON and Markdoc files).
- **Settings**: Global settings in `src/resources/`.
- **Environment Variables**: See `.env.example`.

## License

This project is licensed under the MIT License.
