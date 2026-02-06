import { NextRequest, NextResponse } from "next/server";
import { queryOne } from "@/lib/db";
import { uploadPhoto } from "@/lib/storage";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const token = formData.get("token") as string;
    const index = formData.get("index") as string;

    if (!file || !token) {
      return NextResponse.json({ error: "Missing file or token" }, { status: 400 });
    }

    // Verify token
    const experience = await queryOne<{ id: string }>(
      "SELECT id FROM experiences WHERE token = $1 AND status = 'awaiting_creation'",
      [token]
    );

    if (!experience) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 403 });
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate unique filename
    const ext = file.name.split(".").pop() || "jpg";
    const fileName = `${experience.id}/${index || Date.now()}.${ext}`;

    // Upload to Azure Blob Storage
    const url = await uploadPhoto(buffer, fileName, file.type);

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
