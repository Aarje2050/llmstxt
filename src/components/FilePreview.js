import React, { useState } from 'react';
import FileEditor from './FileEditor';
import FileActions from './FileActions';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';

function FilePreview({ 
  results, 
  activeUrl, 
  activeMdFile, 
  onUrlChange, 
  onMdFileChange,
  onUpdateLlmsTxt,
  onUpdateMdFile
}) {
  const [activeTab, setActiveTab] = useState('llms-txt');
  const [isEditing, setIsEditing] = useState(false);
  
  const result = results[activeUrl];
  
  // Handle errors
  if (result.status === 'error') {
    return (
      <div className="file-preview-container">
        <h2>Error</h2>
        <div className="alert alert-error">
          {result.error}
        </div>
      </div>
    );
  }
  
  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };
  
  const handleSaveContent = (content) => {
    if (activeTab === 'llms-txt') {
      // Clean any potential .md extensions before saving
      const cleanedContent = cleanMdExtensions(content);
      onUpdateLlmsTxt(activeUrl, cleanedContent);
    } else if (activeTab === 'md-files' && activeMdFile) {
      onUpdateMdFile(activeUrl, activeMdFile, content);
    }
    
    setIsEditing(false);
  };
  
  // Function to clean .md extensions from content if any are present
  const cleanMdExtensions = (content) => {
    // Simple regex to find and remove .md extensions in markdown links
    return content.replace(/\]\(([^)]+)\.md\)/g, ']($1)');
  };
  
  // Get current content based on active tab
  const getCurrentContent = () => {
    if (activeTab === 'llms-txt') {
      return result.llms_txt;
    } else if (activeTab === 'md-files' && activeMdFile) {
      return result.md_files[activeMdFile].content;
    }
    return '';
  };
  
  // Get current filename based on active tab
  const getCurrentFilename = () => {
    if (activeTab === 'llms-txt') {
      return 'LLMs.txt';
    } else if (activeTab === 'md-files' && activeMdFile) {
      return result.md_files[activeMdFile].filename;
    }
    return '';
  };

  return (
    <div className="file-preview-container">
      <h2>Results for {activeUrl}</h2>
      
      {/* URL selection dropdown if multiple URLs */}
      {Object.keys(results).length > 1 && (
        <div className="input-group">
          <label htmlFor="url-select">Select URL:</label>
          <select 
            id="url-select"
            value={activeUrl}
            onChange={(e) => onUrlChange(e.target.value)}
            className="select-input"
          >
            {Object.keys(results).map(url => (
              <option key={url} value={url}>
                {url}
              </option>
            ))}
          </select>
        </div>
      )}
      
      {/* Tab navigation */}
      <div className="tabs">
        <div 
          className={`tab ${activeTab === 'llms-txt' ? 'active' : ''}`}
          onClick={() => setActiveTab('llms-txt')}
        >
          LLMs.txt
        </div>
        <div 
          className="tab disabled"
          title="Markdown files coming soon"
        >
          Markdown Files <span className="coming-soon-badge">COMING SOON</span>
        </div>
        <div 
          className={`tab ${activeTab === 'discovered-urls' ? 'active' : ''}`}
          onClick={() => setActiveTab('discovered-urls')}
        >
          Discovered URLs <span className="url-count">{result.discovered_urls.length}</span>
        </div>
      </div>
      
      {/* Content area */}
      <div className="file-preview-content">
        {activeTab === 'llms-txt' && (
          <>
            <h3>LLMs.txt</h3>
            {isEditing ? (
              <FileEditor 
                content={result.llms_txt} 
                onSave={handleSaveContent}
                onCancel={() => setIsEditing(false)}
              />
            ) : (
              <>
                <SyntaxHighlighter language="markdown" style={docco}>
                  {cleanMdExtensions(result.llms_txt)}
                </SyntaxHighlighter>
                <FileActions 
                  content={cleanMdExtensions(result.llms_txt)}
                  filename="LLMs.txt"
                  onEdit={handleEditToggle}
                />
              </>
            )}
          </>
        )}
        
        {activeTab === 'discovered-urls' && (
          <>
            <h3>Discovered URLs</h3>
            <div className="file-content">
              <ul className="url-list">
                {result.discovered_urls.map((url, index) => (
                  <li key={index} className="url-list-item">{url}</li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default FilePreview;