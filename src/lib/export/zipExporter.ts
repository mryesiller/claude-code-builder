import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { type TreeEntry } from '@/lib/types';

function addToZip(zip: JSZip, entry: TreeEntry, parentPath: string = '') {
  const currentPath = parentPath ? `${parentPath}/${entry.name}` : entry.name;

  if (entry.type === 'directory') {
    const folder = zip.folder(currentPath)!;
    if (entry.children) {
      entry.children.forEach((child) => addToZip(zip, child, currentPath));
    }
    // Add empty folders with .gitkeep if no children
    if (!entry.children || entry.children.length === 0) {
      folder.file('.gitkeep', '');
    }
  } else {
    zip.file(currentPath, entry.content || '');
  }
}

export async function exportAsZip(tree: TreeEntry): Promise<void> {
  const zip = new JSZip();
  addToZip(zip, tree);

  const blob = await zip.generateAsync({ type: 'blob' });
  saveAs(blob, `${tree.name}.zip`);
}
