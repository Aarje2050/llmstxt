import React, { useState } from 'react';

function FileEditor({ content, onSave, onCancel }) {
  const [editedContent, setEditedContent] = useState(content);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(editedContent);
  };
  
  return (
    <div className="file-editor">
      <form onSubmit={handleSubmit}>
        <textarea 
          value={editedContent}
          onChange={(e) => setEditedContent(e.target.value)}
        />
        
        <div className="file-actions">
          <button type="submit" className="btn" style={{ backgroundColor: '#10b981' }}>
            Save Changes
          </button>
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default FileEditor;