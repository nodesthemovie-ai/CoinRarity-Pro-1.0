export interface CoinVarietyOrError {
  type: string;
  detected: boolean;
  description?: string;
  significance?: string;
}

export interface SubGradeScores {
  strikeScore: number; // 1 - 10
  lusterScore: number; // 1 - 10
  surfacePreservationScore: number; // 1 - 10
  eyeAppealScore: number; // 1 - 10
}

export interface AuthenticityDiagnostics {
  riskLevel: 'Low Risk' | 'Moderate Concern' | 'High Risk / Potential Counterfeit';
  seamLinesObserved: boolean;
  porosityOrCastTexture: boolean;
  toolingMarksDetected: boolean;
  denticleIntegrity: 'Sharp' | 'Slightly Muted' | 'Mushy / Cast-Like';
  detailsSummary: string;
  recommendedPhysicalTests: string[];
}

export interface CacAssessment {
  greenBeanLikelihood: number; // 0 - 100%
  goldBeanLikelihood: number; // 0 - 100%
  gradeConsistency: 'High-End for Grade' | 'Solid for Grade' | 'Low-End for Grade';
  cacNotes: string;
}

export interface DieMatchingResult {
  diePairId: string; // e.g. "VAM-1A", "FS-101", "DDO-001", "Die-Pair-4"
  dieState: 'Early Die State (EDS)' | 'Mid Die State (MDS)' | 'Late Die State (LDS)' | 'Terminal Die State (TDS)';
  varietyAttribution: string; // e.g. "Cherrypickers FS-01-1909S-101"
  dieMarkers: string[]; // Specific identifying clash marks, die polish lines, die gouges
  doublingClass?: 'Class I Rotated Hub' | 'Class II Distorted Hub' | 'Class IV Offset Hub' | 'Class V Pivoted Hub' | 'None Detected' | string;
  rpmVector?: string; // e.g. "D/D North-Northeast 0.25mm separation"
  dieAuthenticityConfidence: number; // 0 - 100%
}

export interface WearFeatureComparison {
  feature: string;
  expectedReliefPct: number;
  observedReliefPct: number;
  status: 'Mint State Sharpness' | 'Light High-Point Friction' | 'Moderate Wear' | 'Artificial Rub / Harshly Cleaned';
}

export interface WearProgressionModel {
  modeledWearVsExpected: string;
  cleaningProbability: number; // 0 - 100%
  artificialWearDetected: boolean;
  wearClassification: 'Original Uncirculated' | 'Natural Cabinet Friction' | 'Circulated Wear' | 'Chemically Altered / Wiped';
  highPointWearBreakdown: WearFeatureComparison[];
  wearSummary: string;
}

export interface SpectralAlloyInference {
  inferredAlloy: string; // e.g. "90.2% Silver, 9.8% Copper (Nominal 90/10)"
  dominantWavelengthNm: number; // e.g. 580nm
  reflectivityIndex: number; // 0 - 100
  alloyConsistency: 'Exact Mint Standard' | 'Suspect Base-Metal Alloy' | 'Transitional Off-Metal Blank' | 'Debased Bullion';
  spectralSignatureNotes: string;
  colorSpectrumGroup: 'Silver-White Lustrous' | 'Copper-Red Toned' | 'Steel-Grey Matte' | 'Gold Aureate';
}

export interface GraderNode {
  graderRole: string; // e.g. "Chief Technical Grader", "Luster & Cartwheel Specialist", "Strike Sharpness Auditor", "Surface Integrity Auditor", "Auction Market Grader", "Variety Specialist"
  assignedGrade: string;
  sheldonNum: number;
  notes: string;
}

export interface MultiModelGraderConsensus {
  nodes: GraderNode[];
  consensusGrade: string;
  consensusSheldon: number;
  gradeSpread: string; // e.g. "MS-64 to MS-65+"
  consensusConfidence: number; // 0 - 100%
  consensusSummary: string;
}

export interface RestorationAdvisor {
  acetoneSafe: boolean;
  verdigrisPresent: boolean;
  pvcDamageDetected: boolean;
  conservationAction: 'Safe to Conserve (Curatorial Acetone)' | 'Do Not Touch / Pristine Original Surface' | 'Requires Professional NCS Conservation' | 'Permanent Environmental Damage';
  safeHandlingSteps: string[];
  warnings: string[];
}

export interface MarketTrajectory {
  currentMarketIndex: string;
  sixMonthProjection: string;
  oneYearProjection: string;
  momentum: 'Bullish / High Collector Demand' | 'Stable Blue-Chip Hold' | 'Volatile Speculative' | 'Softening';
  rarityTrajectoryRank: string; // e.g. "Top 2% of Survival Census"
  keyDrivers: string[];
}

