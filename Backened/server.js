import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import axios from "axios";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import PDFDocument from "pdfkit";
import { ConnectDB } from "./DB/ConnectDB.js";

// Route imports
import companyRoutes from "./check-your-ability/routes/companyRoutes.js";
import interviewRoutes from "./check-your-ability/routes/interviewRoutes.js";
import Authroute from "./Routes/Authroute.js";
import interviewSessionRoutes from "./check-your-ability/routes/interviewSessionRoutes.js";
import userRoutes from "./Routes/userRoutes.js";

const nervousCaptures = new Map();
import fs from "fs";



dotenv.config();
const app = express();

// --- 1. CORS Configuration ---
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5174"
  ],
  credentials: true
}));

// --- 2. Middleware ---
app.use(express.json());
app.use(cookieParser());
app.use("/api/interview-session", interviewSessionRoutes);



// --- 3. MongoDB Connection ---
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

// --- 4. Cloudflare R2 Configuration ---
const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

// --- 5. PDF Generation & Upload Route ---
// app.post("/api/upload", async (req, res) => {
//   try {
//     const {
//       filename,
//       content,
//       role,
//       companyType,
//       solvedProblems = [],
//       sessionId, // 🔴 REQUIRED
//     } = req.body;

//     if (!filename || !content) {
//       return res.status(400).json({ error: "Filename and content required." });
//     }

//     const sanitizedFilename = filename.endsWith(".pdf")
//       ? filename
//       : `${filename}.pdf`;
//     const uniqueFilename = `interviews/${Date.now()}-${sanitizedFilename}`;

//     // ✅ FETCH NERVOUS DATA FROM MEMORY (NOT PYTHON)
//     let nervousData = null;
//     if (sessionId && nervousCaptures.has(sessionId)) {
//       nervousData = nervousCaptures.get(sessionId);
//     }

//     const pdfBuffer = await new Promise((resolve, reject) => {
//       const doc = new PDFDocument({ margin: 50, size: "A4", bufferPages: true });
//       const chunks = [];

//       const pageWidth = doc.page.width;
//       const pageHeight = doc.page.height;
//       const margin = 50;
//       const contentWidth = pageWidth - 2 * margin;
//       const userIndent = 200;

//       /* ================= HEADER ================= */
//       doc.fillColor("#1E40AF").rect(0, 0, pageWidth, 80).fill();
//       doc.fillColor("#FFFFFF")
//         .fontSize(20)
//         .font("Helvetica-Bold")
//         .text("Mock Interview Report", margin, 25);

//       doc.fontSize(11)
//         .font("Helvetica")
//         .text(
//           `Role: ${role || "N/A"}  •  Company Type: ${companyType || "N/A"}  •  Date: ${new Date().toLocaleDateString()}`,
//           margin,
//           55
//         );

//       doc.moveDown(4);

//       /* ================= CONVERSATION LOG ================= */
//       doc.fillColor("#111827")
//         .font("Helvetica-Bold")
//         .fontSize(16)
//         .text("Conversation Log");

//       doc.moveDown(1);

//       const lines = content.split("\n");
//       let codingSectionRendered = false;
//       let nervousSectionRendered = false;

//       for (let i = 0; i < lines.length; i++) {
//         const trimmed = lines[i].trim();
//         if (!trimmed) {
//           doc.moveDown(0.5);
//           continue;
//         }

//         /* ===== INSERT NERVOUS SECTION BEFORE FINAL ANALYSIS ===== */
//         // Replace the nervous section in your PDF generation (inside pdfBuffer creation)

// /* ===== INSERT NERVOUS SECTION BEFORE FINAL ANALYSIS ===== */
// if (
//   trimmed === "=== FINAL ANALYSIS ===" &&
//   !nervousSectionRendered
// ) {
//   nervousSectionRendered = true;

//   if (nervousData?.imagePath) {
//     doc.addPage();

//     doc.font("Helvetica-Bold")
//       .fontSize(16)
//       .fillColor("#111827")
//       .text("Behavioral Observation (Nervousness Detection)");

//     doc.moveDown(1);

//     doc.font("Helvetica")
//       .fontSize(11)
//       .fillColor("#374151")
//       .text(
//         "During the interview, moments of elevated nervousness were detected based on facial micro-movements, eye blink patterns, head pose variations, and lip movements.",
//         { width: contentWidth }
//       );

