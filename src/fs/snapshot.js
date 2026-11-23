import { readdir, readFile, stat, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const snapshot = async () => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const snapshotFileContent = { rootPath: __dirname, entries: [] };

  try {
    const entries = await readdir(__dirname, { withFileTypes: true, recursive: true });

    for (const entry of entries) {
      const fullPath = path.join(entry.parentPath, entry.name);
      const relativePath = path.relative(__dirname, fullPath);

      if (entry.isDirectory()) {
        snapshotFileContent.entries.push({ path: relativePath, type: 'directory' });
      } else if (entry.isFile()) {
        const { size } = await stat(fullPath);
        const content = await readFile(fullPath, 'utf-8');

        snapshotFileContent.entries.push({ path: relativePath, type: 'file', size, content });
      }
    }

    await writeFile('snapshot.json', JSON.stringify(snapshotFileContent, null, 2));

    console.log(`Snapshot saved: ${snapshotFileContent.entries.length} entries`);
  } catch (error) {
    console.error(`Error creating snapshot: ${error.message}`);
  }
};

await snapshot();
