require('ui')

// Binary File Viewer - Main Application
// DOM Elements
const fileInput = document.getElementById('file-input');
const fileName = document.getElementById('file-name');
const fileInfo = document.getElementById('file-info');
const infoFileName = document.getElementById('info-file-name');
const infoFileSize = document.getElementById('info-file-size');
const infoFileType = document.getElementById('info-file-type');
const infoFileModified = document.getElementById('info-file-modified');
const navControls = document.getElementById('nav-controls');
const btnFirst = document.getElementById('btn-first');
const btnPrev = document.getElementById('btn-prev');
const btnNext = document.getElementById('btn-next');
const btnLast = document.getElementById('btn-last');
const pageInput = document.getElementById('page-input');
const pageCount = document.getElementById('page-count');
const bytesPerPage = document.getElementById('bytes-per-page');
const offsetInput = document.getElementById('offset-input');
const btnGo = document.getElementById('btn-go');
const viewerContainer = document.getElementById('viewer-container');
const offsetColumn = document.getElementById('offset-column');
const hexColumn = document.getElementById('hex-column');
const asciiColumn = document.getElementById('ascii-column');
const noFileMessage = document.getElementById('no-file-message');
const loadingIndicator = document.getElementById('loading-indicator');
const statusMessage = document.getElementById('status-message');

// Application State
const appState = {
	file: null,
	fileData: null,
	currentPage: 1,
	bytesPerPage: 256,
	bytesPerRow: 16,
	fileSignatures: [
	  { signature: [0x42, 0x4D], description: 'BMP Image' },
	  { signature: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A], description: 'PNG Image' },
	  { signature: [0xFF, 0xD8, 0xFF], description: 'JPEG Image' },
	  { signature: [0x25, 0x50, 0x44, 0x46], description: 'PDF Document' },
	  { signature: [0x7F, 0x45, 0x4C, 0x46], description: 'ELF Executable' },
	  { signature: [0x4D, 0x5A], description: 'Windows Executable' },
	  { signature: [0x50, 0x4B, 0x03, 0x04], description: 'ZIP Archive' },
	  { signature: [0x1F, 0x8B], description: 'GZIP Archive' },
	  { signature: [0x49, 0x44, 0x33], description: 'MP3 Audio' },
	  { signature: [0x00, 0x00, 0x01, 0xBA], description: 'MPEG Video' },
	  { signature: [0x30, 0x26, 0xB2, 0x75, 0x8E, 0x66, 0xCF, 0x11], description: 'WMV Video' },
	  { signature: [0x66, 0x74, 0x79, 0x70], description: 'MP4 Video' },
	  { signature: [0x4F, 0x67, 0x67, 0x53], description: 'OGG Audio/Video' },
	  { signature: [0x52, 0x49, 0x46, 0x46], description: 'RIFF Container' },
	  { signature: [0x57, 0x41, 0x56, 0x45], description: 'WAV Audio' },
	  { signature: [0x42, 0x5A, 0x68], description: 'BZIP2 Archive' },
	  { signature: [0x37, 0x7A, 0xBC, 0xAF, 0x27, 0x1C], description: '7Z Archive' },
	  { signature: [0x4D, 0x53, 0x43, 0x46], description: 'CAB Archive' },
	  { signature: [0x50, 0x4B, 0x05, 0x06], description: 'ZIP Archive (Empty)' },
	  { signature: [0x50, 0x4B, 0x07, 0x08], description: 'ZIP Archive (Spanned)' },
	]
};

// Initialize the application
function init() {
// Set up event listeners
fileInput.addEventListener('change', handleFileSelect);
btnFirst.addEventListener('click', goToFirstPage);
btnPrev.addEventListener('click', goToPreviousPage);
btnNext.addEventListener('click', goToNextPage);
btnLast.addEventListener('click', goToLastPage);
pageInput.addEventListener('change', handlePageChange);
bytesPerPage.addEventListener('change', handleBytesPerPageChange);
btnGo.addEventListener('click', handleGoToOffset);
offsetInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') handleGoToOffset();
});

// Set initial state
updateUI();
}