//     doc.moveDown(0.8);

//     if (typeof nervousData.score === "number") {
//       doc.font("Helvetica-Bold")
//         .fillColor("#92400E")
//         .text(
//           `Peak Nervousness Score: ${nervousData.score.toFixed(2)} / 1.00`
//         );
//       doc.moveDown(0.6);
//     }

//     // Try to load the image from the Python-saved path
//     try {
//       const fs = require('fs');
      
//       // Verify file exists
//       if (fs.existsSync(nervousData.imagePath)) {
//         doc.image(nervousData.imagePath, {
//           fit: [400, 300],
//           align: "center",
//         });
//         console.log("✅ Nervousness image added to PDF");
//       } else {
//         console.warn("⚠️ Image file not found:", nervousData.imagePath);
//         doc.font("Helvetica-Oblique")
//           .fontSize(10)
//           .fillColor("#6B7280")
//           .text("Nervousness image unavailable (file not found).");
//       }
//     } catch (imgErr) {
//       console.error("❌ Error loading nervousness image:", imgErr.message);
//       doc.font("Helvetica-Oblique")
//         .fontSize(10)
//         .fillColor("#6B7280")
//         .text("Nervousness image unavailable (loading error).");
//     }

//     doc.moveDown(1);

//     doc.font("Helvetica-Oblique")
//       .fontSize(10)
//       .fillColor("#6B7280")
//       .text(
//         "Note: Nervousness during interviews is common and does not negatively reflect technical ability. This data is for self-improvement only.",
//         { width: contentWidth }
//       );
//   } else {
//     console.log("ℹ️ No nervousness data captured during this interview");
//   }
// }

//         /* ===== FINAL ANALYSIS HEADER ===== */
//         if (trimmed === "=== FINAL ANALYSIS ===") {
//           doc.fillColor("#059669")
//             .font("Helvetica-Bold")
//             .fontSize(18)
//             .text("Performance Analysis & Recommendations");
//           doc.moveDown(1);
//           continue;
//         }

//         /* ===== CHAT MESSAGES ===== */
//         if (trimmed.startsWith("AI:") || trimmed.startsWith("Assistant:")) {
//           doc.fillColor("#1E40AF")
//             .font("Helvetica-Bold")
//             .fontSize(10)
//             .text("AI Interviewer:", { continued: true });

//           doc.fillColor("#111827")
//             .font("Helvetica")
//             .text(
//               trimmed.replace(/^(AI:|Assistant:)\s*/i, ""),
//               { width: contentWidth }
//             );

//           doc.moveDown(0.5);
//           continue;
//         }

//         if (trimmed.startsWith("User:")) {
//           doc.x = margin + userIndent;
//           doc.fillColor("#059669")
//             .font("Helvetica-Bold")
//             .fontSize(10)
//             .text("You:", { continued: true });

//           doc.fillColor("#111827")
//             .font("Helvetica")
//             .text(trimmed.replace(/^User:\s*/i, ""), {
//               width: contentWidth - userIndent,
//             });

//           doc.x = margin;
//           doc.moveDown(0.5);
//           continue;
//         }

//         doc.fillColor("#374151")
//           .font("Helvetica")
//           .fontSize(11)
//           .text(trimmed, { width: contentWidth });

//         doc.moveDown(0.3);
//       }

//       doc.end();
//       doc.on("data", (chunk) => chunks.push(chunk));
//       doc.on("end", () => resolve(Buffer.concat(chunks)));
//       doc.on("error", reject);
//     });

//     await r2Client.send(
//       new PutObjectCommand({
//         Bucket: process.env.R2_BUCKET_NAME,
//         Key: uniqueFilename,
//         Body: pdfBuffer,
//         ContentType: "application/pdf",
//       })
//     );

//     // ✅ CLEANUP
//     if (sessionId) nervousCaptures.delete(sessionId);

//     const publicUrl = `https://${process.env.R2_PUBLIC_DOMAIN}/${uniqueFilename}`;
//     res.json({ success: true, publicUrl });
//   } catch (err) {
//     console.error("PDF Upload Error:", err);
//     res.status(500).json({ error: "Upload failed", details: err.message });
//   }
// });

