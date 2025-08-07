import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fix remaining Card tag mismatches
function fixRemainingCardTags(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Fix all remaining CardBody closing tags
  if (content.includes('</CardBody>')) {
    content = content.replace(/<\/CardBody>/g, '</Card.Body>');
    changed = true;
  }

  // Fix all remaining CardHeader closing tags
  if (content.includes('</CardHeader>')) {
    content = content.replace(/<\/CardHeader>/g, '</Card.Header>');
    changed = true;
  }

  // Fix all remaining CardTitle closing tags
  if (content.includes('</CardTitle>')) {
    content = content.replace(/<\/CardTitle>/g, '</Card.Title>');
    changed = true;
  }

  // Fix all remaining CardFooter closing tags
  if (content.includes('</CardFooter>')) {
    content = content.replace(/<\/CardFooter>/g, '</Card.Footer>');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log(`Fixed remaining card tags in: ${filePath}`);
  }
}

// Get all files in src directory
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

const srcDir = path.join(__dirname, 'src');
const files = getAllTsxFiles(srcDir);

console.log(`Processing ${files.length} files for final card tag fixes...`);
files.forEach(fixRemainingCardTags);
console.log('Final card tag fixes completed!');
