import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type, Schema, Modality } from '@google/genai';

const PORT = Number(process.env.PORT) || 3000;

// Lazy client accessor for Gemini API
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set. Please add it to your environment or Settings.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// PCM to WAV helper on the server
function pcmToWavBuffer(pcmData: Buffer, sampleRate = 24000, numChannels = 1): Buffer {
  const bytesPerSample = 2; // 16-bit
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = pcmData.length;
  const header = Buffer.alloc(44);

  header.write('RIFF', 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // Linear PCM
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(16, 34); // Bits per sample
  header.write('data', 36);
  header.writeUInt32LE(dataSize, 40);

  return Buffer.concat([header, pcmData]);
}

async function startServer() {
  const app = express();

  // Allow larger image payloads (up to 30mb for macro coin photos)
  app.use(express.json({ limit: '30mb' }));

  // API Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'CoinRarity Pro Server',
      timestamp: Date.now(),
      hasKey: Boolean(process.env.GEMINI_API_KEY),
    });
  });

  // Coin Image Analysis Endpoint (Supports Obverse and optional Reverse)
  app.post('/api/analyze', async (req: Request, res: Response) => {
    try {
      const { image, reverseImage, mimeType = 'image/jpeg' } = req.body;
      if (!image) {
        return res.status(400).json({ error: 'Missing image payload' });
      }

      // Clean base64 string if data URL prefix was passed
      const cleanBase64 = image.includes(',') ? image.split(',')[1] : image;
      const cleanReverseBase64 = reverseImage && reverseImage.includes(',') ? reverseImage.split(',')[1] : reverseImage;

      const ai = getGeminiClient();

      const schema: Schema = {
        type: Type.OBJECT,
        properties: {
          coins: {
            type: Type.ARRAY,
            description: 'List of all coins identified in the specimen photograph (up to 25 coins detected in a single image or tray).',
            items: {
              type: Type.OBJECT,
              properties: {
                coinIndex: { type: Type.INTEGER, description: '1-based sequential index (1 to 25) of the coin in the photo, ordered left-to-right, top-to-bottom.' },
                boundingBox: {
                  type: Type.ARRAY,
                  items: { type: Type.INTEGER },
                  description: 'Spatial bounding box [ymin, xmin, ymax, xmax] of the coin in the photograph normalized to integers between 0 and 1000.'
                },
                positionLabel: { type: Type.STRING, description: 'Human-readable position label in the image (e.g. "Row 1, #1 - Upper Left", "Center Specimen", "Tray Slot #4").' },
                coinName: { type: Type.STRING, description: 'Official numismatic name (e.g. 1909-S V.D.B. Lincoln Cent, Morgan Silver Dollar, Walking Liberty Half Dollar).' },
                country: { type: Type.STRING, description: 'Issuing country (e.g. United States, United Kingdom, Ancient Rome).' },
                denomination: { type: Type.STRING, description: 'Denomination (e.g. 1 Cent, 5 Cents, 25 Cents, 1 Dollar, Sovereign).' },
                year: { type: Type.STRING, description: 'Year minted if visible or estimated.' },
                mintMark: { type: Type.STRING, description: 'Mint mark (e.g. S, D, CC, O, W, or None/P).' },
                strikeType: { type: Type.STRING, description: 'Business Strike, Proof, Specimen, or Special Mint Set.' },
                rarityScore: { type: Type.NUMBER, description: 'Score from 1.0 to 10.0 reflecting rarity and market desirability.' },
                rarityLevel: { type: Type.STRING, description: 'Common, Scarce, Rare, Very Rare, or Ultra-Rare.' },
                grade: { type: Type.STRING, description: 'Sheldon Scale grade estimate (e.g. MS-65 RD, AU-58, XF-45, VG-8, Details - Cleaned).' },
                sheldonScaleNumber: { type: Type.NUMBER, description: 'Numerical Sheldon grade between 1 and 70.' },
                strikeQuality: { type: Type.STRING, description: 'Evaluation of strike sharpness and relief details.' },
                lusterRating: { type: Type.STRING, description: 'Luster quality: Frosty, Cartwheel, Satiny, Prooflike, or Muted.' },
                eyeAppeal: { type: Type.NUMBER, description: 'Overall aesthetic eye appeal from 1 to 5.' },
                subGrades: {
                  type: Type.OBJECT,
                  description: 'Four-pillar subgrade breakdown from 1.0 to 10.0',
                  properties: {
                    strikeScore: { type: Type.NUMBER, description: 'Strike sharpness score (1-10)' },
                    lusterScore: { type: Type.NUMBER, description: 'Surface luster score (1-10)' },
                    surfacePreservationScore: { type: Type.NUMBER, description: 'Field freedom from contact marks (1-10)' },
                    eyeAppealScore: { type: Type.NUMBER, description: 'Overall visual magnetism (1-10)' },
                  },
                  required: ['strikeScore', 'lusterScore', 'surfacePreservationScore', 'eyeAppealScore'],
                },
                composition: { type: Type.STRING, description: 'Metal alloy (e.g. 90% Silver 10% Copper, 95% Copper 5% Tin/Zinc).' },
                preciousMetalContent: { type: Type.STRING, description: 'Estimated pure metal weight (e.g. 0.7734 oz ASW).' },
                estimatedMeltValue: { type: Type.STRING, description: 'Intrinsic bullion value estimate if containing precious metals (e.g. $24.80), or None.' },
                weight: { type: Type.STRING, description: 'Standard mint specification weight (e.g. 26.73g).' },
                diameter: { type: Type.STRING, description: 'Standard diameter (e.g. 38.1mm).' },
                pcgsNumber: { type: Type.STRING, description: 'Standard PCGS / Red Book catalog reference number if recognized.' },
                mintage: { type: Type.STRING, description: 'Historical mintage figure if known.' },
                designersInitials: { type: Type.STRING, description: 'Designer name and location of initials.' },
                varietiesAndErrors: {
                  type: Type.ARRAY,
                  description: 'Any notable varieties, double dies, repunched mintmarks, or planchet errors detected.',
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      type: { type: Type.STRING, description: 'Category name (e.g. Doubled Die Obverse, Repunched Mint Mark, Clipped Planchet, Off-Center, None).' },
                      detected: { type: Type.BOOLEAN, description: 'Whether this variety or error is observed on the specimen.' },
                      description: { type: Type.STRING, description: 'Specific observation details regarding the variety or error.' },
                      significance: { type: Type.STRING, description: 'Impact on market premium.' }
                    },
                    required: ['type', 'detected', 'description']
                  }
                },
                authenticityDiagnostics: {
                  type: Type.OBJECT,
                  description: 'Numismatic counterfeit inspection and surface anomaly detection',
                  properties: {
                    riskLevel: { type: Type.STRING, description: 'Low Risk, Moderate Concern, or High Risk / Potential Counterfeit' },
                    seamLinesObserved: { type: Type.BOOLEAN, description: 'Whether cast parting lines or seam filing are observed along the rim' },
                    porosityOrCastTexture: { type: Type.BOOLEAN, description: 'Whether microscopic pitting, pimples, or cast depressions exist' },
                    toolingMarksDetected: { type: Type.BOOLEAN, description: 'Whether mechanical smoothing or tooling scratches are detected' },
                    denticleIntegrity: { type: Type.STRING, description: 'Sharp, Slightly Muted, or Mushy / Cast-Like' },
                    detailsSummary: { type: Type.STRING, description: 'Authenticity diagnosis summary' },
                    recommendedPhysicalTests: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: 'Physical checks recommended for this specific specimen.'
                    }
                  },
                  required: ['riskLevel', 'seamLinesObserved', 'porosityOrCastTexture', 'denticleIntegrity', 'detailsSummary']
                },
                cacAssessment: {
                  type: Type.OBJECT,
                  description: 'Certified Acceptance Corporation (CAC) qualification probability',
                  properties: {
                    greenBeanLikelihood: { type: Type.NUMBER, description: 'Probability percentage (0-100) of receiving a CAC Green Sticker' },
                    goldBeanLikelihood: { type: Type.NUMBER, description: 'Probability percentage (0-100) of qualifying for a CAC Gold Sticker' },
                    gradeConsistency: { type: Type.STRING, description: 'High-End for Grade, Solid for Grade, or Low-End for Grade' },
                    cacNotes: { type: Type.STRING, description: 'Justification regarding luster, eye appeal, and mark placement for CAC criteria' }
                  },
                  required: ['greenBeanLikelihood', 'gradeConsistency', 'cacNotes']
                },
                dieMatching: {
                  type: Type.OBJECT,
                  description: 'Full Die Pair Recognition and Die State Analysis',
                  properties: {
                    diePairId: { type: Type.STRING, description: 'Specific die pair identifier (e.g. VAM-1A, FS-101, Die Pair 3, Normal Dies)' },
                    dieState: { type: Type.STRING, description: 'Early Die State (EDS), Mid Die State (MDS), Late Die State (LDS), or Terminal Die State (TDS)' },
                    varietyAttribution: { type: Type.STRING, description: 'Cherrypickers or VAM variety classification' },
                    dieMarkers: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: 'Specific die clash marks, die cracks, or die gouges unique to this die pair'
                    },
                    doublingClass: { type: Type.STRING, description: 'Class I Rotated Hub, Class II Distorted Hub, Class IV Offset, Class V Pivoted, or None Detected' },
                    rpmVector: { type: Type.STRING, description: 'Repunched mintmark displacement direction (e.g. S/S South 0.15mm) or None' },
                    dieAuthenticityConfidence: { type: Type.NUMBER, description: 'Confidence in matching authentic die characteristics (0-100%)' }
                  },
                  required: ['diePairId', 'dieState', 'varietyAttribution', 'dieMarkers', 'dieAuthenticityConfidence']
                },
                wearProgression: {
                  type: Type.OBJECT,
                  description: 'Automated Wear Progression & Artificial Cleaning Modeling',
                  properties: {
                    modeledWearVsExpected: { type: Type.STRING, description: 'Comparison of observed surface wear vs natural circulation fluid dynamics' },
                    cleaningProbability: { type: Type.NUMBER, description: 'Probability percentage (0-100%) of harsh cleaning, dipping, or whizzing' },
                    artificialWearDetected: { type: Type.BOOLEAN, description: 'Whether wear appears artificially induced with abrasives' },
                    wearClassification: { type: Type.STRING, description: 'Original Uncirculated, Natural Cabinet Friction, Circulated Wear, or Chemically Altered / Wiped' },
                    highPointWearBreakdown: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          feature: { type: Type.STRING, description: 'Design high relief feature (e.g. Hair curls above ear, Cheekbone, Eagle breast feathers, Wreath bow)' },
                          expectedReliefPct: { type: Type.NUMBER, description: 'Expected relief retention percentage (0-100)' },
                          observedReliefPct: { type: Type.NUMBER, description: 'Observed relief retention percentage (0-100)' },
                          status: { type: Type.STRING, description: 'Mint State Sharpness, Light High-Point Friction, Moderate Wear, or Artificial Rub / Harshly Cleaned' }
                        },
                        required: ['feature', 'expectedReliefPct', 'observedReliefPct', 'status']
                      }
                    },
                    wearSummary: { type: Type.STRING, description: 'Detailed wear progression evaluation' }
                  },
                  required: ['modeledWearVsExpected', 'cleaningProbability', 'artificialWearDetected', 'wearClassification', 'wearSummary']
                },
                spectralAlloy: {
                  type: Type.OBJECT,
                  description: 'Camera-Based Spectral Alloy & Metal Composition Inference',
                  properties: {
                    inferredAlloy: { type: Type.STRING, description: 'Inferred chemical alloy (e.g. 90.1% Silver / 9.9% Copper, 95% Cu / 5% Zn)' },
                    dominantWavelengthNm: { type: Type.NUMBER, description: 'Dominant spectral reflectance wavelength in nanometers (e.g. 585nm)' },
                    reflectivityIndex: { type: Type.NUMBER, description: 'Lustrous reflectivity index (0-100)' },
                    alloyConsistency: { type: Type.STRING, description: 'Exact Mint Standard, Suspect Base-Metal Alloy, Transitional Off-Metal Blank, or Debased Bullion' },
                    spectralSignatureNotes: { type: Type.STRING, description: 'Observations on color temperature, patina tone, and metal luster' },
                    colorSpectrumGroup: { type: Type.STRING, description: 'Silver-White Lustrous, Copper-Red Toned, Steel-Grey Matte, or Gold Aureate' }
                  },
                  required: ['inferredAlloy', 'dominantWavelengthNm', 'reflectivityIndex', 'alloyConsistency', 'spectralSignatureNotes']
                },
                graderConsensus: {
                  type: Type.OBJECT,
                  description: 'Multi-Model Grader Consensus simulating specialized grading nodes',
                  properties: {
                    nodes: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          graderRole: { type: Type.STRING, description: 'Role (e.g. Chief Technical Grader, Luster & Cartwheel Specialist, Strike Sharpness Auditor, Surface Integrity Auditor, Variety Specialist)' },
                          assignedGrade: { type: Type.STRING, description: 'Grade assigned by this specialist node' },
                          sheldonNum: { type: Type.NUMBER, description: 'Numerical grade (1-70)' },
                          notes: { type: Type.STRING, description: 'Specific observation by this grader' }
                        },
                        required: ['graderRole', 'assignedGrade', 'sheldonNum', 'notes']
                      }
                    },
                    consensusGrade: { type: Type.STRING, description: 'Consensus net grade' },
                    consensusSheldon: { type: Type.NUMBER, description: 'Consensus Sheldon number (1-70)' },
                    gradeSpread: { type: Type.STRING, description: 'Range of node opinions (e.g. MS-64 to MS-65)' },
                    consensusConfidence: { type: Type.NUMBER, description: 'Consensus confidence level (0-100%)' },
                    consensusSummary: { type: Type.STRING, description: 'Summary of the consensus deliberation' }
                  },
                  required: ['nodes', 'consensusGrade', 'consensusSheldon', 'gradeSpread', 'consensusConfidence', 'consensusSummary']
                },
                restorationAdvisor: {
                  type: Type.OBJECT,
                  description: 'AI Restoration and Surface Conservation Guidelines',
                  properties: {
                    acetoneSafe: { type: Type.BOOLEAN, description: 'Whether a pure scientific acetone dip is safe to remove organic residue' },
                    verdigrisPresent: { type: Type.BOOLEAN, description: 'Whether active verdigris / green bronze disease is present' },
                    pvcDamageDetected: { type: Type.BOOLEAN, description: 'Whether acidic PVC flip haze or oily green film is observed' },
                    conservationAction: { type: Type.STRING, description: 'Safe to Conserve (Curatorial Acetone), Do Not Touch / Pristine Original Surface, Requires Professional NCS Conservation, or Permanent Environmental Damage' },
                    safeHandlingSteps: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: 'Actionable steps for safe curatorial handling'
                    },
                    warnings: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: 'Strict prohibitions (e.g. NEVER wipe with jewelry cloth, never use baking soda or pencil eraser)'
                    }
                  },
                  required: ['acetoneSafe', 'verdigrisPresent', 'pvcDamageDetected', 'conservationAction', 'safeHandlingSteps', 'warnings']
                },
                marketTrajectory: {
                  type: Type.OBJECT,
                  description: 'Dynamic Market Price & Trajectory Projections',
                  properties: {
                    currentMarketIndex: { type: Type.STRING, description: 'Current market baseline valuation' },
                    sixMonthProjection: { type: Type.STRING, description: '6-Month price projection and percentage trend' },
                    oneYearProjection: { type: Type.STRING, description: '1-Year price projection and percentage trend' },
                    momentum: { type: Type.STRING, description: 'Bullish / High Collector Demand, Stable Blue-Chip Hold, Volatile Speculative, or Softening' },
                    rarityTrajectoryRank: { type: Type.STRING, description: 'Rank in surviving population census' },
                    keyDrivers: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: 'Market catalysts (e.g. Registry set competition, Silver spot price surge, Low surviving population in Gem condition)'
                    }
                  },
                  required: ['currentMarketIndex', 'sixMonthProjection', 'oneYearProjection', 'momentum', 'keyDrivers']
                },
                reasoning: { type: Type.STRING, description: 'Expert analysis explaining the grade, surface preservation, wear points, and value basis.' },
                estimatedValue: { type: Type.STRING, description: 'Estimated collector auction value range (e.g. $450 - $650).' },
                historicalContext: { type: Type.STRING, description: 'Fascinating numismatic backstory or historical context of this series.' },
                auctionRecordsInsight: { type: Type.STRING, description: 'Recent auction performance or record price comparison.' },
                authenticityConfidence: { type: Type.NUMBER, description: 'Authenticity confidence percentage (0 to 100).' }
              },
              required: ['coinName', 'rarityScore', 'rarityLevel', 'grade', 'composition', 'reasoning', 'estimatedValue']
            }
          },
          totalCoinsDetected: {
            type: Type.INTEGER,
            description: 'Total number of individual coins detected in the image (up to 25 coins).'
          },
          batchType: {
            type: Type.STRING,
            description: 'Classification: "Single Specimen" or "Multi-Coin Tray (Up to 25 Coins)".'
          },
          totalEstimatedPortfolioValue: {
            type: Type.STRING,
            description: 'Combined cumulative auction valuation across all detected coins (e.g. "$1,450 - $2,200").'
          },
          totalMeltValue: {
            type: Type.STRING,
            description: 'Combined bullion scrap melt value across all coins if precious metals exist (e.g. "$412.80") or "None".'
          },
          standoutRarityCoinIndex: {
            type: Type.INTEGER,
            description: '1-based index (1 to 25) of the single most valuable, rare, or historically notable coin in the group.'
          },
          collectionSummary: {
            type: Type.STRING,
            description: 'Executive numismatic summary of the coin tray/group, highlighting key dates, series composition, and overall quality.'
          },
          narrationScript: {
            type: Type.STRING,
            description: 'A crisp, articulate, and authoritative 60-90 word numismatist voiceover script highlighting the specimen identity, condition, standout varieties, and collector value.'
          },
          overallCondition: {
            type: Type.STRING,
            description: 'Concise summary of surface preservation and eye appeal.'
          },
          reverseGradingNotes: {
            type: Type.STRING,
            description: 'If reverse image was provided, specific grading and wear observations of the reverse side.'
          },
          lightingAssessment: {
            type: Type.STRING,
            description: 'Feedback on photo lighting, focus, and recommended angles for higher precision grading.'
          }
        },
        required: ['coins', 'narrationScript', 'overallCondition']
      };

      const parts: any[] = [
        {
          text: 'Specimen Image 1 (Obverse / Main Face):',
        },
        {
          inlineData: {
            mimeType,
            data: cleanBase64,
          },
        },
      ];

      if (cleanReverseBase64) {
        parts.push({
          text: 'Specimen Image 2 (Reverse / Back Face):',
        });
        parts.push({
          inlineData: {
            mimeType,
            data: cleanReverseBase64,
          },
        });
      }

      const prompt = `CRITICAL MULTI-COIN TRAY SCANNING PROTOCOL (DETECT UP TO 25 COINS IN ONE IMAGE):
Analyze the provided photograph.
If the photograph contains multiple coins (e.g. a coin dealer tray, velvet display box, 20-coin binder album sheet, roll spill, or tabletop arrangement containing up to 25 coins):
1. SYSTEMATIC DETECTION: Scan the entire photograph and detect EVERY SINGLE COIN (from 1 up to 25 coins).
2. INDEX & NUMBERING: Assign each coin a sequential coinIndex (1, 2, 3... up to 25) ordered in reading order from top-to-bottom, left-to-right.
3. PRECISE BOUNDING BOX: For every coin, provide its boundingBox: [ymin, xmin, ymax, xmax] as integers normalized from 0 to 1000 so the UI can extract a sharp high-resolution crop of each individual coin and place interactive reticles on the tray.
4. POSITION LABEL: Add a positionLabel (e.g. "Row 1, #1 - Upper Left", "Row 2, #3 - Center Right", "Bottom Row #5").
5. FORENSIC IDENTIFICATION: For each coin, identify exact series, year, mint mark, Sheldon grade (1-70), subgrades (strike, luster, surface, eye appeal), varieties/errors, authenticity diagnostics, CAC bean likelihood, die matching, wear model, alloy, and individual estimated auction value.
6. CUMULATIVE ROLLUP: Calculate totalCoinsDetected, totalEstimatedPortfolioValue (combined range), totalMeltValue, standoutRarityCoinIndex (the key date or highest-grade highlight), and collectionSummary.
7. If only 1 single coin is in the photograph, set totalCoinsDetected: 1, batchType: "Single Specimen", boundingBox: [50, 50, 950, 950].

${cleanReverseBase64 ? 'Both Obverse (Front) and Reverse (Back) faces have been provided. Cross-reference relief high points on both sides to determine conservative net grade according to the weaker side.' : 'Evaluate the visible face with high precision, noting wear on high points and field luster.'}
- AI Die-Pair Matching: Identify the specific working die pair, die state (EDS/MDS/LDS), clash marks, and Cherrypickers/VAM attribution.
- Automated Wear Progression Modeling: Model high-point friction vs natural circulation vs harsh cleaning or artificial friction.
- Camera-Based Spectral Alloy Inference: Analyze reflectance, color wavelength, and metal luster characteristics.
- Multi-Model Grader Consensus: Simulate 5-6 specialized grading nodes (Technical Grader, Luster Specialist, Strike Auditor, Surface Auditor, Market Specialist) and determine consensus.
- Restoration & Preservation Advisor: Evaluate curatorial safety, PVC damage, verdigris, and handling.
- Market Trajectory Projections: Provide 6-month and 1-year valuation projections based on auction records and collector registry demand.
- Conservative Sheldon 70 grade and subgrade breakdown.`;

      parts.push({ text: prompt });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: {
          parts,
        },
        config: {
          responseMimeType: 'application/json',
          responseSchema: schema,
          systemInstruction:
            'You are a senior master numismatic grader, metallurgical diagnostician, and cataloger for premier international auction houses (PCGS, NGC, CAC, and Cherrypickers standard). Apply exhaustive numismatic rigor, conservative grading discipline, exact die attribution knowledge, and deep preservation awareness.',
          temperature: 0.2,
        },
      });

      const text = response.text;
      if (!text) {
        return res.status(500).json({ error: 'AI returned an empty response. Please verify image clarity and try again.' });
      }

      const parsed = JSON.parse(text);
      parsed.timestamp = Date.now();
      parsed.auditId = `CP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      return res.json(parsed);
    } catch (err: any) {
      console.error('Analysis error on server:', err);
      return res.status(500).json({
        error: err.message || 'Failed to complete numismatic analysis',
      });
    }
  });

  // Interactive Numismatist Consultation Endpoint
  app.post('/api/consult', async (req: Request, res: Response) => {
    try {
      const { question, coinContext, history = [], image, reverseImage } = req.body;
      if (!question || typeof question !== 'string') {
        return res.status(400).json({ error: 'Missing question parameter' });
      }

      const ai = getGeminiClient();

      const contextDescription = coinContext
        ? `Specimen Under Inquiry:
