# 🔬 Microplastic Detector

Welcome to the Microplastic Detector! This is a tool that uses machine learning to automatically detect and analyze microplastics in images. This project was created as part of a research project during my senior year of high school.

## 📖 Research & Citation

This tool was developed as part of a research project focused on creating accessible methods for microplastic analysis. For more details on the methodology and findings, please see the full paper.

If you use this tool in your research, please cite the original paper:

**DOI:** [10.5281/zenodo.15192160](https://doi.org/10.5281/zenodo.15192160)

## ✨ Features

*   **Webcam & File Upload:** Analyze images directly from your webcam or by uploading a file.
*   **AI-Powered Detection:** Uses a custom-trained Roboflow model to identify potential microplastic particles.
*   **Detailed Analysis:** Leverages the Google Gemini API to analyze each detected particle for characteristics like shape, color, and transparency.
*   **Interactive Results:** Explore the results with an interactive particle table that highlights corresponding detections on the image.
*   **Data Export:** Export your analysis data to CSV for further research or record-keeping.
*   **Print/PDF:** Save a clean, printable report of your findings.

## 🛠️ Tech Stack

This project is built with a modern, full-stack TypeScript setup:

*   **Framework:** [Next.js](https://nextjs.org/) (App Router)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **UI Components:** [shadcn/ui](https://ui.shadcn.com/)
*   **Machine Learning:**
    *   Object Detection: [Roboflow](https://roboflow.com/)
    *   Particle Analysis: [Google Gemini](https://ai.google.dev/)

## 🚀 Getting Started

Want to run this on your own machine? Here’s how:

### 1. Clone the repo

```bash
git clone https://github.com/your-username/microplastic-detector.git
cd microplastic-detector
```

### 2. Install dependencies

This project uses `npm` for package management.

```bash
npm install
```

### 3. Set up environment variables

You'll need API keys for Roboflow and Google Gemini.

1.  Create a file named `.env.local` in the root of the project.
2.  Add your keys to it like this:

    ```
    ROBOFLOW_API_KEY="your_roboflow_api_key"
    GEMINI_API_KEY="your_gemini_api_key"
    ```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser and you should be good to go!

## 💡 Future Ideas

This project reached its goal as a proof of concept for our research project, but I'm planning to take it further! 

*   More advanced image editing tools (cropping, resizing,)
*   Storing analysis history in a database.