// Handle file selection
function handleFileSelect(event) {
	const file = event.target.files[0];
	if (!file) return;

	appState.file = file;
	fileName.textContent = file.name;

	// Show loading indicator
	showLoading();

	// Read file as ArrayBuffer
	const reader = new FileReader();
	reader.onload = function(e) {
	  appState.fileData = new Uint8Array(e.target.result);
	  appState.currentPage = 1;
	  updateFileInfo();
	  renderPage();
	  updateUI();
	  hideLoading();
	  showStatus(`Successfully loaded ${formatFileSize(appState.fileData.length)}`);
	};

	reader.onerror = function() {
	  hideLoading();
	  showStatus('Error reading file', true);
	  alert('Error reading file. Please try again.');
	};

	reader.readAsArrayBuffer(file);
}

// Update file information display
function updateFileInfo() {
if (!appState.file) return;

infoFileName.textContent = appState.file.name;
infoFileSize.textContent = formatFileSize(appState.file.size);
infoFileType.textContent = detectFileType() || 'Unknown';
infoFileModified.textContent = appState.file.lastModifiedDate.toLocaleString();
}

// Detect file type based on signature
function detectFileType() {
if (!appState.fileData || appState.fileData.length === 0) return null;

for (const sig of appState.fileSignatures) {
  const signatureLength = sig.signature.length;
  if (appState.fileData.length >= signatureLength) {
	let match = true;
	for (let i = 0; i < signatureLength; i++) {
	  if (appState.fileData[i] !== sig.signature[i]) {
		match = false;
		break;
	  }
	}
	if (match) {
	  return sig.description;
	}
  }
}

return null;
}

// Render the current page
function renderPage() {
if (!appState.fileData) return;

const bytesPerPage = parseInt(appState.bytesPerPage);
const startOffset = (appState.currentPage - 1) * bytesPerPage;
const endOffset = Math.min(startOffset + bytesPerPage, appState.fileData.length);

// Clear previous content
offsetColumn.innerHTML = '';
hexColumn.innerHTML = '';
asciiColumn.innerHTML = '';

// Create rows for each segment
for (let offset = startOffset; offset < endOffset; offset += appState.bytesPerRow) {
  const rowEnd = Math.min(offset + appState.bytesPerRow, endOffset);
  
  // Create offset cell
  const offsetCell = document.createElement('div');
  offsetCell.className = 'px-2 py-1 text-right text-gray-400 font-mono text-sm';
  offsetCell.textContent = offset.toString(16).padStart(8, '0');
  offsetCell.dataset.offset = offset;
  offsetColumn.appendChild(offsetCell);
  
  // Create hex cell
  const hexCell = document.createElement('div');
  hexCell.className = 'px-2 py-1 font-mono text-sm';
  hexCell.dataset.offset = offset;
  
  // Create ascii cell
  const asciiCell = document.createElement('div');
  asciiCell.className = 'px-2 py-1 font-mono text-sm';
  asciiCell.dataset.offset = offset;
  
  // Fill hex and ascii content
  let hexText = '';
  let asciiText = '';
  
  for (let i = offset; i < rowEnd; i++) {
	const byte = appState.fileData[i];
	hexText += byte.toString(16).padStart(2, '0') + ' ';
	
	// Determine if byte is printable ASCII
	const charCode = byte;
	if (charCode >= 0x20 && charCode <= 0x7E) {
	  asciiText += String.fromCharCode(charCode);
	} else if (charCode === 0x00) {
	  asciiText += '<span class="null-byte">.</span>';
	} else {
	  asciiText += '<span class="non-printable-char">.</span>';
	}
  }
  
  // Add spacing for alignment
  const hexSpaces = (appState.bytesPerRow - (rowEnd - offset)) * 3;
  hexText += ' '.repeat(hexSpaces);
  
  hexCell.textContent = hexText;
  asciiCell.innerHTML = asciiText;
  
  // Add hover and click events
  [offsetCell, hexCell, asciiCell].forEach(cell => {
	cell.addEventListener('mouseenter', handleRowHover);
	cell.addEventListener('mouseleave', handleRowLeave);
	cell.addEventListener('click', handleRowClick);
  });
  
  hexColumn.appendChild(hexCell);
  asciiColumn.appendChild(asciiCell);
}

// Highlight file signature if it's on this page
highlightFileSignature(startOffset, endOffset);
}