export interface StrikeReconstruction {
  estimatedStrikeTonnage: number; // e.g. 138 metric tons
  nominalMintTonnage: number; // e.g. 135 metric tons
  dieAlignmentAngleDeg: number; // e.g. 0.12 degrees
  planchetHardnessVickers: number; // e.g. 86 HV
  collarEngagementPct: number; // 0 - 100%
  reliefFillCompleteness: number; // 0 - 100%
  strikeSignatureStatus: 'Full Mint Strike' | 'Weak Center / High-Pressure Rim' | 'Late Die State Flow' | 'Misaligned / Rotated Die' | 'Suspect Low-Pressure Strike';
  strikeReconstructionNotes: string;
  pressureZoneBreakdown: {
    zone: string;
    fillPct: number;
    pressureRating: 'Optimal' | 'Soft' | 'High Stress';
  }[];
}

export interface ProvenanceEvent {
  eraOrDate: string;
  eventTitle: string;
  institutionOrVenue: string;
  gradeAtEvent: string;
  notes: string;
  verified: boolean;
}

export interface ProvenanceChain {
  pedigreeStatus: 'Documented Type Census' | 'Notable Numismatic Pedigree' | 'Fresh Estate / Unrecorded' | 'Prior Slab Crossover Candidate';
  crossoverEligibility: string;
  insuranceReplacementValue: string;
  registryCompetitiveness: string;
  chainEvents: ProvenanceEvent[];
}

export interface SingleCoinData {
  coinIndex?: number; // 1 to 25 sequential identification in image
  boundingBox?: [number, number, number, number]; // [ymin, xmin, ymax, xmax] normalized 0-1000
  positionLabel?: string; // Spatial location label (e.g. "Row 1, Position 2 - Upper Left", "Center Specimen")
  croppedImage?: string; // Auto-cropped high-res specimen extracted from master photo
  coinName: string;
  country?: string;
  denomination?: string;
  year?: string;
  mintMark?: string;
  strikeType?: string; // Business, Proof, Special Mint, Specimen
  rarityScore: number; // 1 - 10
  rarityLevel: 'Common' | 'Scarce' | 'Rare' | 'Very Rare' | 'Ultra-Rare' | string;
  grade?: string; // e.g., MS-65 RD, AU-58, VF-20, Cleaned
  sheldonScaleNumber?: number; // 1 - 70
  strikeQuality?: string; // e.g. Full Strike, Weak Details, Full Bell Lines, Full Split Bands
  lusterRating?: string; // Frosty, Satiny, Prooflike, Muted
  eyeAppeal?: number; // 1 - 5 stars
  subGrades?: SubGradeScores;
  composition?: string; // 90% Silver, Copper-Nickel, Bronze, etc.
  preciousMetalContent?: string; // e.g. 0.1808 oz ASW (Actual Silver Weight)
  estimatedMeltValue?: string; // e.g. $5.40
  weight?: string;
  diameter?: string;
  varietiesAndErrors?: CoinVarietyOrError[];
  reasoning: string;
  estimatedValue: string; // e.g. $150 - $225
  historicalContext?: string;
  auctionRecordsInsight?: string;
  authenticityConfidence?: number; // 0 - 100%
  pcgsNumber?: string;
  mintage?: string;
  designersInitials?: string;
  authenticityDiagnostics?: AuthenticityDiagnostics;
  cacAssessment?: CacAssessment;
  dieMatching?: DieMatchingResult;
  wearProgression?: WearProgressionModel;
  spectralAlloy?: SpectralAlloyInference;
  graderConsensus?: MultiModelGraderConsensus;
  restorationAdvisor?: RestorationAdvisor;
  marketTrajectory?: MarketTrajectory;
  strikeReconstruction?: StrikeReconstruction;
  provenanceChain?: ProvenanceChain;
}

export interface MultiCoinAnalysisResult {
  coins: SingleCoinData[];
  totalCoinsDetected?: number;
  batchType?: 'Single Specimen' | 'Multi-Coin Tray (Up to 25 Coins)';
  totalEstimatedPortfolioValue?: string;
  totalMeltValue?: string;
  standoutRarityCoinIndex?: number;
  collectionSummary?: string;
  narrationScript: string;
  timestamp: number;
  overallCondition: string;
  auditId?: string;
  lightingAssessment?: string;
  reverseGradingNotes?: string;
}

export interface SavedAnalysis extends MultiCoinAnalysisResult {
  id: string;
  image: string;
  reverseImage?: string;
  dateStr?: string;
  customNotes?: string;
}

export enum AnalysisStatus {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  GENERATING_AUDIO = 'GENERATING_AUDIO',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}

export interface AudioState {
  isPlaying: boolean;
  blobUrl: string | null;
  isLoading: boolean;
  progress: number;
  duration: number;
  playbackRate: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}
