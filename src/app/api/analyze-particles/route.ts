import { NextResponse } from 'next/server';
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from '@google/generative-ai';

// --- Configuration ---
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL_NAME = "gemini-1.5-flash-latest"; // Updated the SDK, use 1.5 flash 

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT,        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,       threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

// --- Helper Function for Logging ---
const log = (level: 'info' | 'warn' | 'error', message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  const logData = data ? (typeof data === 'object' ? JSON.stringify(data) : data) : '';
  console[level](`[${timestamp}] [analyze-particles] ${level.toUpperCase()}: ${message}`, logData);
};

// --- API Route Handler (POST) ---
export async function POST(request: Request) {
  log('info', "Analyze particles request received.");

  // --- Input Validation ---
  // (Keep the existing input validation logic here)
  if (!GEMINI_API_KEY) {
    log('error', "Gemini API key is not configured.");
    return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
  }
  let requestData;
  try { requestData = await request.json(); } catch (e) { /* ... error handling ... */ return NextResponse.json({ error: 'Invalid request format.' }, { status: 400 }); }
  const { imageBase64, boundingBoxes } = requestData;
  if (!imageBase64 || typeof imageBase64 !== 'string') { /* ... error handling ... */ return NextResponse.json({ error: 'Missing image data.' }, { status: 400 }); }
  if (!boundingBoxes || !Array.isArray(boundingBoxes) || boundingBoxes.length === 0) { /* ... error handling ... */ return NextResponse.json({ error: 'Missing bounding boxes.' }, { status: 400 }); }
  log('info', `Received ${boundingBoxes.length} bounding boxes.`);

  // --- Prepare Image Data ---
  // (Keep the existing image data preparation logic here)
  let base64ImageData;
  try { base64ImageData = imageBase64.replace(/^data:image\/\w+;base64,/, ''); } catch(e) { /* ... error handling ... */ return NextResponse.json({ error: 'Invalid image format.' }, { status: 400 }); }

  // --- Initialize Gemini ---
  // (Keep the existing Gemini initialization logic here)
  let model;
  try {
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      model = genAI.getGenerativeModel({ model: GEMINI_MODEL_NAME, safetySettings });
      log('info', `Gemini model (${GEMINI_MODEL_NAME}) initialized.`);
  } catch (error) { /* ... error handling ... */ return NextResponse.json({ error: 'Failed to initialize AI service.' }, { status: 500 }); }

  // --- Construct Prompt for Gemini ---
  // (Keep the existing prompt construction logic here)
    const particleIndices = boundingBoxes.map((_, index) => index).join(', ');
    const prompt = `
Analyze the provided image containing microplastic particles marked with red boxes and index numbers (${particleIndices}).
For EACH index number visible in the image, provide its characteristics.

Output your response ONLY as a single JSON array. Do not include any introductory text, code block markers (like \`\`\`json), explanations, or any other text outside the JSON array itself.
Each object in the JSON array should represent one particle and MUST have the following structure:
{
  "index": <particle_index_number>,
  "analysis": {
    "shape": "<Shape Category>",
    "color": "<Dominant Color>",
    "transparency": "<Transparency Level>"
  }
}

Use these specific categories:
- Shape Categories: Fiber, Fragment, Film, Bead, Foam, Pellet, Unknown
- Transparency Levels: Opaque, Translucent, Transparent, Unknown
- Color: Describe the dominant color (e.g., Blue, Red, White, Clear, Black, Green, Yellow, Multi-colored, Unknown)

If you cannot determine a characteristic for a specific index, use the string "Unknown".
If an index number from the list (${particleIndices}) is not clearly identifiable or visible in the image, omit that index entirely from the JSON array.
Ensure the final output is a valid JSON array.
`;

  // --- Prepare Request for Gemini ---
  const imagePart = { inlineData: { data: base64ImageData, mimeType: "image/png" }};
  const requestPayload = [prompt, imagePart];

  // --- Call Gemini API ---
  // (Keep the existing API call logic here)
  let geminiResult;
  let responseText = '';
   try {
       log('info', "Sending request to Gemini API...");
       geminiResult = await model.generateContent(requestPayload);
       if (!geminiResult.response) { throw new Error("Gemini response structure invalid."); }
       responseText = geminiResult.response.text();
       log('info', "Received response from Gemini API.");
   } catch (error: any) { /* ... error handling ... */ return NextResponse.json({ error: `AI service error: ${error.message || 'Unknown'}`, particles: [] }, { status: 500 }); }

  // --- Parse Gemini Response ---
  let parsedAnalysis: any[] = [];
  // Declare variables needed in catch block outside try
  let extractionAttempt = ''; 
  let parseInput = ''; 

  try {
    log('info', "Attempting to parse Gemini response as JSON");
    log('info', "Gemini Raw Response Text:", responseText);

    // --- AGGRESSIVE CLEANING: Extract content between first [ and last ] ---
    const startIndex = responseText.indexOf('[');
    const endIndex = responseText.lastIndexOf(']');
    
    if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
        extractionAttempt = responseText.substring(startIndex, endIndex + 1);
        log('info', "Extracted content between brackets:", extractionAttempt);
    } else {
        // If brackets aren't found, log the raw text and throw error
        log('warn', "Could not find starting '[' and ending ']' in the response text.");
        extractionAttempt = responseText; // Log what we had
        throw new Error("Valid JSON array structure not found in AI response.");
    }
    
    // Use the extracted content directly for parsing
    parseInput = extractionAttempt; 

    if (!parseInput) { // Should be caught by the bracket check above, but as safety
        log('warn', "Extracted JSON string is empty. Cannot parse.");
        throw new Error("AI response content was empty after extraction.");
    }

    // Attempt to parse the extracted string
    parsedAnalysis = JSON.parse(parseInput); 
    log('info', "Successfully parsed Gemini response as JSON.", { count: parsedAnalysis.length });

    // Final validation
    if (!Array.isArray(parsedAnalysis)) {
        log('warn', "Parsed Gemini response is not a JSON array.");
        // Even if parse succeeded, ensure it's the expected type
        throw new Error("AI response parsed but was not in the expected JSON array format."); 
    }

  } catch (parseError: any) {
    log('error', "Failed to parse Gemini response as JSON.", {
        error: parseError.message,
        stringUsedForParsing: parseInput, // Log the exact string given to JSON.parse
        extractionAttempt: extractionAttempt, // Log the result of bracket extraction
        rawResponse: responseText // Keep logging raw response
    });
    // Return 200 OK but indicate parsing error
    return NextResponse.json({
        error: "AI analysis completed, but response parsing failed.",
        particles: boundingBoxes.map((box, index) => ({
            ...box, index: index,
            analysis: { shape: "Parse Error", color: "Parse Error", transparency: "Parse Error", error: "Could not parse AI analysis response." }
        }))
    }, { status: 200 });
  }

  // --- Merge Analysis Results ---
  // (Keep the existing merging logic here)
    log('info', "Merging parsed analysis with original bounding box data.");
    const finalParticles = boundingBoxes.map((originalBox, index) => {
        const analysisResult = parsedAnalysis.find(item => item && typeof item.index === 'number' && item.index === index);
        return {
            ...originalBox, index: index,
            analysis: analysisResult ? analysisResult.analysis : { shape: "Not Analyzed", color: "Not Analyzed", transparency: "Not Analyzed", reason: "Index not found in AI response." }
        };
    });

  // --- Return Success Response ---
  log('info', "Successfully prepared final particle data.", { count: finalParticles.length });
  return NextResponse.json({ particles: finalParticles });

} // End POST handler

// --- Other HTTP Method Handlers ---
export async function GET(request: Request) {
  log('warn', `Received GET request to ${request.url} - Method Not Allowed.`);
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
}