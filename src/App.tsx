
import { useState } from 'react'
import './App.css'
import { CodeEditor } from './components/code-area/svg-code'
import { PreviewArea } from './components/preview-area/preview-area'
import { SVG_STUB } from './utils/constants'
import RatingWidget from './components/rating/rating-widget'
import { createTheme, ThemeProvider } from '@mui/material'
import en from './assets/locales/en.json'
// import SvgInspectorButton from './components/svg-picker/svg-picker'
// import { isChromeExtension } from './utils/utils'

function App() {
  const [value, setValue] = useState(SVG_STUB)
  const [error, setError] = useState<string | null>(null)
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<any[]>([]);


  // const [isChrome] = useState(isChromeExtension())
  const updateCode = (code: string) => {
    setError(null);
    setValue(code);
    setPos({ x: 200, y: 200 })
  }

  const theme = createTheme({
    palette: {
      primary: {
        main: '#282c34',
      },
      secondary: {
        main: '#282c34',
      },
    },
  });

  const handleDrag = (e) => {
    console.log('handle drag');
    
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    console.log('handle drop');
    
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFiles(e.dataTransfer.files);
    }
    setDragActive(false);
  };

  return (
    <ThemeProvider theme={theme}>
      {dragActive && (
        <div
          className="overlay"
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="overlay-text">{en.dragNDrop}</div>
        </div>
      )}
      <div className='app-wrapper'
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        >
        {/* {isChrome && <SvgInspectorButton />} */}
        <div className='app-content'>
          <CodeEditor 
            value={value}
            files={files}
            onChange={(value: string): void => {updateCode(value)}}
            onError={(error: string | null): void => {setError(error)}}></CodeEditor>
          <PreviewArea code={value} errorString={error} pos={pos} />
        </div>

        <RatingWidget/>
      </div>
    </ThemeProvider>
  )
}

export default App