- Name: ${coinContext.coinName || 'Unknown'}
- Grade Assigned: ${coinContext.grade || 'N/A'} (Sheldon #${coinContext.sheldonScaleNumber || 'N/A'})
- Year / Mint: ${coinContext.year || 'Unknown'} ${coinContext.mintMark || ''}
- Alloy / Melt: ${coinContext.composition || 'Unknown'} (${coinContext.estimatedMeltValue || 'N/A'})
- Estimated Value: ${coinContext.estimatedValue || 'N/A'}
- Stated Wear & Reasoning: ${coinContext.reasoning || 'N/A'}
- Die Pair: ${JSON.stringify(coinContext.dieMatching || {})}
- Wear Model: ${JSON.stringify(coinContext.wearProgression || {})}
- Varieties: ${JSON.stringify(coinContext.varietiesAndErrors || [])}`
        : 'General numismatic inquiry.';

      const conversationHistory = history
        .map((h: { role: string; content: string }) => `${h.role === 'user' ? 'Collector' : 'Numismatist'}: ${h.content}`)
        .join('\n');

      const parts: any[] = [];

      // If specimen image is provided, include it in the consultation context
      if (image) {
        const cleanBase64 = image.includes(',') ? image.split(',')[1] : image;
        parts.push({
          inlineData: {
            mimeType: 'image/jpeg',
            data: cleanBase64,
          },
        });
      }
      if (reverseImage) {
        const cleanReverseBase64 = reverseImage.includes(',') ? reverseImage.split(',')[1] : reverseImage;
        parts.push({
          inlineData: {
            mimeType: 'image/jpeg',
            data: cleanReverseBase64,
          },
        });
      }

      const prompt = `Collector Inquiry regarding this coin:
${contextDescription}

Previous Conversation:
${conversationHistory || 'None'}

Current Question:
"${question}"

Answer as a senior PCGS/NGC numismatic consultant and metallurgist. Be authoritative, precise, practical, and helpful. Mention specific high points to inspect, market nuances, slab submission guidelines (PCGS vs NGC vs CAC), and preservation rules (e.g., NEVER clean coins with abrasive dips or cloths). Keep responses engaging and structured with bullet points where appropriate.`;

      parts.push({ text: prompt });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: {
          parts,
        },
        config: {
          systemInstruction:
            'You are a senior professional numismatist, author of reference coin guides, and former chief grader. Your advice is honest, highly technical yet accessible, conservative regarding grading, and fiercely dedicated to specimen preservation and authentication.',
          temperature: 0.3,
        },
      });

      return res.json({
        answer: response.text || 'Unable to generate numismatic response at this time.',
        timestamp: Date.now(),
      });
    } catch (err: any) {
      console.error('Consultation error:', err);
      return res.status(500).json({
        error: err.message || 'Numismatic consultation service error',
      });
    }
  });

  // Audio Narration Synthesis Endpoint
  app.post('/api/narrate', async (req: Request, res: Response) => {
    try {
      const { text, voice = 'Fenrir' } = req.body;
      if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: 'Missing or invalid narration text' });
      }

      const ai = getGeminiClient();

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-tts-preview',
        contents: {
          parts: [{ text: text.trim() }],
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voice },
            },
          },
        },
      });

      const candidate = response.candidates?.[0]?.content?.parts?.[0];
      const base64Audio = candidate?.inlineData?.data;

      if (!base64Audio) {
        return res.status(500).json({ error: 'Audio synthesis failed to produce audio data' });
      }

      const rawPcm = Buffer.from(base64Audio, 'base64');
      const wavBuffer = pcmToWavBuffer(rawPcm, 24000, 1);

      res.setHeader('Content-Type', 'audio/wav');
      res.setHeader('Content-Length', wavBuffer.length);
      return res.send(wavBuffer);
    } catch (err: any) {
      console.error('Audio generation error:', err);
      return res.status(500).json({
        error: err.message || 'Failed to generate voice narration',
      });
    }
  });

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.use((req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`CoinRarity Pro server active on http://0.0.0.0:${PORT}`);
  });

  process.on('SIGTERM', () => {
    server.close();
  });
  process.on('SIGINT', () => {
    server.close();
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
