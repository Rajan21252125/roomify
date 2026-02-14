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

  const processFile = (file: File) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      let currentProgress = 0;

      const interval = setInterval(() => {
        currentProgress += PROGRESS_INCREMENT;

        if (currentProgress >= 100) {
          currentProgress = 100;
          clearInterval(interval);
          setProgress(100);

          setTimeout(() => {
            if (onComplete) {
              onComplete(base64);
            }
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
    if (droppedFile) {
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