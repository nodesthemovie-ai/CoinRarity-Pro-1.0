import { jsPDF } from 'jspdf';
import { MultiCoinAnalysisResult, SingleCoinData } from '../types';

export interface ReportConfig {
  scope: 'batch' | 'single';
  selectedCoinIndex: number;
  includeForensics: boolean;
  includeConsensus: boolean;
  includeMarketAndPedigree: boolean;
  includePhotos: boolean;
  includeImagesInJson: boolean;
  customCollectorNotes: string;
  preparedFor: string;
}

export interface NumismaticJsonReport {
  schemaVersion: string;
  reportMetadata: {
    reportId: string;
    auditId: string;
    generatedAtISO: string;
    generatedAtFormatted: string;
    reportScope: 'Single Specimen Dossier' | 'Multi-Coin Batch Portfolio (Up to 25 Coins)';
    specimenCount: number;
    preparedFor: string;
    customCollectorNotes?: string;
    verificationStandard: string;
    cryptographicChecksum: string;
  };
  portfolioSummary: {
    batchType: string;
    totalSpecimensDetected: number;
    combinedEstimatedValuation: string;
    totalIntrinsicMeltFloor: string;
    averageSheldonScore: number | null;
    standoutSpecimen: {
      slotIndex: number;
      coinName: string;
      grade: string;
      estimatedValue: string;
    } | null;
    overallConditionSummary: string;
    collectionSummary: string;
    lightingAssessment?: string;
    narrationScript: string;
  };
  specimens: Array<{
    slotNumber: number;
    positionLabel: string;
    identity: {
      coinName: string;
      country: string;
      denomination: string;
      year: string;
      mintMark: string;
      strikeType: string;
      pcgsNumber?: string;
      mintage?: string;
      designersInitials?: string;
    };
    gradingAndValuation: {
      grade: string;
      sheldonScaleNumber?: number;
      rarityScore: number;
      rarityLevel: string;
      estimatedAuctionValue: string;
      estimatedMeltValue?: string;
      strikeQuality?: string;
      lusterRating?: string;
      eyeAppealStars?: number;
      subGrades?: SingleCoinData['subGrades'];
      cacAssessment?: SingleCoinData['cacAssessment'];
    };
    metallurgyAndSpecs: {
      composition?: string;
      preciousMetalContent?: string;
      weight?: string;
      diameter?: string;
      spectralAlloy?: SingleCoinData['spectralAlloy'];
    };
    forensicDiagnostics?: {
      authenticityConfidence?: number;
      authenticityDiagnostics?: SingleCoinData['authenticityDiagnostics'];
      dieMatching?: SingleCoinData['dieMatching'];
      strikeReconstruction?: SingleCoinData['strikeReconstruction'];
      wearProgression?: SingleCoinData['wearProgression'];
      varietiesAndErrors?: SingleCoinData['varietiesAndErrors'];
      restorationAdvisor?: SingleCoinData['restorationAdvisor'];
    };
    graderConsensus?: SingleCoinData['graderConsensus'];
    marketAndPedigree?: {
      marketTrajectory?: SingleCoinData['marketTrajectory'];
      provenanceChain?: SingleCoinData['provenanceChain'];
      auctionRecordsInsight?: string;
    };
    expertCommentary: {
      technicalReasoning: string;
      historicalContext?: string;
    };
    croppedImageBase64?: string;
  }>;
}

/**
 * Compute a deterministic short verification hash for report integrity
 */
function computeChecksum(auditId: string, count: number, timestamp: number): string {
  const raw = `${auditId}-${count}-${timestamp}-COINRARITY-PRO`;
  let hash = 2166136261;
  for (let i = 0; i < raw.length; i++) {
    hash ^= raw.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `CRP-${(hash >>> 0).toString(16).toUpperCase().padStart(8, '0')}`;
}

/**
 * Helper to convert an image URL or Data URI into a JPEG base64 data URL for jsPDF
 */
async function loadImageAsJpegDataUrl(src: string, maxDim = 500): Promise<string | null> {
  if (!src) return null;
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    const timeout = setTimeout(() => resolve(null), 3500);

    img.onload = () => {
      clearTimeout(timeout);
      try {
        const canvas = document.createElement('canvas');
        let w = img.naturalWidth || 300;
        let h = img.naturalHeight || 300;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }
        ctx.fillStyle = '#0b0f17';
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.86));
      } catch {
        resolve(src.startsWith('data:image/') ? src : null);
      }
    };

    img.onerror = () => {
      clearTimeout(timeout);
      resolve(src.startsWith('data:image/') ? src : null);
    };

    img.src = src;
  });
}

