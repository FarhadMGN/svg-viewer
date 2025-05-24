import { useEffect, useRef, useState } from "react";
import './preview-area.css'
import SvgDownloader from "../svg-downloader/svg-downloader";
import { IconButton, Slider, Snackbar, SnackbarCloseReason, Tooltip } from "@mui/material";
import { ContentCopy, Close, Menu, Colorize, Fullscreen, FullscreenExit } from "@mui/icons-material";
import en from '../../assets/locales/en.json'


interface PreviewAreaProps {
    code: string;
    errorString: string | null;
    pos: { x: number, y: number };
    downloadCB?: () => void;
  }

export const PreviewArea = ({code, errorString, pos, downloadCB}: PreviewAreaProps) => {  
    const containerRef = useRef<HTMLDivElement>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showNotification, setShowNotification] = useState(false)
    
    const [position, setPosition] = useState(pos);
    const [isDragging, setIsDragging] = useState(false);
    const [startPos, setStartPos] = useState(pos);
    const [color, setColor] = useState('#C9CFD4');
    const [zoom, setZoom] = useState(100);
    const [isFullScreen, setFullScreen] = useState(false);

    const inputRef = useRef(null);

    const handleIconClick = () => {
      if (inputRef.current) {
        // @ts-ignore
        inputRef.current.click(); // Программно вызываем клик на скрытом input
      }
    };

    useEffect(() => {
      setError(errorString);
    }, [errorString]);

    useEffect(() => {
      setPosition(pos);
      setStartPos(pos);
      setZoom(100);
    }, [pos]);
  
    useEffect(() => {
      if (!containerRef.current) return;
      
      containerRef.current.innerHTML = '';
      setError(null);
      
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(code, 'image/svg+xml');
        const parserError = doc.querySelector('parsererror');
        if (parserError) {
          setError((parserError.textContent || 'SVG parsing error'));
          return;
        }
  
        // Если SVG валиден, извлекаем корневой элемент
        const tempSvg = doc.documentElement;
        if (tempSvg.tagName.toLowerCase() !== 'svg') {
          setError('Root element is not <svg>');// todo: work with  setError, correct error messages
          return;
        }
  
        // Создаём новый элемент <svg> с правильным пространством имён
        const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  
        // Копируем атрибуты из распарсенного SVG
        for (const attr of tempSvg.attributes) {
          svgElement.setAttribute(attr.name, attr.value);
        }
  
        // Переносим содержимое (например, <path>) в новый элемент
        svgElement.innerHTML = tempSvg.innerHTML;
  
        // Применяем стили
        svgElement.style.transform = `scale(${zoom / 100})`;
        svgElement.style.transformOrigin = 'center';
        svgElement.style.left = `${position.x}px`;
        svgElement.style.top = `${position.y}px`;
        svgElement.style.position = 'relative';
        svgElement.style.transition = 'transform 0.2s ease-out';
        // svgElement.style.filter = 'drop-shadow(0px 2px 8px rgba(0, 0, 0, 0.1))';
        svgElement.style.maxWidth = 'none';
        svgElement.style.maxHeight = 'none';
  
        // Вставляем элемент в контейнер
        containerRef.current.appendChild(svgElement);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Oops, something went wrong');
      }
    }, [code, position, zoom]);
  
    const handleMouseDown = (e: React.MouseEvent) => {
      setIsDragging(true);
      setStartPos({ x: e.clientX - position.x, y: e.clientY - position.y });
    };
  
    const handleMouseMove = (e: React.MouseEvent) => {
      if (!isDragging) return;
      setPosition({
        x: e.clientX - startPos.x,
        y: e.clientY - startPos.y
      });
    };
  
    const handleMouseUp = () => {
      setIsDragging(false);
    };


    const handleCopy = () => {
      setShowNotification(true)
      navigator.clipboard.writeText(code);
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleChange = (_e: Event, value: number | number[], _active: number) => {
      if (Array.isArray(value)) return
      setZoom(value)
    }

    const handleCloseNotification = (
      _?: React.SyntheticEvent | Event,
      reason?: SnackbarCloseReason,
    ) => {
      if (reason === 'clickaway') {
        return;
      }
  
      setShowNotification(false);
    };
  
    return (
        <div className="preview-wrapper">
          <Snackbar
            open={showNotification}
            autoHideDuration={2000}
            onClose={handleCloseNotification}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            message={en.previewArea.notification}
          />
            <div className="preview-header">
                <h2>{en.previewArea.title}</h2>
                <div className="sidebar-actions">
                      <Tooltip title={en.previewArea.copyTooltip}>
                      {/* todo remove outline */}
                        <IconButton onClick={handleCopy} aria-label="fingerprint" color="secondary">
                          <ContentCopy fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <SvgDownloader svgContent={code} error={error} downloadCB={downloadCB}/>
                    </div>
            </div>
              <div className={isFullScreen ? "preview-content-full" : "preview-content"}
                style={{ 
                    background: error ? 'rgba(239, 68, 68, 0.1)' : color,
                    display: error ? 'none' : 'block',
                }}
              >
                <div 
                    ref={containerRef} 
                    className="preview-icon"
                    style={{ 
                        display: 'block',
                        position: 'relative',
                        touchAction: 'none',
                        cursor: isDragging ? 'grabbing' : 'grab'
                    }}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseDown={handleMouseDown}
                    onMouseLeave={handleMouseUp}
                ></div>
                <div className="hamburger">
                  <IconButton onClick={() => setIsSidebarOpen(true)} >
                    <Menu fontSize="small" />
                  </IconButton>
                </div>

                {/* sidebar */}
                <div
                  className="sidebar"
                  style={{
                    transform: isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)', // Логика показа/скрытия
                  }}
                >
                  <div className="preview-close">
                    <IconButton onClick={() => setIsSidebarOpen(false)} >
                      <Close fontSize="small" />
                    </IconButton>
                  </div>
                  <div className="preview-buttons">
                    <div>
                      <div>{en.previewArea.sideMenu.zoom}</div>
                        <Slider
                          style={{
                            width: '100%'
                          }}
                          aria-label="Zoom"
                          value={zoom}
                          onChange={handleChange}
                          valueLabelDisplay="auto"
                          min={10}
                          max={300}
                        />
                    </div>
                    <div>
                      <div>{en.previewArea.sideMenu.changeBG}</div>
                        <input
                          type="color"
                          ref={inputRef}
                          value={color}
                          onChange={(event) => setColor(event.target.value)}
                          style={{ 
                            opacity: 0,
                            width: 0,
                            padding: 0
                          }}
                        />
                        <IconButton onClick={handleIconClick}>
                          <Colorize />
                        </IconButton>
                      </div>
                  </div>
                </div>
                <div className="sidebar-fullscreen">
                      <Tooltip title={isFullScreen ? en.previewArea.exitFS : en.previewArea.enterFS}>
                        <IconButton onClick={() => setFullScreen(!isFullScreen)} >
                          {isFullScreen ? 
                            <FullscreenExit/>: 
                            <Fullscreen/>
                          }
                        </IconButton>
                      </Tooltip>
                    </div>
              </div>
            {error && (<div className="preview-error">
                <div className="svg-error">
                    <p>{en.previewArea.errorTitle}</p>
                    <div>{error}</div>
                </div>
              </div>
            )}
      </div>
    );
};
