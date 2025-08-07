import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get all TypeScript files recursively
function getAllTsxFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      getAllTsxFiles(filePath, fileList);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

// Fix patterns in a file
function fixFilePatterns(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Pattern 1: Fix color mode import
  const colorModePattern = /import { useColorMode } from "@chakra-ui\/color-mode"/g;
  if (colorModePattern.test(content)) {
    content = content.replace(colorModePattern, 'import { useColorMode } from "@/hooks/use-color-mode"');
    changed = true;
  }

  // Pattern 2: Fix useDisclosure property
  const useDisclosurePattern = /const { isOpen: (\w+), onOpen: (\w+), onClose: (\w+) } = useDisclosure\(\)/g;
  if (useDisclosurePattern.test(content)) {
    content = content.replace(useDisclosurePattern, 'const { open: $1, onOpen: $2, onClose: $3 } = useDisclosure()');
    changed = true;
  }

  // Pattern 3: Fix VStack spacing to gap
  const vstackSpacingPattern = /VStack\s+spacing={(\d+)}/g;
  if (vstackSpacingPattern.test(content)) {
    content = content.replace(vstackSpacingPattern, 'VStack gap={$1}');
    changed = true;
  }

  // Pattern 4: Fix HStack spacing to gap  
  const hstackSpacingPattern = /HStack\s+spacing={(\d+)}/g;
  if (hstackSpacingPattern.test(content)) {
    content = content.replace(hstackSpacingPattern, 'HStack gap={$1}');
    changed = true;
  }

  // Pattern 5: Fix Card usage to Card.Root
  const cardPattern = /<Card([^>]*)>/g;
  if (cardPattern.test(content)) {
    content = content.replace(cardPattern, '<Card.Root$1>');
    content = content.replace(/<\/Card>/g, '</Card.Root>');
    changed = true;
  }

  // Pattern 6: Fix CardBody to Card.Body
  const cardBodyPattern = /<CardBody([^>]*)>/g;
  if (cardBodyPattern.test(content)) {
    content = content.replace(cardBodyPattern, '<Card.Body$1>');
    content = content.replace(/<\/CardBody>/g, '</Card.Body>');
    changed = true;
  }

  // Pattern 7: Fix CardHeader to Card.Header
  const cardHeaderPattern = /<CardHeader([^>]*)>/g;
  if (cardHeaderPattern.test(content)) {
    content = content.replace(cardHeaderPattern, '<Card.Header$1>');
    content = content.replace(/<\/CardHeader>/g, '</Card.Header>');
    changed = true;
  }

  // Pattern 8: Fix IconButton icon prop to children
  const iconButtonPattern = /<IconButton([^>]*)icon={([^}]+)}([^>]*)\/>/g;
  if (iconButtonPattern.test(content)) {
    content = content.replace(iconButtonPattern, '<IconButton$1$3>$2</IconButton>');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log(`Fixed patterns in: ${filePath}`);
  }
}

// Main execution
const srcDir = path.join(__dirname, 'src');
const files = getAllTsxFiles(srcDir);

console.log(`Processing ${files.length} files...`);
files.forEach(fixFilePatterns);
console.log('Pattern fixes completed!');
