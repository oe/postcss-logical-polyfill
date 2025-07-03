import React, { useState, useEffect } from 'react';
import Editor from '../components/Editor';
import postcss from 'postcss';
import postcssLogicalPolyfill from '../../../src/index';
import './playground-app.css';

const DEFAULT_CSS = `.container {\n  margin-inline: 1rem;\n  padding-block: 2rem;\n  border-inline-start: 2px solid blue;\n  float: inline-start;\n}\n\n.scroll-area {\n  scroll-margin-inline: 10px;\n  scroll-padding-block: 5px;\n}\n\n.gradient-example {\n  background: linear-gradient(to inline-end, red, blue);\n  padding: 1rem;\n  margin-block: 1rem;\n}\n\n.complex-layout {\n  margin-inline-start: 2rem;\n  padding-inline-end: 1rem;\n  border-inline: 1px solid #ccc;\n  text-align: start;\n}`;

export default function PlaygroundApp() {
  const [input, setInput] = useState(DEFAULT_CSS);
  const [output, setOutput] = useState('');
  const [outputOrder, setOutputOrder] = useState('ltr-first');
  const [ltrSelector, setLtrSelector] = useState('[dir="ltr"]');
  const [rtlSelector, setRtlSelector] = useState('[dir="rtl"]');
  const [error, setError] = useState('');

  useEffect(() => {
    async function transform() {
      try {
        const result = await postcss([
          postcssLogicalPolyfill({
            ltr: { selector: ltrSelector },
            rtl: { selector: rtlSelector },
            // @ts-expect-error ignore outputOrder type
            outputOrder
          })
        ]).process(input, { from: undefined });
        setOutput(result.css);
        // 更新 live preview
        let styleElement = document.getElementById('preview-styles');
        if (!styleElement) {
          styleElement = document.createElement('style');
          styleElement.id = 'preview-styles';
          document.head.appendChild(styleElement);
        }
        styleElement.textContent = result.css;
        setError('');
      } catch (e: any) {
        setOutput(`/* Error: ${e.message || 'Unknown error'} */`);
        setError(e.message || 'Unknown error');
      }
    }
    transform();
  }, [input, outputOrder, ltrSelector, rtlSelector]);

  function resetToExample() {
    setInput(DEFAULT_CSS);
  }

  return (
    <div className="playground-root" style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
      <h2 style={{ marginBottom: 16 }}>CSS Logical Properties Playground</h2>
      <div className="playground-config" style={{ display: 'flex', gap: 24, marginBottom: 24 }}>
        <div style={{ flex: 1, minWidth: 260 }}>
          <h4 style={{ margin: 0, fontWeight: 600 }}>Plugin Configuration</h4>
          <div className="config-grid" style={{ display: 'flex', gap: 16, marginTop: 12 }}>
            <div className="config-group" style={{ flex: 1 }}>
              <label htmlFor="output-order">Output Order:</label>
              <select id="output-order" value={outputOrder} onChange={e => setOutputOrder(e.target.value)} style={{ width: '100%' }}>
                <option value="ltr-first">LTR First</option>
                <option value="rtl-first">RTL First</option>
              </select>
            </div>
            <div className="config-group" style={{ flex: 1 }}>
              <label htmlFor="ltr-selector">LTR Selector:</label>
              <input type="text" id="ltr-selector" value={ltrSelector} onChange={e => setLtrSelector(e.target.value)} placeholder='[dir="ltr"]' style={{ width: '100%' }} />
            </div>
            <div className="config-group" style={{ flex: 1 }}>
              <label htmlFor="rtl-selector">RTL Selector:</label>
              <input type="text" id="rtl-selector" value={rtlSelector} onChange={e => setRtlSelector(e.target.value)} placeholder='[dir="rtl"]' style={{ width: '100%' }} />
            </div>
          </div>
        </div>
        <div style={{ alignSelf: 'flex-end' }}>
          <button id="reset-btn" className="btn-secondary" type="button" onClick={resetToExample}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 12a8 8 0 0 1 8-8V2.5L16 6l-4 3.5V8a6 6 0 1 0 6 6h1.5a7.5 7.5 0 1 1-15.5 0z"/>
            </svg>
            Reset to Example
          </button>
        </div>
      </div>
      <div className="playground-editors" style={{ display: 'flex', gap: 24, marginBottom: 24 }}>
        <div className="editor-panel" style={{ flex: 1, minWidth: 320 }}>
          <div className="editor-header" style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
            <h4 style={{ margin: 0, fontWeight: 500, fontSize: 16 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ verticalAlign: 'middle' }}>
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
              </svg>
              Input CSS
            </h4>
          </div>
          <Editor value={input} onChange={setInput} style={{ minHeight: 220 }} />
        </div>
        <div className="editor-panel" style={{ flex: 1, minWidth: 320 }}>
          <div className="editor-header" style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
            <h4 style={{ margin: 0, fontWeight: 500, fontSize: 16 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ verticalAlign: 'middle' }}>
                <path d="M19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M19,19H5V5H19V19Z"/>
              </svg>
              Output CSS
            </h4>
          </div>
          <Editor value={output} readOnly style={{ minHeight: 220 }} />
        </div>
      </div>
      <div className="playground-preview" style={{ background: '#f8fafc', borderRadius: 8, padding: 24, marginBottom: 24 }}>
        <div className="preview-header" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <h4 style={{ margin: 0, fontWeight: 500, fontSize: 16 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ verticalAlign: 'middle' }}>
              <path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z"/>
            </svg>
            Live Preview
          </h4>
          <div className="preview-controls" style={{ marginLeft: 24 }}>
            <label className="radio-label" style={{ marginRight: 12 }}>
              <input type="radio" name="preview-direction" value="ltr" defaultChecked onChange={() => {
                const previewContainer = document.getElementById('preview-container');
                if (previewContainer) previewContainer.setAttribute('dir', 'ltr');
              }} />
              <span>LTR</span>
            </label>
            <label className="radio-label">
              <input type="radio" name="preview-direction" value="rtl" onChange={() => {
                const previewContainer = document.getElementById('preview-container');
                if (previewContainer) previewContainer.setAttribute('dir', 'rtl');
              }} />
              <span>RTL</span>
            </label>
          </div>
        </div>
        <div id="preview-container" dir="ltr" style={{ background: '#fff', borderRadius: 6, padding: 24, minHeight: 80 }}>
          <div className="preview-element">
            <h5 style={{ margin: 0, fontWeight: 500 }}>Preview Element</h5>
            <p style={{ margin: '8px 0 12px 0', color: '#666' }}>This element demonstrates how the CSS logical properties work. Try changing the direction to see the RTL/LTR behavior.</p>
            <div className="nested-element">
              <span>Nested Content</span>
            </div>
          </div>
        </div>
      </div>
      {error && (
        <div id="error-display" className="error-display" style={{ marginTop: 16 }}>
          <div className="error-content" style={{ color: '#b91c1c', display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,2C17.53,2 22,6.47 22,12C22,17.53 17.53,22 12,22C6.47,22 2,17.53 2,12C2,6.47 6.47,2 12,2M15.59,7L12,10.59L8.41,7L7,8.41L10.59,12L7,15.59L8.41,17L12,13.41L15.59,17L17,15.59L13.41,12L17,8.41L15.59,7Z"/>
            </svg>
            <span id="error-message">{error}</span>
          </div>
        </div>
      )}
    </div>
  );
}