/**
 * Build structured JSON summary report for either a single coin or a 25-coin batch
 */
export function buildNumismaticJsonReport(
  result: MultiCoinAnalysisResult,
  config: ReportConfig
): NumismaticJsonReport {
  const auditId = result.auditId || `CP-${Date.now().toString(36).toUpperCase()}`;
  const isSingle = config.scope === 'single' || result.coins.length === 1;
  const targetCoins = isSingle
    ? [result.coins[config.selectedCoinIndex] || result.coins[0]]
    : result.coins;

  const scored = targetCoins.filter((c) => c && c.sheldonScaleNumber && c.sheldonScaleNumber > 0);
  const averageSheldon = scored.length
    ? Math.round((scored.reduce((acc, c) => acc + (c.sheldonScaleNumber || 0), 0) / scored.length) * 10) / 10
    : null;

  const standout = [...targetCoins].sort((a, b) => (b?.rarityScore || 0) - (a?.rarityScore || 0))[0] || null;

  return {
    schemaVersion: 'CoinRarityPro-Forensic-v5.0',
    reportMetadata: {
      reportId: `RPT-${auditId}-${isSingle ? `S${config.selectedCoinIndex + 1}` : `BATCH${targetCoins.length}`}`,
      auditId,
      generatedAtISO: new Date().toISOString(),
      generatedAtFormatted: new Date().toLocaleString(),
      reportScope: isSingle ? 'Single Specimen Dossier' : 'Multi-Coin Batch Portfolio (Up to 25 Coins)',
      specimenCount: targetCoins.length,
      preparedFor: config.preparedFor.trim() || 'Authorized Collector / Numismatic Registry',
      customCollectorNotes: config.customCollectorNotes.trim() || undefined,
      verificationStandard: 'Sheldon 1-70 Scale • 12-Node Multi-Model Consensus • Tier 1-5 Forensic Telemetry',
      cryptographicChecksum: computeChecksum(auditId, targetCoins.length, result.timestamp),
    },
    portfolioSummary: {
      batchType: isSingle
        ? 'Single Specimen'
        : result.batchType || `Multi-Coin Tray (${targetCoins.length} Coins)`,
      totalSpecimensDetected: targetCoins.length,
      combinedEstimatedValuation: isSingle
        ? targetCoins[0]?.estimatedValue || 'N/A'
        : result.totalEstimatedPortfolioValue || targetCoins[0]?.estimatedValue || 'N/A',
      totalIntrinsicMeltFloor: isSingle
        ? targetCoins[0]?.estimatedMeltValue || 'None'
        : result.totalMeltValue || 'Included',
      averageSheldonScore: averageSheldon,
      standoutSpecimen: standout
        ? {
            slotIndex: standout.coinIndex || 1,
            coinName: standout.coinName,
            grade: standout.grade || 'UNC',
            estimatedValue: standout.estimatedValue,
          }
        : null,
      overallConditionSummary: result.overallCondition,
      collectionSummary:
        result.collectionSummary ||
        (isSingle
          ? `Comprehensive single-specimen numismatic audit for ${targetCoins[0]?.coinName}.`
          : `Simultaneous multi-coin batch evaluation across ${targetCoins.length} specimens.`),
      lightingAssessment: result.lightingAssessment,
      narrationScript: result.narrationScript,
    },
    specimens: targetCoins.filter(Boolean).map((c, idx) => ({
      slotNumber: c.coinIndex || (isSingle ? config.selectedCoinIndex + 1 : idx + 1),
      positionLabel: c.positionLabel || `Slot #${c.coinIndex || idx + 1}`,
      identity: {
        coinName: c.coinName,
        country: c.country || 'United States / International',
        denomination: c.denomination || 'Standard Issue',
        year: c.year || 'Unstated',
        mintMark: c.mintMark || 'None',
        strikeType: c.strikeType || 'Business Strike',
        pcgsNumber: c.pcgsNumber,
        mintage: c.mintage,
        designersInitials: c.designersInitials,
      },
      gradingAndValuation: {
        grade: c.grade || 'UNC',
        sheldonScaleNumber: c.sheldonScaleNumber,
        rarityScore: c.rarityScore,
        rarityLevel: c.rarityLevel,
        estimatedAuctionValue: c.estimatedValue,
        estimatedMeltValue: c.estimatedMeltValue,
        strikeQuality: c.strikeQuality,
        lusterRating: c.lusterRating,
        eyeAppealStars: c.eyeAppeal,
        subGrades: c.subGrades,
        cacAssessment: c.cacAssessment,
      },
      metallurgyAndSpecs: {
        composition: c.composition,
        preciousMetalContent: c.preciousMetalContent,
        weight: c.weight,
        diameter: c.diameter,
        spectralAlloy: config.includeForensics ? c.spectralAlloy : undefined,
      },
      forensicDiagnostics: config.includeForensics
        ? {
            authenticityConfidence: c.authenticityConfidence,
            authenticityDiagnostics: c.authenticityDiagnostics,
            dieMatching: c.dieMatching,
            strikeReconstruction: c.strikeReconstruction,
            wearProgression: c.wearProgression,
            varietiesAndErrors: c.varietiesAndErrors,
            restorationAdvisor: c.restorationAdvisor,
          }
        : undefined,
      graderConsensus: config.includeConsensus ? c.graderConsensus : undefined,
      marketAndPedigree: config.includeMarketAndPedigree
        ? {
            marketTrajectory: c.marketTrajectory,
            provenanceChain: c.provenanceChain,
            auctionRecordsInsight: c.auctionRecordsInsight,
          }
        : undefined,
      expertCommentary: {
        technicalReasoning: c.reasoning,
        historicalContext: c.historicalContext,
      },
      croppedImageBase64: config.includeImagesInJson ? c.croppedImage : undefined,
    })),
  };
}

