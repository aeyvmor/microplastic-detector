import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image');
    
    if (!imageFile) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Convert file to base64
    const buffer = await (imageFile as File).arrayBuffer();
    const base64Image = Buffer.from(buffer).toString('base64');
    
    // Call Roboflow API
    const response = await axios({
      method: "POST",
      // url: "https://detect.roboflow.com/microplastics-l9kqt/1",
    url: "https://detect.roboflow.com/microplastic_detection/1",
    params: {
        api_key: process.env.ROBOFLOW_API_KEY
      },
      data: base64Image,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    });
    
    // Return the raw Roboflow response
    return NextResponse.json(response.data);
    
  } catch (error) {
    console.error('Error detecting objects:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}