
import { useState } from 'react'
import './App.css'
import { CodeEditor } from './components/code-area/svg-code'
import { PreviewArea } from './components/preview-area/preview-area'
import { SVG_STUB } from './utils/constants'
import RatingWidget from './components/rating/rating-widget'
import { createTheme, ThemeProvider } from '@mui/material'

function App() {
  const [value, setValue] = useState(SVG_STUB)
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
      <div className='app-content'>
        <CodeEditor value={value} onChange={(value: string): void => {
            // throw new Error('Function not implemented.')
            setValue(value)
          } }></CodeEditor>
        <PreviewArea code={value}/>
      </div>

      <RatingWidget/>
    </div>
    </ThemeProvider>
  )
}

export default App