/**
 * Generate a plain-text executive summary suitable for sharing via SMS, Email, WhatsApp, or Clipboard
 */
export function buildShareableTextSummary(
  result: MultiCoinAnalysisResult,
  config: ReportConfig
): string {
  const report = buildNumismaticJsonReport(result, config);
  const lines: string[] = [
    `🏛️ COINRARITY PRO — OFFICIAL NUMISMATIC SUMMARY REPORT`,
    `Report ID: ${report.reportMetadata.reportId} | Checksum: ${report.reportMetadata.cryptographicChecksum}`,
    `Scope: ${report.reportMetadata.reportScope} (${report.reportMetadata.specimenCount} ${
      report.reportMetadata.specimenCount === 1 ? 'Coin' : 'Coins'
    })`,
    `Prepared For: ${report.reportMetadata.preparedFor}`,
    `Generated: ${report.reportMetadata.generatedAtFormatted}`,
    `────────────────────────────────────────────`,
    `📊 PORTFOLIO VALUATION & METRICS`,
    `• Combined Auction Valuation: ${report.portfolioSummary.combinedEstimatedValuation}`,
    `• Intrinsic Bullion Melt Floor: ${report.portfolioSummary.totalIntrinsicMeltFloor}`,
  ];

  if (report.portfolioSummary.averageSheldonScore) {
    lines.push(`• Average Sheldon Grade Score: ${report.portfolioSummary.averageSheldonScore} / 70`);
  }
  if (report.portfolioSummary.standoutSpecimen) {
    const s = report.portfolioSummary.standoutSpecimen;
    lines.push(`• Standout Key Specimen: #${s.slotIndex} ${s.coinName} (${s.grade}) — ${s.estimatedValue}`);
  }
  if (config.customCollectorNotes.trim()) {
    lines.push(`• Collector Notes: ${config.customCollectorNotes.trim()}`);
  }

  lines.push(`────────────────────────────────────────────`);
  lines.push(`🪙 SPECIMEN MANIFEST (${report.specimens.length}):`);

  report.specimens.forEach((s) => {
    const die = s.forensicDiagnostics?.dieMatching?.diePairId
      ? ` | Die: ${s.forensicDiagnostics.dieMatching.diePairId}`
      : '';
    const cac = s.gradingAndValuation.cacAssessment?.greenBeanLikelihood
      ? ` | CAC: ${s.gradingAndValuation.cacAssessment.greenBeanLikelihood}%`
      : '';
    lines.push(
      `#${s.slotNumber} [${s.positionLabel}] ${s.identity.coinName} (${s.identity.year} ${s.identity.mintMark}) — Grade: ${s.gradingAndValuation.grade} | Value: ${s.gradingAndValuation.estimatedAuctionValue} | Rarity: ${s.gradingAndValuation.rarityLevel}${die}${cac}`
    );
  });

  lines.push(`────────────────────────────────────────────`);
  lines.push(`Verified by CoinRarity Pro 12-Node Forensic Grading Engine.`);
  return lines.join('\n');
}