app.post("/api/upload", async (req, res) => {
  try {
    const {
      filename,
      content,
      role,
      companyType,
      solvedProblems = [],
      sessionId, // REQUIRED
    } = req.body;

    if (!filename || !content) {
      return res.status(400).json({ error: "Filename and content required." });
    }

    const sanitizedFilename = filename.endsWith(".pdf")
      ? filename
      : `${filename}.pdf`;

    const uniqueFilename = `interviews/${Date.now()}-${sanitizedFilename}`;

    // ✅ FETCH NERVOUS DATA FROM MEMORY
    let nervousData = null;
    if (sessionId && nervousCaptures.has(sessionId)) {
      nervousData = nervousCaptures.get(sessionId);
    }

    const pdfBuffer = await new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: "A4", bufferPages: true });
      const chunks = [];

      const pageWidth = doc.page.width;
      const margin = 50;
      const contentWidth = pageWidth - 2 * margin;
      const userIndent = 200;

      /* ================= HEADER ================= */
      doc.fillColor("#1E40AF").rect(0, 0, pageWidth, 80).fill();
      doc.fillColor("#FFFFFF")
        .fontSize(20)
        .font("Helvetica-Bold")
        .text("Mock Interview Report", margin, 25);

      doc.fontSize(11)
        .font("Helvetica")
        .text(
          `Role: ${role || "N/A"}  •  Company Type: ${
            companyType || "N/A"
          }  •  Date: ${new Date().toLocaleDateString()}`,
          margin,
          55
        );

      doc.moveDown(4);

      /* ================= CONVERSATION LOG ================= */
      doc.fillColor("#111827")
        .font("Helvetica-Bold")
        .fontSize(16)
        .text("Conversation Log");

      doc.moveDown(1);

      const lines = content.split("\n");
      let nervousSectionRendered = false;

      for (let i = 0; i < lines.length; i++) {
        const trimmed = lines[i].trim();
        if (!trimmed) {
          doc.moveDown(0.5);
          continue;
        }

        /* ===== INSERT NERVOUS SECTION BEFORE FINAL ANALYSIS ===== */
        /* ===== INSERT NERVOUS SECTION BEFORE FINAL ANALYSIS ===== */
if (trimmed === "=== FINAL ANALYSIS ===" && !nervousSectionRendered) {
  nervousSectionRendered = true;

  if (nervousData?.imageBase64) {
    doc.addPage();

    doc.font("Helvetica-Bold")
      .fontSize(16)
      .fillColor("#111827")
      .text("Behavioral Observation (Nervousness Detection)");

    doc.moveDown(1);

    doc.font("Helvetica")
      .fontSize(11)
      .fillColor("#374151")
      .text(
        "During the interview, moments of elevated nervousness were detected based on facial micro-movements, eye blink patterns, head pose variations, and lip movements.",
        { width: contentWidth }
      );

    doc.moveDown(0.8);

    if (typeof nervousData.score === "number") {
      doc.font("Helvetica-Bold")
        .fillColor("#92400E")
        .text(
          `Peak Nervousness Score: ${nervousData.score.toFixed(2)} / 1.00`
        );
      doc.moveDown(0.6);
    }

    // ✅ FIX: Convert base64 to Buffer and embed directly
    try {
      // Remove data URL prefix if present
      const base64Data = nervousData.imageBase64.replace(/^data:image\/\w+;base64,/, '');
      
      // Convert base64 to Buffer
      const imageBuffer = Buffer.from(base64Data, 'base64');

      // Embed image directly in PDF
      doc.image(imageBuffer, {
        fit: [400, 300],
        align: "center",
      });

      console.log("✅ Nervousness image added to PDF from base64");
    } catch (imgErr) {
      console.error("❌ Error embedding nervousness image:", imgErr.message);
      doc.font("Helvetica-Oblique")
        .fontSize(10)
        .fillColor("#6B7280")
        .text("Nervousness image unavailable (embedding error).");
    }

    doc.moveDown(1);

    doc.font("Helvetica-Oblique")
      .fontSize(10)
      .fillColor("#6B7280")
      .text(
        "Note: Nervousness during interviews is common and does not negatively reflect technical ability. This data is for self-improvement only.",
        { width: contentWidth }
      );
  } else {
    console.log("ℹ️ No nervousness data captured during this interview");
  }
}

        /* ===== FINAL ANALYSIS HEADER ===== */
        if (trimmed === "=== FINAL ANALYSIS ===") {
          doc.fillColor("#059669")
            .font("Helvetica-Bold")
            .fontSize(18)
            .text("Performance Analysis & Recommendations");
          doc.moveDown(1);
          continue;
        }

        /* ===== CHAT MESSAGES ===== */
        if (trimmed.startsWith("AI:") || trimmed.startsWith("Assistant:")) {
          doc.fillColor("#1E40AF")
            .font("Helvetica-Bold")
            .fontSize(10)
            .text("AI Interviewer:", { continued: true });

          doc.fillColor("#111827")
            .font("Helvetica")
            .text(
              trimmed.replace(/^(AI:|Assistant:)\s*/i, ""),
              { width: contentWidth }
            );

          doc.moveDown(0.5);
          continue;
        }

        if (trimmed.startsWith("User:")) {
          doc.x = margin + userIndent;
          doc.fillColor("#059669")
            .font("Helvetica-Bold")
            .fontSize(10)
            .text("You:", { continued: true });

          doc.fillColor("#111827")
            .font("Helvetica")
            .text(trimmed.replace(/^User:\s*/i, ""), {
              width: contentWidth - userIndent,
            });

          doc.x = margin;
          doc.moveDown(0.5);
          continue;
        }

        doc.fillColor("#374151")
          .font("Helvetica")
          .fontSize(11)
          .text(trimmed, { width: contentWidth });

        doc.moveDown(0.3);
      }

      doc.end();
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);
    });

    await r2Client.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: uniqueFilename,
        Body: pdfBuffer,
        ContentType: "application/pdf",
      })
    );

    // ✅ CLEANUP SESSION MEMORY

    console.log("UPLOAD sessionId:", sessionId);
