import CodeMirror from '@uiw/react-codemirror';
import { xml } from '@codemirror/lang-xml';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView } from '@codemirror/view';
import "./svg-code.css"
import { Button, Dialog, DialogActions, DialogTitle, styled } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useEffect, useState } from 'react';
import { storageGet, storageSet } from '../../utils/localStorage';
import { STORAGE_NEED_TO_SHOW_SWITCH_DIALOG } from '../../utils/constants';

interface CodeEditorProps {
  value: string;
  files: any[];
  onChange: (value: string) => void;
  onError: (error: string | null) => void;
}

export interface IconModel {
  svgCode: string;
  svgName: string;
  selected: boolean;
}

export const CodeEditor = ({ value, onChange, onError, files }: CodeEditorProps) => {
  const [icons, setIcons] = useState<IconModel[]>([]);
  const [selectedIcon, setSelectedIcon] = useState<IconModel | null>(null);
  const [nextIcon, setNextIcon] = useState<IconModel | null>(null);
  const [codeWasChanged, setCodeWasChanged] = useState<boolean>(false);
  const [dialogOpened, setDialogOpened] = useState<boolean>(false);

  useEffect(() => {
    handleFileUpload(files)
  }, [files])

  const handleChange = (val: string) => {
    onChange(val);
    setCodeWasChanged(true);
  };

  const handleClickOpenDialog = () => {
    setDialogOpened(true);
  };

  const handleCloseDialog = () => {
    setDialogOpened(false);
  };

  // const [isChrome] = useState(isChromeExtension())
  
  // useEffect(() => {
  //   // Принимаем SVG-код от content script
  //   if (isChrome) {
  //     chrome.runtime.onMessage.addListener((message) => {
  //       if (message.action === 'sendSvgCode') {
  //         const svgs = message.svgCode;
  //           console.log('svg vode >> ', svgs);
  //           if (svgs?.length > 0) {
  //             const newIcons: IconModel[] = svgs.map((svgCode: string, idx: number) => {
  //               return {
  //                 svgCode,
  //                 svgName: `site_icon_${idx}`,
  //                 selected: false,
  //               }
  //             })
  //             setIcons(newIcons)
  //           }
  //       }
  //     });
  //   }
  // }, [isChrome])

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
  const handleFileUpload = async (event) => {
    const files = event;
    const newIcons: IconModel[] = [];
    let iconCount = 1;
    let firstIconSetted = false;

    for (const file of files) {
      if (file.name.endsWith('.svg')) {
        try {
          const svgContent = await readFileContent(file);
          newIcons.push({
            svgCode: svgContent,
            svgName: file.name ?? `icon_${iconCount}`,
            selected: false
          });
          iconCount++;
          if (!firstIconSetted) {
            firstIconSetted = true;
            clickIcon(newIcons[0])
          }
        } catch (error) {
          onError(`Ошибка при чтении ${file.name}:`)//todo: delete this sheet
          console.error(`Ошибка при чтении ${file.name}:`, error);
        }
      }
    }

    setIcons(newIcons);
  };

  // Чтение содержимого файла
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const readFileContent = (file: any): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      // @ts-ignore
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  };

  const switchToAnotherIcon = (icon: IconModel): void => {
    if (selectedIcon) {
      selectedIcon.selected = false;
    }
    icon.selected = true
    setSelectedIcon(icon)
    
    onChange(icon.svgCode)
    setCodeWasChanged(false)
  }
    
  const clickIcon = (icon: IconModel): void => {
    storageGet(STORAGE_NEED_TO_SHOW_SWITCH_DIALOG, (val) => {
      console.log('val >> ', val);
      
      if (codeWasChanged && val !== 'false') {
        setNextIcon(icon)
        handleClickOpenDialog()
      } else {
        switchToAnotherIcon(icon)
      }
    })
    
  }

  const stayCurrentIcon = () => {
    handleCloseDialog()
  }

  const switchAnyway = () => {
    if (nextIcon) {
      switchToAnotherIcon(nextIcon)
    }
    handleCloseDialog()
    storageSet(STORAGE_NEED_TO_SHOW_SWITCH_DIALOG, false)
  }

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
          Upload files
          <VisuallyHiddenInput
            accept=".svg"
            type="file"
            // @ts-ignore
            webkitdirectory="true"
            directory=""
            multiple
            onChange={(e) => handleFileUpload(e.target.files)}
          />
        </Button>
      </div>
      <div className="code-wrapper">
        {icons?.length > 1 && <div className='svgs'>
        {icons.map((icon, index) => (
          <div
            key={index}
            className={`icon-item  ${icon.selected ? 'selected' : ''}`}
            onClick={() => clickIcon(icon)}
          >
            <div
              className="icon-preview"
              dangerouslySetInnerHTML={{ __html: icon.svgCode }}
            />
            <div className="icon-label">{icon.svgName}</div>
          </div>
        ))}
        </div>}
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
      <Dialog
        open={dialogOpened}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Are you want to leave from current svg? Unsaved data will be removed"}
        </DialogTitle>
        <DialogActions>
          <Button type={"submit"} onClick={switchAnyway} autoFocus>
            Ok, don't show again
          </Button>
          <Button onClick={stayCurrentIcon}>Stay here</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}