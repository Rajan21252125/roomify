import { CheckCircle2, ImageIcon, UploadIcon } from 'lucide-react';
import React, { useState } from 'react';
import { useOutletContext } from 'react-router';
import { PROGRESS_INCREMENT, PROGRESS_INTERVAL_MS, REDIRECT_DELAY_MS } from "lib/constant";

interface UploadProps {
  onComplete?: (file: string) => void;
}

const Upload = ({ onComplete }: UploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const { isSignedIn } = useOutletContext<AuthContext>();

  const intervalRef = React.useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }
  }, []);

  const processFile = (file: File) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    const reader = new FileReader();
    reader.onerror = (e) => {
      console.log("Error reading file", e);
      setProgress(0);
      setFile(null);
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };

    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      let currentProgress = 0;

      intervalRef.current = setInterval(() => {
        currentProgress += PROGRESS_INCREMENT;

        if (currentProgress >= 100) {
          currentProgress = 100;
          if (intervalRef.current) clearInterval(intervalRef.current);
          setProgress(100);

          timeoutRef.current = setTimeout(() => {
            onComplete?.(base64);
          }, REDIRECT_DELAY_MS);
        } else {
          setProgress(currentProgress);
        }
      }, PROGRESS_INTERVAL_MS);
    };

    reader.readAsDataURL(file);
    setFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (!isSignedIn) return;

    const droppedFile = e.dataTransfer.files?.[0];
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (droppedFile && allowedTypes.includes(droppedFile.type)) {
      processFile(droppedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isSignedIn) return;

    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  return (
    <div className='upload'>
      {!file ? (
        <div
          className={`dropzone ${isDragging ? 'is-dragging' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            className='drop-input'
            accept='.jpeg,.png,.jpg'
            disabled={!isSignedIn}
            onChange={handleFileChange}
          />
          <div className='drop-content'>
            <div className="drop-icon">
              <UploadIcon size={20} />
            </div>
            <p>
              {isSignedIn ? (
                <>
                  <span className='highlight'>Click to upload</span> or drag and drop
                </>
              ) : (
                <>
                  <span className='highlight'>Sign in</span> to upload your floor plan
                </>
              )}
            </p>
            <p className='help'>Supports JPG, PNG format up to 50MB</p>
          </div>
        </div>
      ) : (
        <div className='upload-status'>
          <div className="status-content">
            <div className="status-icon">
              {progress === 100 ? <CheckCircle2 className='check' /> : <ImageIcon className='image' />}
            </div>
            <h3>
              {file.name}
            </h3>
            <div className="progress">
              <div className="bar" style={{ width: `${progress}%` }} />
              <p className="status-text">
                {progress < 100 ? 'Analyzing your floor plan' : 'Redirecting....'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Upload