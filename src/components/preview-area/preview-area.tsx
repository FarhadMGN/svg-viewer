import { useEffect, useRef, useState } from "react";
import './preview-area.css'
import SvgDownloader from "../svg-downloader/svg-downloader";
import { IconButton, Slider, Tooltip } from "@mui/material";
import { ContentCopy, Close, Menu, Colorize, Fullscreen, FullscreenExit } from "@mui/icons-material";
import useToolTipCopyText from "../hooks/copyTooltip.hook";


interface PreviewAreaProps {
    code: string;
    errorString: string | null;
  }

export const PreviewArea = ({code, errorString}: PreviewAreaProps) => {  
    const containerRef = useRef<HTMLDivElement>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const [text, changeText] = useToolTipCopyText();
    const [color, setColor] = useState('#C9CFD4');
    const [zoom, setZoom] = useState(100);
    const [isFullScreen, setFullScreen] = useState(false);

    const inputRef = useRef(null);

    const handleIconClick = () => {
      if (inputRef.current) {
        inputRef.current.click(); // Программно вызываем клик на скрытом input
      }
    };

    useEffect(() => {
      setError(errorString);
    }, [errorString]);
  
    useEffect(() => {
      if (!containerRef.current) return;
      
      containerRef.current.innerHTML = '';
      setError(null);
      
      try {
        // parsing
        const parser = new DOMParser();
        const doc = parser.parseFromString(code, 'image/svg+xml');
        
        const parserError = doc.querySelector('parsererror');
        if (parserError) {
          setError(parserError.textContent || 'SVG parsing error');
          return;
        }
        
        const svgElement = doc.documentElement;
        
        // transitions styles
        svgElement.style.transform = `scale(${zoom / 100}) translate(${position.x}px, ${position.y}px)`;
        svgElement.style.transformOrigin = 'center';
        svgElement.style.transition = 'transform 0.2s ease-out';
        
        // svgElement.style.filter = 'drop-shadow(0px 2px 8px rgba(0, 0, 0, 0.1))';
        
        svgElement.style.maxWidth = 'none';
        svgElement.style.maxHeight = 'none';
        
        containerRef.current.appendChild(svgElement);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Unknown error');
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
  
    const handleTouchStart = (e: React.TouchEvent) => {
      if (e.touches.length === 1) {
        setIsDragging(true);
        setStartPos({ 
          x: e.touches[0].clientX - position.x, 
          y: e.touches[0].clientY - position.y 
        });
      }
    };
  
    const handleTouchMove = (e: React.TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return;
      e.preventDefault();
      setPosition({
        x: e.touches[0].clientX - startPos.x,
        y: e.touches[0].clientY - startPos.y
      });
    };
  
    const handleTouchEnd = () => {
      setIsDragging(false);
    };

    const handleCopy = () => {
      navigator.clipboard.writeText(code);
      changeText();
    };

    const handleChange = (_e: Event, value: number, _active: number) => {
      setZoom(value)
    }
  
    return (
        <div className="preview-wrapper">
            <div className="preview-header">
                <h2>SVG Preview</h2>
                <div className="sidebar-actions">
                      <Tooltip title={text}>
                      {/* todo remove outline */}
                        <IconButton onClick={handleCopy} >
                          <ContentCopy fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <SvgDownloader svgContent={code} error={error}/>
                    </div>
            </div>
            {(
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
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                ></div>
                <div className="hamburger">
                  <IconButton onClick={() => setIsSidebarOpen(true)} >
                    <Menu fontSize="small" />
                  </IconButton>
                </div>

                {/* Сайдбар */}
                <div
                  className="sidebar"
                  style={{
                    transform: isSidebarOpen ? 'translateX(0)' : 'translateX(100%)', // Логика показа/скрытия
                  }}
                >
                  <div className="preview-close">
                    <IconButton onClick={() => setIsSidebarOpen(false)} >
                      <Close fontSize="small" />
                    </IconButton>
                  </div>
                  <div className="preview-buttons">
                    <div>
                      <div>Zoom:</div>
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
                      <div>Change background:</div>
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
                    
                    <div className="sidebar-fullscreen">
                      <Tooltip title={isFullScreen ? 'Exit fullscreen' :'Go to fullscreen'}>
                        <IconButton onClick={() => setFullScreen(!isFullScreen)} >
                          {isFullScreen ? 
                            <FullscreenExit/>: 
                            <Fullscreen/>
                          }
                        </IconButton>
                      </Tooltip>
                    </div>
                        
                  </div>
                </div>
              </div>
            )}
            {error && (<div className="preview-error">
                <div className="svg-error">
                    <p>SVG Parsing Error</p>
                    <div>{error}</div>
                </div>
              </div>
            )}
      </div>
    );
};