// Highlight file signature bytes
function highlightFileSignature(startOffset, endOffset) {
if (!appState.fileData || appState.fileData.length === 0) return;

for (const sig of appState.fileSignatures) {
  const signatureLength = sig.signature.length;
  if (appState.fileData.length >= signatureLength) {
	let match = true;
	for (let i = 0; i < signatureLength; i++) {
	  if (appState.fileData[i] !== sig.signature[i]) {
		match = false;
		break;
	  }
	}
	
	if (match && 0 >= startOffset && signatureLength <= endOffset) {
	  // Highlight in hex column
	  const hexCells = hexColumn.querySelectorAll('div');
	  for (let i = 0; i < signatureLength; i++) {
		const byteOffset = i;
		const rowOffset = Math.floor(byteOffset / appState.bytesPerRow);
		const colOffset = byteOffset % appState.bytesPerRow;
		
		if (rowOffset < hexCells.length) {
		  const hexCell = hexCells[rowOffset];
		  const text = hexCell.textContent;
		  const startIndex = colOffset * 3;
		  const endIndex = startIndex + 2;
		  
		  if (startIndex >= 0 && endIndex <= text.length) {
			const newText = text.substring(0, startIndex) +
			  `<span class="file-signature">${text.substring(startIndex, endIndex)}</span>` +
			  text.substring(endIndex);
			hexCell.innerHTML = newText;
		  }
		}
	  }
	  
	  // Highlight in ascii column
	  const asciiCells = asciiColumn.querySelectorAll('div');
	  for (let i = 0; i < signatureLength; i++) {
		const byteOffset = i;
		const rowOffset = Math.floor(byteOffset / appState.bytesPerRow);
		const colOffset = byteOffset % appState.bytesPerRow;
		
		if (rowOffset < asciiCells.length) {
		  const asciiCell = asciiCells[rowOffset];
		  const childNodes = asciiCell.childNodes;
		  
		  // Find the text node or span that contains the character
		  let charNode = null;
		  let charIndex = 0;
		  
		  for (const node of childNodes) {
			if (node.nodeType === Node.TEXT_NODE) {
			  const textLength = node.textContent.length;
			  if (charIndex + textLength > colOffset) {
				// Split the text node
				const text = node.textContent;
				const before = text.substring(0, colOffset - charIndex);
				const char = text.substring(colOffset - charIndex, colOffset - charIndex + 1);
				const after = text.substring(colOffset - charIndex + 1);
				
				// Replace the text node with new nodes
				node.textContent = before;
				
				const span = document.createElement('span');
				span.className = 'file-signature';
				span.textContent = char;
				
				const afterNode = document.createTextNode(after);
				
				asciiCell.insertBefore(span, node.nextSibling);
				asciiCell.insertBefore(afterNode, span.nextSibling);
				
				charNode = span;
				break;
			  }
			  charIndex += textLength;
			} else if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'SPAN') {
			  if (charIndex === colOffset) {
				node.classList.add('file-signature');
				charNode = node;
				break;
			  }
			  charIndex += 1;
			}
		  }
		}
	  }
	  
	  break; // Only highlight the first matching signature
	}
  }
}
}

// Handle row hover event
function handleRowHover(event) {
const row = event.currentTarget;
const offset = parseInt(row.dataset.offset);

// Highlight corresponding rows in all columns
const offsetRows = offsetColumn.querySelectorAll(`div[data-offset="${offset}"]`);
const hexRows = hexColumn.querySelectorAll(`div[data-offset="${offset}"]`);
const asciiRows = asciiColumn.querySelectorAll(`div[data-offset="${offset}"]`);

offsetRows.forEach(r => r.classList.add('offset-highlight'));
hexRows.forEach(r => r.classList.add('hex-highlight'));
asciiRows.forEach(r => r.classList.add('ascii-highlight'));
}

// Handle row leave event
function handleRowLeave(event) {
const row = event.currentTarget;
const offset = parseInt(row.dataset.offset);

// Remove highlight from corresponding rows in all columns
const offsetRows = offsetColumn.querySelectorAll(`div[data-offset="${offset}"]`);
const hexRows = hexColumn.querySelectorAll(`div[data-offset="${offset}"]`);
const asciiRows = asciiColumn.querySelectorAll(`div[data-offset="${offset}"]`);

offsetRows.forEach(r => r.classList.remove('offset-highlight'));
hexRows.forEach(r => r.classList.remove('hex-highlight'));
asciiRows.forEach(r => r.classList.remove('ascii-highlight'));
}

// Handle row click event
function handleRowClick(event) {
const row = event.currentTarget;
const offset = parseInt(row.dataset.offset);

// Show offset in status
showStatus(`Offset: 0x${offset.toString(16).padStart(8, '0')} (${offset})`);
}