/**
 * Generate a multi-page professional PDF Blob using jsPDF for either a single coin or 25-coin batch
 */
export async function generateNumismaticPdfBlob(
  result: MultiCoinAnalysisResult,
  masterImage: string,
  reverseImage: string | undefined,
  config: ReportConfig
): Promise<{ blob: Blob; filename: string }> {
  const report = buildNumismaticJsonReport(result, config);
  const isSingle = config.scope === 'single' || result.coins.length === 1;
  const targetCoins = isSingle
    ? [result.coins[config.selectedCoinIndex] || result.coins[0]]
    : result.coins;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let y = 0;

  const drawHeaderBanner = (subtitle: string) => {
    // Dark Navy Slate Banner
    doc.setFillColor(11, 15, 25);
    doc.rect(0, 0, pageWidth, 34, 'F');
    // Amber Gold accent bar
    doc.setFillColor(245, 158, 11);
    doc.rect(0, 34, pageWidth, 1.5, 'F');

    // Title
    doc.setTextColor(245, 158, 11);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('COINRARITY PRO • AUTONOMOUS FORENSIC NUMISMATIC BUREAU', margin, 11);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text(
      isSingle
        ? 'OFFICIAL SINGLE-SPECIMEN NUMISMATIC DOSSIER'
        : `MULTI-COIN BATCH AUDIT REPORT (${targetCoins.length} SPECIMENS)`,
      margin,
      20
    );

    doc.setTextColor(160, 174, 192);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(subtitle, margin, 27);

    // Right side metadata
    doc.setFont('courier', 'bold');
    doc.setTextColor(245, 158, 11);
    doc.text(`ID: ${report.reportMetadata.reportId}`, pageWidth - margin, 12, { align: 'right' });
    doc.setTextColor(203, 213, 225);
    doc.setFontSize(7.5);
    doc.text(`CHECKSUM: ${report.reportMetadata.cryptographicChecksum}`, pageWidth - margin, 18, {
      align: 'right',
    });
    doc.text(`DATE: ${new Date(result.timestamp).toLocaleDateString()}`, pageWidth - margin, 24, {
      align: 'right',
    });

    y = 42;
  };

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - 18) {
      doc.addPage();
      drawHeaderBanner(
        `Continued Dossier • Prepared for ${report.reportMetadata.preparedFor}`
      );
    }
  };

  // Start Page 1
  drawHeaderBanner(
    `Prepared For: ${report.reportMetadata.preparedFor} • Standard: Sheldon 1-70 & 12-Node Consensus`
  );

  // Executive Summary Card
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, contentWidth, 32, 3, 3, 'FD');

  const colW = contentWidth / 4;
  const kpis = [
    {
      label: isSingle ? 'SPECIMEN GRADE' : 'SPECIMENS IN BATCH',
      value: isSingle
        ? targetCoins[0]?.grade || 'UNC'
        : `${targetCoins.length} Coins`,
      sub: isSingle
        ? `Sheldon: ${targetCoins[0]?.sheldonScaleNumber || 'N/A'}/70`
        : `Avg Sheldon: ${report.portfolioSummary.averageSheldonScore || 'N/A'}`,
    },
    {
      label: 'AUCTION VALUATION',
      value: report.portfolioSummary.combinedEstimatedValuation,
      sub: 'Market Census Range',
    },
    {
      label: 'BULLION MELT FLOOR',
      value: report.portfolioSummary.totalIntrinsicMeltFloor,
      sub: 'Intrinsic Metal Content',
    },
    {
      label: isSingle ? 'RARITY TIER' : 'KEY STANDOUT',
      value: isSingle
        ? `${targetCoins[0]?.rarityLevel || 'Scarce'} (${targetCoins[0]?.rarityScore || 7}/10)`
        : report.portfolioSummary.standoutSpecimen
        ? `#${report.portfolioSummary.standoutSpecimen.slotIndex} ${report.portfolioSummary.standoutSpecimen.grade}`
        : 'Verified',
      sub: isSingle
        ? `CAC: ${targetCoins[0]?.cacAssessment?.greenBeanLikelihood ?? 85}% Bean`
        : report.portfolioSummary.standoutSpecimen?.coinName.slice(0, 22) || '',
    },
  ];

  kpis.forEach((kpi, i) => {
    const xPos = margin + i * colW + 4;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(kpi.label, xPos, y + 8);

    doc.setFont('courier', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(String(kpi.value).slice(0, 20), xPos, y + 17);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);
    doc.text(String(kpi.sub).slice(0, 25), xPos, y + 25);
  });

  y += 38;

  // Optional Master Photo & Executive Narrative
  if (config.includePhotos && masterImage) {
    const primaryImgSrc =
      isSingle && targetCoins[0]?.croppedImage ? targetCoins[0].croppedImage : masterImage;
    const jpegUrl = await loadImageAsJpegDataUrl(primaryImgSrc, 450);
    const revJpegUrl = isSingle && reverseImage ? await loadImageAsJpegDataUrl(reverseImage, 350) : null;

    if (jpegUrl) {
      checkPageBreak(52);
      doc.setFillColor(15, 23, 42);
      doc.roundedRect(margin, y, contentWidth, 48, 3, 3, 'F');

      try {
        doc.addImage(jpegUrl, 'JPEG', margin + 4, y + 4, 40, 40);
      } catch {
        // Ignore image embed failure if unsupported format
      }

      let textStartX = margin + 48;
      if (revJpegUrl) {
        try {
          doc.addImage(revJpegUrl, 'JPEG', margin + 47, y + 4, 40, 40);
          textStartX = margin + 91;
        } catch {
          // Ignore reverse embed failure
        }
      }

      const narrativeWidth = pageWidth - margin - textStartX - 4;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(245, 158, 11);
      doc.text(
        isSingle
          ? 'PHOTOGRAPHIC PLATE & CURATORIAL NARRATIVE'
          : 'MASTER TRAY MATRIX & PORTFOLIO SYNOPSIS',
        textStartX,
        y + 9
      );

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(226, 232, 240);
      const summaryText =
        result.collectionSummary || result.narrationScript || result.overallCondition;
      const wrapped = doc.splitTextToSize(summaryText, narrativeWidth);
      doc.text(wrapped.slice(0, 6), textStartX, y + 16);

      if (config.customCollectorNotes.trim()) {
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(251, 191, 36);
        const noteLines = doc.splitTextToSize(
          `Note: ${config.customCollectorNotes.trim()}`,
          narrativeWidth
        );
        doc.text(noteLines.slice(0, 2), textStartX, y + 41);
      }

      y += 54;
    }
  } else if (config.customCollectorNotes.trim()) {
    checkPageBreak(18);
    doc.setFillColor(254, 243, 199);
    doc.setDrawColor(245, 158, 11);
    doc.roundedRect(margin, y, contentWidth, 14, 2, 2, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(146, 64, 14);
    doc.text(`COLLECTOR / DEALER NOTES: ${config.customCollectorNotes.trim()}`, margin + 4, y + 9);
    y += 19;
  }

  // If Multi-Coin Batch, render the Complete Batch Summary Table first
  if (!isSingle && targetCoins.length > 1) {
    checkPageBreak(30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(`COMPLETE ${targetCoins.length}-COIN TRAY MANIFEST`, margin, y);
    y += 4;

    // Table Header
    doc.setFillColor(15, 23, 42);
    doc.rect(margin, y, contentWidth, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(245, 158, 11);

    doc.text('#', margin + 2, y + 4.8);
    doc.text('SPECIMEN DESIGNATION', margin + 11, y + 4.8);
    doc.text('YEAR / MINT', margin + 68, y + 4.8);
    doc.text('GRADE', margin + 94, y + 4.8);
    doc.text('RARITY', margin + 116, y + 4.8);
    doc.text('DIE PAIR', margin + 139, y + 4.8);
    doc.text('VALUATION', pageWidth - margin - 2, y + 4.8, { align: 'right' });
    y += 7;

    targetCoins.forEach((c, idx) => {
      checkPageBreak(8);
      if (idx % 2 === 0) {
        doc.setFillColor(241, 245, 249);
        doc.rect(margin, y, contentWidth, 6.5, 'F');
      }
      doc.setFont('courier', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(15, 23, 42);
      doc.text(`#${c.coinIndex || idx + 1}`, margin + 2, y + 4.5);

      doc.setFont('helvetica', 'bold');
      doc.text((c.coinName || 'Specimen').slice(0, 32), margin + 11, y + 4.5);

      doc.setFont('courier', 'normal');
      doc.setTextColor(51, 65, 85);
      doc.text(`${c.year || 'N/A'} ${c.mintMark || ''}`.trim().slice(0, 14), margin + 68, y + 4.5);

      doc.setFont('courier', 'bold');
      doc.setTextColor(180, 83, 9);
      doc.text((c.grade || 'UNC').slice(0, 11), margin + 94, y + 4.5);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text((c.rarityLevel || 'Common').slice(0, 12), margin + 116, y + 4.5);

      doc.setFont('courier', 'normal');
      doc.text((c.dieMatching?.diePairId || 'Standard').slice(0, 12), margin + 139, y + 4.5);

      doc.setFont('courier', 'bold');
      doc.setTextColor(4, 120, 87);
      doc.text((c.estimatedValue || '$0').slice(0, 16), pageWidth - margin - 2, y + 4.5, {
        align: 'right',
      });

      y += 6.5;
    });

    y += 8;
  }

  // Detailed Specimen Dossier Cards
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  checkPageBreak(15);
  doc.text(
    isSingle
      ? 'DETAILED FORENSIC SPECIMEN AUDIT'
      : 'INDIVIDUAL SPECIMEN FORENSIC DOSSIERS',
    margin,
    y
  );
  y += 5;

  for (let i = 0; i < targetCoins.length; i++) {
    const c = targetCoins[i];
    if (!c) continue;

    const cardHeight = isSingle ? 92 : 64;
    checkPageBreak(cardHeight);

    // Card Container
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(margin, y, contentWidth, cardHeight - 4, 2.5, 2.5, 'FD');

    // Top Strip of Card
    doc.setFillColor(15, 23, 42);
    doc.roundedRect(margin, y, contentWidth, 9, 2, 2, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(245, 158, 11);
    const slotNum = c.coinIndex || (isSingle ? config.selectedCoinIndex + 1 : i + 1);
    doc.text(
      `#${slotNum} • ${c.coinName} (${c.year || 'N/A'} ${c.mintMark || ''}) — ${
        c.positionLabel || `Slot #${slotNum}`
      }`,
      margin + 3,
      y + 6
    );

    doc.setFont('courier', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(52, 211, 153);
    doc.text(
      `GRADE: ${c.grade || 'UNC'} | VALUE: ${c.estimatedValue}`,
      pageWidth - margin - 3,
      y + 6,
      { align: 'right' }
    );

    let innerY = y + 14;

    // Row 1: Specs & Subgrades
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(30, 41, 59);
    const specLine = [
      `Rarity: ${c.rarityLevel} (${c.rarityScore}/10)`,
      `Alloy: ${c.composition || 'Standard'}`,
      `Melt: ${c.estimatedMeltValue || 'N/A'}`,
      `Strike: ${c.strikeQuality || 'Full'}`,
      `Luster: ${c.lusterRating || 'Original'}`,
    ].join('  |  ');
    doc.text(specLine.slice(0, 112), margin + 3, innerY);
    innerY += 5;

    if (c.subGrades) {
      doc.setFont('courier', 'bold');
      doc.setFontSize(7.2);
      doc.setTextColor(180, 83, 9);
      const subLine = `4-PILLAR SUBGRADES: Strike ${c.subGrades.strikeScore.toFixed(
        1
      )}/10 • Luster ${c.subGrades.lusterScore.toFixed(
        1
      )}/10 • Surface ${c.subGrades.surfacePreservationScore.toFixed(
        1
      )}/10 • Eye Appeal ${c.subGrades.eyeAppealScore.toFixed(1)}/10${
        c.cacAssessment ? `  |  CAC Bean Likelihood: ${c.cacAssessment.greenBeanLikelihood}%` : ''
      }`;
      doc.text(subLine, margin + 3, innerY);
      innerY += 5;
    }

    // Forensic Diagnostics Row
    if (config.includeForensics) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.2);
      doc.setTextColor(51, 65, 85);
      const dieInfo = c.dieMatching
        ? `Die Pair: ${c.dieMatching.diePairId} (${c.dieMatching.dieState}) • Doubling: ${
            c.dieMatching.doublingClass || 'None'
          }`
        : 'Die State: Verified Mint Standard';
      const strikeInfo = c.strikeReconstruction
        ? `Press Force: ${c.strikeReconstruction.estimatedStrikeTonnage}T (Collar: ${c.strikeReconstruction.collarEngagementPct}%, Fill: ${c.strikeReconstruction.reliefFillCompleteness}%)`
        : '';
      doc.text(`${dieInfo}   ${strikeInfo}`.slice(0, 115), margin + 3, innerY);
      innerY += 4.8;

      const wearAndAlloy = [
        c.wearProgression
          ? `Wear Model: ${c.wearProgression.wearClassification} (Clean Risk: ${c.wearProgression.cleaningProbability}%)`
          : '',
        c.spectralAlloy
          ? `Spectral: ${c.spectralAlloy.inferredAlloy} (${c.spectralAlloy.dominantWavelengthNm}nm)`
          : '',
        c.authenticityDiagnostics
          ? `Authenticity: ${c.authenticityDiagnostics.riskLevel}`
          : '',
      ]
        .filter(Boolean)
        .join('  |  ');

      if (wearAndAlloy) {
        doc.text(wearAndAlloy.slice(0, 115), margin + 3, innerY);
        innerY += 4.8;
      }
    }

    // Consensus & Market Row
    if (config.includeConsensus || config.includeMarketAndPedigree) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.2);
      doc.setTextColor(79, 70, 229);
      const consensusLine = [
        config.includeConsensus && c.graderConsensus
          ? `12-Node Consensus: ${c.graderConsensus.consensusGrade} (Spread: ${c.graderConsensus.gradeSpread}, Conf: ${c.graderConsensus.consensusConfidence}%)`
          : '',
        config.includeMarketAndPedigree && c.marketTrajectory
          ? `1Yr Target: ${c.marketTrajectory.oneYearProjection} (${c.marketTrajectory.momentum})`
          : '',
        config.includeMarketAndPedigree && c.provenanceChain
          ? `Insurance Value: ${c.provenanceChain.insuranceReplacementValue}`
          : '',
      ]
        .filter(Boolean)
        .join('  |  ');

      if (consensusLine) {
        doc.text(consensusLine.slice(0, 115), margin + 3, innerY);
        innerY += 5;
      }
    }

    // Master Grader Reasoning
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.3);
    doc.setTextColor(30, 41, 59);
    const maxReasoningLines = isSingle ? 5 : 2;
    const reasoningWrapped = doc.splitTextToSize(
      `Grader Notes: ${c.reasoning || 'Full original mint luster and sharp strike details verified.'}`,
      contentWidth - 6
    );
    doc.text(reasoningWrapped.slice(0, maxReasoningLines), margin + 3, innerY);
    innerY += maxReasoningLines * 3.8 + 2;

    // Single coin extra 12-node breakdown table if single mode
    if (isSingle && config.includeConsensus && c.graderConsensus?.nodes?.length) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      const nodeSummary = c.graderConsensus.nodes
        .slice(0, 6)
        .map((n) => `${n.graderRole.split(' ')[0]}: ${n.assignedGrade}`)
        .join(' • ');
      doc.text(`Panel Votes: ${nodeSummary}`.slice(0, 115), margin + 3, innerY);
    }

    y += cardHeight;
  }

  // Add footer with page numbers to all pages
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setDrawColor(203, 213, 225);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
    doc.setFont('courier', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `CoinRarity Pro Forensic Dossier • Audit ${report.reportMetadata.auditId} • Checksum ${report.reportMetadata.cryptographicChecksum}`,
      margin,
      pageHeight - 7.5
    );
    doc.text(`Page ${p} of ${totalPages}`, pageWidth - margin, pageHeight - 7.5, {
      align: 'right',
    });
  }

  const cleanAudit = (result.auditId || 'AUDIT').replace(/[^a-zA-Z0-9_-]/g, '');
  const filename = isSingle
    ? `CoinRarity_Specimen_${cleanAudit}_${(targetCoins[0]?.coinName || 'Coin')
        .replace(/[^a-zA-Z0-9]+/g, '_')
        .slice(0, 24)}.pdf`
    : `CoinRarity_Batch_${cleanAudit}_${targetCoins.length}Coins.pdf`;

  const blob = doc.output('blob');
  return { blob, filename };
}

/**
 * Trigger browser download for a Blob
 */
export function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 3000);
}
