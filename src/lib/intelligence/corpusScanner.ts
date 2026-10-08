import fs from 'fs';
import path from 'path';
import { inspectStkndsBuffer, StkndsInspectionResult } from '../stknds/stkndsCore';
import { STICKFIGURE_PARENTS, STICKFIGURE_BONE_NAMES } from '../stknds/stickfigureStructure';
import {
  CharacterHierarchyNode,
  CharacterStructureProfile,
  CorpusCatalog,
  CorpusProjectCategory,
  ProjectMetadata,
} from './types';

export interface ScanOptions {
  recursive?: boolean;
  fileExtensions?: string[];
  maxFileSizeBytes?: number;
}

export function buildCharacterStructureProfile(
  figNodes: StkndsInspectionResult['figureNodes'],
  figName: string = 'Stickfigure'
): CharacterStructureProfile {
  const nodeCount = figNodes.length;
  const nodes: CharacterHierarchyNode[] = [];

  // Determine parent/child relationships
  for (let i = 0; i < nodeCount; i++) {
    const parentIdx = nodeCount === 17 && i < STICKFIGURE_PARENTS.length
      ? STICKFIGURE_PARENTS[i]
      : i === 0 ? -1 : 0; // default root child fallback for non-standard figures

    nodes.push({
      index: i,
      uid: figNodes[i]?.uid ?? i,
      name: nodeCount === 17 ? STICKFIGURE_BONE_NAMES[i] : `Node_${i}`,
      parentIndex: parentIdx,
      childrenIndices: [],
      length: figNodes[i]?.length ?? 0,
      thickness: figNodes[i]?.thickness ?? 0,
    });
  }

  // Populate children
  for (let i = 0; i < nodeCount; i++) {
    const parent = nodes[i].parentIndex;
    if (parent >= 0 && parent < nodeCount) {
      nodes[parent].childrenIndices.push(i);
    }
  }

  let rootIndex = 0;
  let headIndex: number | undefined;
  let pelvisIndex: number | undefined;
  let leftHandIndex: number | undefined;
  let rightHandIndex: number | undefined;
  let leftFootIndex: number | undefined;
  let rightFootIndex: number | undefined;

  if (nodeCount === 17) {
    pelvisIndex = 0;
    rightFootIndex = 3;
    leftFootIndex = 6;
    rightHandIndex = 11;
    headIndex = 13;
    leftHandIndex = 16;

    nodes[0].role = 'pelvis';
    nodes[1].role = 'leg';
    nodes[2].role = 'leg';
    nodes[3].role = 'foot';
    nodes[4].role = 'leg';
    nodes[5].role = 'leg';
    nodes[6].role = 'foot';
    nodes[7].role = 'torso';
    nodes[8].role = 'torso';
    nodes[9].role = 'arm';
    nodes[10].role = 'arm';
    nodes[11].role = 'hand';
    nodes[12].role = 'head';
    nodes[13].role = 'head';
    nodes[14].role = 'arm';
    nodes[15].role = 'arm';
    nodes[16].role = 'hand';
  } else if (nodes.length > 0) {
    nodes[0].role = 'root';
  }

  const kineticChains = nodeCount === 17 ? [
    { name: 'Right Leg', jointIndices: [0, 1, 2, 3] },
    { name: 'Left Leg', jointIndices: [0, 4, 5, 6] },
    { name: 'Spine / Torso / Head', jointIndices: [0, 7, 8, 12, 13] },
    { name: 'Right Arm', jointIndices: [8, 9, 10, 11] },
    { name: 'Left Arm', jointIndices: [8, 14, 15, 16] },
  ] : [
    { name: 'Main Hierarchy', jointIndices: nodes.map(n => n.index) },
  ];

  return {
    figureName: figName,
    nodeCount,
    nodes,
    rootIndex,
    headIndex,
    pelvisIndex,
    leftHandIndex,
    rightHandIndex,
    leftFootIndex,
    rightFootIndex,
    kineticChains,
  };
}

export function classifyProject(
  fileName: string,
  filePath: string,
  inspection: StkndsInspectionResult
): CorpusProjectCategory {
  if (!inspection.prefixValid) {
    return 'malformed';
  }

  const lowerName = fileName.toLowerCase();
  const lowerPath = filePath.toLowerCase();

  if (lowerName.includes('test') || lowerName.includes('benchmark')) {
    return 'test';
  }

  if (lowerName.includes('gen_') || lowerName.includes('generated') || lowerPath.includes('output')) {
    return 'generated';
  }

  if (lowerPath.includes('template') || lowerName.includes('project') || lowerName.includes('combo') || lowerName.includes('teleport')) {
    return 'reference';
  }

  return 'template';
}

