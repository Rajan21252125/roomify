import Button from 'components/ui/Button';
import { generate3DView } from 'lib/ai.action';
import { Box, RefreshCw, Share2, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router';

const Visualizer = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const { initialImage, initialRendered, name } = location.state || {};

    const hasInitialGenerated = useRef(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [currentImage, setCurrentImage] = useState<string | null>(initialRendered || null);

    const handleBack = () => navigate("/");

    const runGeneration = async () => {
        if (!initialImage) return;
        setIsProcessing(true);
        try {
            const result = await generate3DView({ sourceImage: initialImage });
            if (result.renderedImage) {
                setCurrentImage(result.renderedImage);
            }
        } catch (error) {
            console.error("Error generating 3D view:", error);
        } finally {
            setIsProcessing(false);
        }
    }

    useEffect(() => {
        if (hasInitialGenerated.current || !initialImage) return

        if (initialRendered) {
            setCurrentImage(initialRendered);
            hasInitialGenerated.current = true;
            return;
        }

        hasInitialGenerated.current = true;
        runGeneration();
    }, [initialImage, initialRendered]);
    return (
        <div className='visualizer'>
            <nav className='topbar'>
                <div className="brand">
                    <Box className="logo" />
                    <span className='brand-text'>Roomify</span>
                </div>

                <Button variant='ghost' size='sm' onClick={handleBack} className='exit'>
                    <X className="icon" />
                    <span>Exit Editor</span>
                </Button>
            </nav>

            <section className='content'>
                <div className="panel">
                    <div className="panel-header">
                        <div className="panel-meta">
                            <p>Project</p>
                            <h2>{name}</h2>
                            <p className='note'>Created By You</p>
                        </div>
                        <div className="panel-action">
                            <Button size="sm" onClick={() => { }} className='share'>
                                <Share2 className="w-4 h-4 mr-2" />
                                <span>Share</span>
                            </Button>
                        </div>
                    </div>
                    <div className={`render-area ${isProcessing ? 'is-processing' : ''}`}>
                        {currentImage ? (
                            <img src={currentImage} alt="AI render room" className='render-img' />
                        ) : (
                            <div className="render-placeholder">
                                {initialImage && (
                                    <img src={initialImage} alt="original image" className='render-fallback' />
                                )}
                            </div>
                        )}
                        {isProcessing && (
                            <div className="render-overlay">
                                <div className="rendering-card">
                                    <RefreshCw className='spinner' />
                                    <span className='title'>Rendering...</span>
                                    <span className='subtitle'>Generating 3D view of your room</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    )
}

export default Visualizer