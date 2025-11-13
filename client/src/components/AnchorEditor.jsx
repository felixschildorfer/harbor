import React, { useState } from 'react';
import '../styles/AnchorEditor.css';

/**
 * AnchorEditor Component
 * Embeds Anchor XML editor functionality directly into Harbor
 * Allows users to view, edit, and manage Anchor Model XML files
 */
const AnchorEditor = ({ xmlContent, onSave, onClose }) => {
  const [editorContent, setEditorContent] = useState(xmlContent || '');
  const [activeTab, setActiveTab] = useState('editor'); // 'editor' or 'preview'
  const [isSaving, setIsSaving] = useState(false);


  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(editorContent);
      // Toast or notification could go here
    } catch (error) {
      console.error('Error saving XML:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFormatXML = () => {
    try {
      // Pretty-print XML
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(editorContent, 'text/xml');
      
      if (xmlDoc.parseError.errorCode !== 0) {
        alert('Invalid XML: ' + xmlDoc.parseError.reason);
        return;
      }

      const formatted = formatXML(xmlDoc.documentElement);
      setEditorContent(formatted);
    } catch (error) {
      alert('Error formatting XML: ' + error.message);
    }
  };

  const handleValidateXML = () => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(editorContent, 'text/xml');
    
    if (xmlDoc.parseError.errorCode !== 0) {
      alert('❌ XML Error: ' + xmlDoc.parseError.reason);
    } else {
      alert('✅ XML is valid!');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(editorContent);
    alert('XML copied to clipboard');
  };

  return (
    <div className="anchor-editor-modal-overlay" onClick={onClose}>
      <div className="anchor-editor-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="anchor-editor-header">
          <h2>Anchor XML Editor</h2>
          <button 
            className="anchor-editor-close-btn"
            onClick={onClose}
            title="Close editor"
          >
            ✕
          </button>
        </div>

        {/* Toolbar */}
        <div className="anchor-editor-toolbar">
          <div className="anchor-editor-tabs">
            <button
              className={`anchor-editor-tab ${activeTab === 'editor' ? 'active' : ''}`}
              onClick={() => setActiveTab('editor')}
            >
              Editor
            </button>
            <button
              className={`anchor-editor-tab ${activeTab === 'preview' ? 'active' : ''}`}
              onClick={() => setActiveTab('preview')}
            >
              Preview
            </button>
          </div>
          
          <div className="anchor-editor-actions">
            <button 
              onClick={handleValidateXML}
              className="anchor-editor-btn anchor-editor-btn-secondary"
              title="Validate XML syntax"
            >
              ✓ Validate
            </button>
            <button 
              onClick={handleFormatXML}
              className="anchor-editor-btn anchor-editor-btn-secondary"
              title="Format and pretty-print XML"
            >
              ≡ Format
            </button>
            <button 
              onClick={handleCopy}
              className="anchor-editor-btn anchor-editor-btn-secondary"
              title="Copy XML to clipboard"
            >
              📋 Copy
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="anchor-editor-btn anchor-editor-btn-primary"
              title="Save changes"
            >
              {isSaving ? '💾 Saving...' : '💾 Save'}
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="anchor-editor-body">
          {activeTab === 'editor' ? (
            <textarea
              value={editorContent}
              onChange={(e) => setEditorContent(e.target.value)}
              className="anchor-editor-textarea"
              placeholder="Paste or edit Anchor Model XML here..."
              spellCheck="false"
            />
          ) : (
            <div className="anchor-editor-preview">
              <XMLPreview xmlContent={editorContent} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="anchor-editor-footer">
          <span className="anchor-editor-info">
            {editorContent.length} characters
          </span>
        </div>
      </div>
    </div>
  );
};

/**
 * XMLPreview Component
 * Renders a tree view of the XML structure
 */
const XMLPreview = ({ xmlContent }) => {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');

    if (xmlDoc.parseError.errorCode !== 0) {
      return (
        <div className="anchor-editor-error">
          <p>❌ Invalid XML</p>
          <p>{xmlDoc.parseError.reason}</p>
        </div>
      );
    }

    return (
      <div className="anchor-editor-tree">
        <XMLNode node={xmlDoc.documentElement} />
      </div>
    );
  } catch (error) {
    return (
      <div className="anchor-editor-error">
        <p>Error parsing XML: {error.message}</p>
      </div>
    );
  }
};

/**
 * XMLNode Component
 * Recursively renders XML tree structure
 */
const XMLNode = ({ node }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (node.nodeType === 3) { // Text node
    const text = node.textContent.trim();
    return text ? <span className="anchor-editor-text">{text}</span> : null;
  }

  if (node.nodeType !== 1) return null; // Only elements

  const hasChildren = node.childNodes.length > 0 && 
    Array.from(node.childNodes).some(n => n.nodeType === 1 || (n.nodeType === 3 && n.textContent.trim()));

  return (
    <div className="anchor-editor-node">
      <div 
        className="anchor-editor-node-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {hasChildren && (
          <span className="anchor-editor-expander">
            {isExpanded ? '▼' : '▶'}
          </span>
        )}
        {!hasChildren && <span className="anchor-editor-expander-placeholder" />}
        
        <span className="anchor-editor-tag">
          &lt;{node.nodeName}
          {Array.from(node.attributes).map(attr => (
            <span key={attr.name}>
              {' '}<span className="anchor-editor-attr-name">{attr.name}</span>=
              <span className="anchor-editor-attr-value">"{attr.value}"</span>
            </span>
          ))}
          {!hasChildren ? ' /' : ''}
          &gt;
        </span>
      </div>

      {hasChildren && isExpanded && (
        <div className="anchor-editor-children">
          {Array.from(node.childNodes).map((child, idx) => (
            <XMLNode key={idx} node={child} />
          ))}
        </div>
      )}

      {hasChildren && isExpanded && (
        <div className="anchor-editor-closing-tag">
          &lt;/{node.nodeName}&gt;
        </div>
      )}
    </div>
  );
};

/**
 * formatXML utility function
 * Pretty-prints XML with proper indentation
 */
function formatXML(node, indent = 0) {
  const tab = '  ';
  let result = '';

  const processNode = (n, level) => {
    if (n.nodeType === 1) { // Element
      const spaces = tab.repeat(level);
      let tagStr = `${spaces}<${n.nodeName}`;

      // Add attributes
      for (let i = 0; i < n.attributes.length; i++) {
        const attr = n.attributes[i];
        tagStr += ` ${attr.name}="${attr.value}"`;
      }

      // Check if has element children
      const hasElementChildren = Array.from(n.childNodes).some(c => c.nodeType === 1);
      const hasTextContent = Array.from(n.childNodes)
        .some(c => c.nodeType === 3 && c.textContent.trim());

      if (!hasElementChildren && !hasTextContent) {
        tagStr += ' />\n';
      } else if (!hasElementChildren && hasTextContent) {
        tagStr += '>';
        tagStr += n.textContent;
        tagStr += `</${n.nodeName}>\n`;
      } else {
        tagStr += '>\n';
        for (let i = 0; i < n.childNodes.length; i++) {
          tagStr += processNode(n.childNodes[i], level + 1);
        }
        tagStr += `${spaces}</${n.nodeName}>\n`;
      }

      return tagStr;
    }
    return '';
  };

  return processNode(node, 0);
}

export default AnchorEditor;