export async function scanCorpus(
  directories: string[] = ['templates'],
  options: ScanOptions = {}
): Promise<CorpusCatalog> {
  const analyzedProjects: ProjectMetadata[] = [];
  const malformedProjects: { filePath: string; reason: string }[] = [];
  const categoriesCount: Record<CorpusProjectCategory, number> = {
    reference: 0,
    template: 0,
    generated: 0,
    test: 0,
    experimental: 0,
    malformed: 0,
    unsupported: 0,
  };

  const filePathsToScan: string[] = [];

  for (const dirPath of directories) {
    if (!fs.existsSync(dirPath)) {
      continue;
    }

    const stat = fs.statSync(dirPath);
    if (stat.isFile()) {
      if (dirPath.endsWith('.stknds')) {
        filePathsToScan.push(dirPath);
      }
      continue;
    }

    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isFile() && entry.name.endsWith('.stknds')) {
        filePathsToScan.push(fullPath);
      } else if (entry.isDirectory() && options.recursive) {
        const subFiles = fs.readdirSync(fullPath).filter(f => f.endsWith('.stknds'));
        for (const sf of subFiles) {
          filePathsToScan.push(path.join(fullPath, sf));
        }
      }
    }
  }

  for (const filePath of filePathsToScan) {
    const fileName = path.basename(filePath);
    try {
      const fileBuffer = fs.readFileSync(filePath);
      const ab = fileBuffer.buffer.slice(
        fileBuffer.byteOffset,
        fileBuffer.byteOffset + fileBuffer.byteLength
      );

      const inspection = await inspectStkndsBuffer(fileName, ab);

      if (!inspection.prefixValid) {
        malformedProjects.push({ filePath, reason: 'Invalid outer 9-byte magic prefix' });
        categoriesCount.malformed++;
        continue;
      }

      const category = classifyProject(fileName, filePath, inspection);
      categoriesCount[category]++;

      const characterProfile = buildCharacterStructureProfile(
        inspection.figureNodes,
        inspection.figureName || 'Stickfigure'
      );

      const metadata: ProjectMetadata = {
        id: `proj_${inspection.sha256.substring(0, 12)}`,
        fileName,
        filePath,
        sha256: inspection.sha256,
        projectName: inspection.projectName || fileName,
        fps: inspection.fps || 24,
        tweenedFrames: inspection.tweenedFrames || 0,
        frameCount: inspection.frameCount,
        durationSeconds: (inspection.frameCount / (inspection.fps || 24)),
        category,
        characterCount: inspection.frames[0]?.figureCount ?? 1,
        characters: [characterProfile],
        hasCameraData: inspection.frames.some(f => (f.camZoom ?? 1) !== 1 || (f.camX ?? 0) !== 0 || (f.camY ?? 0) !== 0),
        hasAudioData: false,
        fileSizeBytes: fileBuffer.length,
        decompressedSizeBytes: inspection.decompressedSize,
        analyzedAt: new Date().toISOString(),
      };

      analyzedProjects.push(metadata);
    } catch (err: any) {
      malformedProjects.push({
        filePath,
        reason: err?.message || 'Error parsing .stknds binary',
      });
      categoriesCount.malformed++;
    }
  }

  const catalog: CorpusCatalog = {
    generatedAt: new Date().toISOString(),
    totalProjectsScanned: filePathsToScan.length,
    analyzedProjects,
    malformedProjects,
    categoriesCount,
  };

  return catalog;
}

export function saveCorpusCatalog(catalog: CorpusCatalog, outputDir: string = 'analysis'): void {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const catalogPath = path.join(outputDir, 'corpus_catalog.json');
  fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2), 'utf-8');

  const corpusDir = 'corpus';
  if (!fs.existsSync(corpusDir)) {
    fs.mkdirSync(corpusDir, { recursive: true });
  }
  fs.writeFileSync(
    path.join(corpusDir, 'project_metadata.json'),
    JSON.stringify(catalog.analyzedProjects, null, 2),
    'utf-8'
  );
}
