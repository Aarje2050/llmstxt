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
      onUpdateLlmsTxt(activeUrl, content);
    } else if (activeTab === 'md-files' && activeMdFile) {
      onUpdateMdFile(activeUrl, activeMdFile, content);
    }
    
    setIsEditing(false);
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
          className={`tab ${activeTab === 'md-files' ? 'active' : ''}`}
          onClick={() => setActiveTab('md-files')}
        >
          Markdown Files
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
                <SyntaxHighlighter language="text" style={docco}>
                  {result.llms_txt}
                </SyntaxHighlighter>
                <FileActions 
                  content={result.llms_txt}
                  filename="LLMs.txt"
                  onEdit={handleEditToggle}
                />
              </>
            )}
          </>
        )}
        
        {activeTab === 'md-files' && (
          <>
            <h3>Markdown Files</h3>
            
            {/* File selection */}
            <div className="input-group">
              <label htmlFor="md-file-select">Select File:</label>
              <select 
                id="md-file-select"
                value={activeMdFile || ''}
                onChange={(e) => onMdFileChange(e.target.value)}
                className="select-input"
              >
                {Object.keys(result.md_files).map(url => (
                  <option key={url} value={url}>
                    {result.md_files[url].filename}
                  </option>
                ))}
              </select>
            </div>
            
            {activeMdFile && (
              <>
                {isEditing ? (
                  <FileEditor 
                    content={result.md_files[activeMdFile].content} 
                    onSave={handleSaveContent}
                    onCancel={() => setIsEditing(false)}
                  />
                ) : (
                  <>
                    <SyntaxHighlighter language="markdown" style={docco}>
                      {result.md_files[activeMdFile].content}
                    </SyntaxHighlighter>
                    <FileActions 
                      content={result.md_files[activeMdFile].content}
                      filename={result.md_files[activeMdFile].filename}
                      onEdit={handleEditToggle}
                    />
                  </>
                )}
              </>
            )}
          </>
        )}
        
        {activeTab === 'discovered-urls' && (
          <>
            <h3>Discovered URLs</h3>
            <div className="file-content">
              <ul>
                {result.discovered_urls.map((url, index) => (
                  <li key={index}>{url}</li>
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