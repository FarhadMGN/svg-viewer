
import { useEffect, useState } from 'react'
import './App.css'
import { CodeEditor } from './components/code-area/svg-code'
import { PreviewArea } from './components/preview-area/preview-area'
import { SVG_STUB } from './utils/constants'
import RatingWidget from './components/rating/rating-widget'
import { createTheme, ThemeProvider } from '@mui/material'
import SvgInspectorButton from './components/svg-picker/svg-picker'
import { isChromeExtension } from './utils/utils'

function App() {
  const [value, setValue] = useState(SVG_STUB)
  const [error, setError] = useState<string | null>(null)
  const [isChrome] = useState(isChromeExtension())
  const updateCode = (code: string) => {
    setError(null);
    setValue(code);
  }

  useEffect(() => {
    // Принимаем SVG-код от content script
    if (isChrome) {
      chrome.runtime.onMessage.addListener((message) => {
        if (message.action === 'sendSvgCode') {
          console.log('svg vode >> ', message.svgCode);
          updateCode(message.svgCode);
        }
      });
    }
  }, [isChrome])

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

  return (
    <ThemeProvider theme={theme}>
    <div className='app-wrapper'>
      {isChrome && <SvgInspectorButton />}
      <div className='app-content'>
        <CodeEditor 
          value={value} 
          onChange={(value: string): void => {updateCode(value)}}
          onError={(error: string | null): void => {setError(error)}}></CodeEditor>
        <PreviewArea code={value} errorString={error}/>
      </div>

      <RatingWidget/>
    </div>
    </ThemeProvider>
  )
}

export default App