console.log("AVAILABLE sessions:", [...nervousCaptures.keys()]);

    if (sessionId) nervousCaptures.delete(sessionId);

    const publicUrl = `https://${process.env.R2_PUBLIC_DOMAIN}/${uniqueFilename}`;
    res.json({ success: true, publicUrl });
  } catch (err) {
    console.error("PDF Upload Error:", err);
    res.status(500).json({ error: "Upload failed", details: err.message });
  }
});





app.post("/api/nervous-frame", (req, res) => {
  const { sessionId, imageBase64, score } = req.body;

  if (!sessionId || !imageBase64) {
    return res.status(400).json({ error: "Missing sessionId or imageBase64" });
  }

  const existing = nervousCaptures.get(sessionId);

  // Only store if this is the highest score for this session
  if (!existing || score > existing.score) {
    nervousCaptures.set(sessionId, {
      imageBase64,  // Store base64 string
      score,
      timestamp: new Date().toISOString(),
    });

    console.log(`🟡 Stored nervous frame (base64) for session: ${sessionId}, score: ${score.toFixed(2)}`);
  }

  res.json({ success: true });
});






// --- 6. Code Execution Route (Piston API) ---
app.post("/run", async (req, res) => {
  const { language, code, input } = req.body;

  try {
    const response = await axios.post("https://emkc.org/api/v2/piston/execute", {
      language,
      version: "*",
      files: [{ content: code }],
      stdin: input || "",
    });

    res.json(response.data);
  } catch (err) {
    console.error("❌ Piston API Error:", err.message);
    res.status(500).json({ error: "Error executing code" });
  }
});

// --- 7. Routes for Companies, Interviews, and Auth ---
app.use("/api/auth", Authroute);
app.use("/api/companies", companyRoutes);
app.use("/api/interview", interviewRoutes);
app.use("/api/users", userRoutes);



// --- 8. Health checks ---
app.get("/", (req, res) => {
  res.send("🚀 Virtual Interview Backend Running Successfully!");
});
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// --- 9. Start Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  ConnectDB();
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log("✅ MongoDB Connected via ConnectDB()");
  if (process.env.R2_BUCKET_NAME) console.log(`📁 R2 Bucket: ${process.env.R2_BUCKET_NAME}`);
});