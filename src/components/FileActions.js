import React from 'react';
import { toast } from 'react-toastify';

function FileActions({ content, filename, onEdit }) {
  const handleCopy = () => {
    navigator.clipboard.writeText(content)
      .then(() => {
        toast.success('Content copied to clipboard!');
      })
      .catch((err) => {
        console.error('Failed to copy:', err);
        toast.error('Failed to copy content. Please try again.');
      });
  };
  
  const handleDownload = () => {
    // Create a blob from the content
    const blob = new Blob([content], { type: 'text/plain' });
    
    // Create a URL for the blob
    const url = URL.createObjectURL(blob);
    
    // Create a temporary anchor element
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    
    // Append to the document, click it, and remove it
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Release the blob URL
    URL.revokeObjectURL(url);
    
    toast.success(`${filename} downloaded successfully!`);
  };

  return (
    <div className="file-actions">
      <button 
        className="btn" 
        onClick={handleCopy}
        style={{ backgroundColor: '#0171ce' }}
      >
        Copy to Clipboard
      </button>
      
      <button 
        className="btn btn-secondary"
        onClick={handleDownload}
      >
        Download File
      </button>
      
      <button 
        className="btn btn-secondary"
        onClick={onEdit}
      >
        Edit Content
      </button>
    </div>
  );
}

export default FileActions;