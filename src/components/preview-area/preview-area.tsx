import { useEffect, useRef, useState } from "react";
import './preview-area.css'
import SvgDownloader from "../svg-downloader/svg-downloader";
import { IconButton, Tooltip } from "@mui/material";
import { ContentCopy } from "@mui/icons-material";
import useToolTipCopyText from "../hooks/copyTooltip.hook";


interface PreviewAreaProps {
    code: string;
  }

export const PreviewArea = ({code}: PreviewAreaProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [error, setError] = useState<string | null>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const [text, changeText] = useToolTipCopyText();
    // todo: implement zooming
  
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
        svgElement.style.transform = `translate(${position.x}px, ${position.y}px)`;
        svgElement.style.transformOrigin = 'center';
        svgElement.style.transition = 'transform 0.2s ease-out';
        
        // svgElement.style.filter = 'drop-shadow(0px 2px 8px rgba(0, 0, 0, 0.1))';
        
        svgElement.style.maxWidth = 'none';
        svgElement.style.maxHeight = 'none';
        
        containerRef.current.appendChild(svgElement);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Unknown error');
      }
    }, [code, position]);
  
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
  
    return (
        <div className="preview-wrapper">
            <div className="preview-header">
                <h2>SVG Preview</h2>
                <div className="preview-buttons">
                  {/* todo remove outline */}
                  <Tooltip title={text}>
                    <IconButton onClick={handleCopy} >
                      <ContentCopy fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <SvgDownloader svgContent={code} error={error}/>
                  {/* todo: backgound color toggler */}
                </div>
            </div>
            <div className={error ? "preview-error" : "preview-content"}>
              {/* todo: support multiple icons */}
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
                
                {error && (
                    <div className="svg-error">
                        <p>SVG Parsing Error</p>
                        <div>{error}</div>
                    </div>
                )}
            </div>
      </div>
    );
};
