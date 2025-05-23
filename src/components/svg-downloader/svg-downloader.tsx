import { Button } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import en from '../../assets/locales/en.json'

interface SvgDownloaderProps {
    svgContent: string;
    error: string | null;
    fileName?: string;
    downloadCB?: () => void;
}
// todo handle filename
const SvgDownloader = ({ svgContent, error, downloadCB, fileName = 'SVG_viewer_result.svg' }: SvgDownloaderProps) => {
  const handleDownload = () => {
    if (!svgContent) return
    // Создаём Blob из строки SVG
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });

    // Генерируем временный URL для Blob
    const url = URL.createObjectURL(blob);

    // Создаём временную ссылку
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;

    // Добавляем ссылку в документ и эмулируем клик
    document.body.appendChild(link);
    link.click();

    // Удаляем ссылку и освобождаем ресурсы
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    downloadCB && downloadCB()
  };

  return (
    
    <Button
      variant="contained"
      startIcon={<DownloadIcon />}
      onClick={handleDownload}
  // @ts-ignore
      disabled={svgContent.trim() === '' || error?.length && error.length > 0}
    >
      {en.previewArea.downloadBtn}
    </Button>
    // <Tooltip title={'Download .svg file'}>
    // {/* todo remove outline */}
    //   <IconButton onClick={handleDownload} >
    //     <DownloadIcon fontSize="small" />
    //   </IconButton>
    // </Tooltip>
  );
};

export default SvgDownloader;