// Navigation functions
function goToFirstPage() {
if (appState.currentPage !== 1) {
  appState.currentPage = 1;
  renderPage();
  updateUI();
}
}

function goToPreviousPage() {
if (appState.currentPage > 1) {
  appState.currentPage--;
  renderPage();
  updateUI();
}
}

function goToNextPage() {
const totalPages = getTotalPages();
if (appState.currentPage < totalPages) {
  appState.currentPage++;
  renderPage();
  updateUI();
}
}

function goToLastPage() {
const totalPages = getTotalPages();
if (appState.currentPage !== totalPages) {
  appState.currentPage = totalPages;
  renderPage();
  updateUI();
}
}

function handlePageChange() {
let page = parseInt(pageInput.value);
const totalPages = getTotalPages();

if (isNaN(page)) page = 1;
if (page < 1) page = 1;
if (page > totalPages) page = totalPages;

appState.currentPage = page;
renderPage();
updateUI();
}

function handleBytesPerPageChange() {
appState.bytesPerPage = parseInt(bytesPerPage.value);
appState.currentPage = 1;
renderPage();
updateUI();
}

function handleGoToOffset() {
const offsetStr = offsetInput.value.trim();
let offset = 0;

try {
  // Try to parse as hexadecimal if starts with 0x
  if (offsetStr.startsWith('0x')) {
	offset = parseInt(offsetStr, 16);
  } else {
	offset = parseInt(offsetStr, 10);
  }
  
  // Validate offset
  if (isNaN(offset) || offset < 0 || offset >= appState.fileData.length) {
	throw new Error('Invalid offset');
  }
  
  // Calculate which page this offset is on
  const bytesPerPage = parseInt(appState.bytesPerPage);
  appState.currentPage = Math.floor(offset / bytesPerPage) + 1;
  
  renderPage();
  updateUI();
  showStatus(`Jumped to offset: 0x${offset.toString(16).padStart(8, '0')} (${offset})`);
} catch (error) {
  showStatus('Invalid offset format', true);
  alert('Invalid offset. Please enter a valid number (decimal or hexadecimal starting with 0x).');
}
}

// Helper functions
function getTotalPages() {
if (!appState.fileData) return 0;
const bytesPerPage = parseInt(appState.bytesPerPage);
return Math.ceil(appState.fileData.length / bytesPerPage);
}

function formatFileSize(bytes) {
if (bytes === 0) return '0 Bytes';

const k = 1024;
const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
const i = Math.floor(Math.log(bytes) / Math.log(k));

return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// UI Update functions
function updateUI() {
const hasFile = !!appState.file;
const hasData = !!appState.fileData;

// Show/hide elements based on state
fileInfo.classList.toggle('hidden', !hasFile);
navControls.classList.toggle('hidden', !hasData);
viewerContainer.classList.toggle('hidden', !hasData);
noFileMessage.classList.toggle('hidden', hasData);

// Update page controls
if (hasData) {
  const totalPages = getTotalPages();
  pageInput.value = appState.currentPage;
  pageCount.textContent = `of ${totalPages}`;
  
  // Enable/disable navigation buttons
  btnFirst.disabled = appState.currentPage === 1;
  btnPrev.disabled = appState.currentPage === 1;
  btnNext.disabled = appState.currentPage === totalPages;
  btnLast.disabled = appState.currentPage === totalPages;
  
  btnFirst.classList.toggle('opacity-50', appState.currentPage === 1);
  btnPrev.classList.toggle('opacity-50', appState.currentPage === 1);
  btnNext.classList.toggle('opacity-50', appState.currentPage === totalPages);
  btnLast.classList.toggle('opacity-50', appState.currentPage === totalPages);
}
}

function showLoading() {
loadingIndicator.classList.remove('hidden');
noFileMessage.classList.add('hidden');
viewerContainer.classList.add('hidden');
}

function hideLoading() {
loadingIndicator.classList.add('hidden');
}

function showStatus(message, isError = false) {
statusMessage.textContent = message;
statusMessage.className = isError ? 'text-danger' : 'text-gray-400';

// Reset status after 5 seconds
if (appState.statusTimeout) {
  clearTimeout(appState.statusTimeout);
}

appState.statusTimeout = setTimeout(() => {
  statusMessage.textContent = 'Ready';
  statusMessage.className = 'text-gray-400';
}, 5000);
}

// Initialize the application
init();