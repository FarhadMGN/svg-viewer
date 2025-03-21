import CodeMirror from '@uiw/react-codemirror';
import { xml } from '@codemirror/lang-xml';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView } from '@codemirror/view';
import "./svg-code.css"
import { Button, styled } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DOMPurify from 'dompurify';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  onError: (error: string | null) => void;
}

export const CodeEditor = ({ value, onChange, onError }: CodeEditorProps) => {
  const handleChange = (val: string) => {
    onChange(val);
  };

  const customTheme = EditorView.theme({
    '&': {
      height: '100%',
      fontSize: '12px',
    },
    '.cm-scroller': {
      overflow: 'auto',
      fontFamily: 'monospace',
    },
    '.cm-content': {
      caretColor: 'white',
    },
    '.cm-line': {
      padding: '0 4px',
      lineHeight: '1.6',
    },
    '.cm-activeLineGutter': {
      backgroundColor: 'rgba(66, 133, 244, 0.1)',// todo change color
    },
    '.cm-gutters': {
      backgroundColor: '#0d1117',
      color: '#636e7b',// todo change color
      border: 'none',
    },
  });

  const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
  });

  // @ts-ignore
  const handleFileUpload = (event) => {
    try {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
  // @ts-ignore
          const svgContent = e.target.result;
  // @ts-ignore
          const sanitizedSvg = DOMPurify.sanitize(svgContent, {
            USE_PROFILES: { svg: true },
            FORBID_TAGS: ['script'],
            FORBID_ATTR: ['onerror', 'onload'],
          });

          const parser = new DOMParser();
          const svgDoc = parser.parseFromString(sanitizedSvg, 'image/svg+xml');
          const parseError = svgDoc.querySelector('parsererror');
          if (parseError) {
            console.error('Ошибка в SVG:', parseError.textContent);
            onError(parseError.textContent);
            handleChange(sanitizedSvg)
          } else {
            handleChange(sanitizedSvg);
          }
        };
        reader.readAsText(file);
      } else {
        throw new Error('No file selected');
      }
    } catch (e) {
      onError(e instanceof Error ? e.message : "Can not parse svg file");
    }
  };

  return (
    <div className='code-area'>
      <div className='code-header'>
        <h2>SVG Code</h2>
        <Button
          component="label"
          role={undefined}
          variant="outlined"
          tabIndex={-1}
          startIcon={<CloudUploadIcon />}
        >
          Upload .svg file
          <VisuallyHiddenInput
            accept=".svg"
            type="file"
            onChange={handleFileUpload}
            multiple
          />
        </Button>
      </div>
      <div className="code-wrapper">
        <CodeMirror
          value={value}
          height="100%"
          width="100%"
          theme={oneDark}
          extensions={[
            xml(), 
            customTheme,
            EditorView.lineWrapping,
          ]}
          onChange={handleChange}
          basicSetup={{
            foldGutter: true,
            highlightActiveLineGutter: true,
            dropCursor: true,
            lineNumbers: true,
            highlightActiveLine: true,
            highlightSelectionMatches: true,
            autocompletion: true,
            allowMultipleSelections: true,
            indentOnInput: true,
            syntaxHighlighting: true,
            bracketMatching: true,
            closeBrackets: true,
            rectangularSelection: true,
          }}
          placeholder="Paste SVG code here, upload file via button or drop .svg file here"
        />
      </div>
    </div>
  );
}